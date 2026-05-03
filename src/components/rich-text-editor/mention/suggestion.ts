import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";

import type { MentionUser } from "@/lib/mention-users";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

import MentionList, { type MentionListRef } from "./mention-list";

async function updatePosition(
  element: HTMLElement,
  clientRect: (() => DOMRect | null) | null | undefined,
) {
  const rect = clientRect?.();

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
            latestClientRect,
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
