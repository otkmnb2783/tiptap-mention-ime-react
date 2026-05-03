import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";

import type { MentionUser } from "@/lib/mention-users";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

import MentionList, { type MentionListRef } from "./mention-list";

interface MentionCommandAttrs {
  id: string;
  label: string;
}

interface ImeMentionControllerShowOptions {
  onSelect: (attrs: MentionCommandAttrs) => void;
  query: string;
  rect: DOMRect;
  users: MentionUser[];
}

function filterMentionUsers(users: MentionUser[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return users.slice(0, 10);

  return users
    .filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.username.toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, 10);
}

async function updatePosition(element: HTMLElement, rect: DOMRect | null) {
  if (!rect) return;

  const virtualElement = {
    getBoundingClientRect: () => rect,
  };

  const { x, y } = await computePosition(virtualElement, element, {
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ["bottom-start"], padding: 8 }),
      shift({ crossAxis: true, padding: 8 }),
    ],
    placement: "top-start",
    strategy: "fixed",
  });

  if (!element.isConnected) return;

  element.style.left = `${x}px`;
  element.style.position = "fixed";
  element.style.top = `${y}px`;
  element.style.visibility = "visible";
  element.style.zIndex = "50";
}

function getClientRect(clientRect: (() => DOMRect | null) | null | undefined) {
  return clientRect?.() ?? null;
}

export class ImeMentionController {
  private component: ReactRenderer<MentionListRef> | null = null;
  private latestRect: DOMRect | null = null;
  private rafId = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private editor: Editor) {}

  private schedulePositionUpdate() {
    if (!this.component) return;

    cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(() => {
      if (!this.component) return;

      void updatePosition(
        this.component.element as HTMLElement,
        this.latestRect,
      );
    });
  }

  show({ onSelect, query, rect, users }: ImeMentionControllerShowOptions) {
    this.latestRect = rect;

    const props = {
      command: onSelect,
      items: filterMentionUsers(users, query),
    };

    if (this.component) {
      this.component.updateProps(props);
      this.schedulePositionUpdate();
      return;
    }

    lockScroll();

    this.component = new ReactRenderer(MentionList, {
      editor: this.editor,
      props,
    });

    const element = this.component.element as HTMLElement;
    element.style.pointerEvents = "auto";
    element.style.position = "fixed";
    element.style.visibility = "hidden";

    document.body.appendChild(element);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.schedulePositionUpdate();
      });
      this.resizeObserver.observe(element);
    }

    this.schedulePositionUpdate();
  }

  hide() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.latestRect = null;
    unlockScroll();
    this.component?.destroy();
    this.component?.element.remove();
    this.component = null;
  }

  isVisible() {
    return this.component !== null;
  }

  onKeyDown(event: KeyboardEvent) {
    return this.component?.ref?.onKeyDown({ event }) ?? false;
  }
}

export function createMentionSuggestion(
  getUsers: () => MentionUser[],
): Partial<SuggestionOptions<MentionUser>> {
  return {
    allowedPrefixes: [" ", "　"],
    char: "@",

    items: ({ query }) => {
      return filterMentionUsers(getUsers(), query);
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let latestClientRect: (() => DOMRect | null) | null | undefined = null;
      let resizeObserver: ResizeObserver | null = null;
      let rafId = 0;

      const schedulePositionUpdate = () => {
        if (!component) return;

        cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          if (!component) return;

          void updatePosition(
            component.element as HTMLElement,
            getClientRect(latestClientRect),
          );
        });
      };

      const destroy = () => {
        cancelAnimationFrame(rafId);
        resizeObserver?.disconnect();
        resizeObserver = null;
        unlockScroll();
        component?.destroy();
        component?.element.remove();
        component = null;
      };

      return {
        onStart(props: SuggestionProps<MentionUser>) {
          if (!props.clientRect) return;

          latestClientRect = props.clientRect;
          lockScroll();

          component = new ReactRenderer(MentionList, {
            editor: props.editor,
            props,
          });

          const element = component.element as HTMLElement;
          element.style.pointerEvents = "auto";
          element.style.position = "fixed";
          element.style.visibility = "hidden";

          document.body.appendChild(element);

          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              schedulePositionUpdate();
            });
            resizeObserver.observe(element);
          }

          schedulePositionUpdate();
        },

        onUpdate(props: SuggestionProps<MentionUser>) {
          latestClientRect = props.clientRect;
          component?.updateProps(props);
          schedulePositionUpdate();
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Escape") {
            destroy();
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          destroy();
        },
      };
    },
  };
}
