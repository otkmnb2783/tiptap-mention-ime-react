import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";

import type { MentionItem } from "@/lib/mention-items";

import MentionList, { type MentionListRef } from "./mention-list";

function updatePosition(
  element: HTMLElement,
  clientRect: (() => DOMRect | null) | null | undefined,
) {
  const rect = clientRect?.();

  if (!rect) return;

  element.style.position = "fixed";
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.bottom + 4}px`;
  element.style.zIndex = "50";
}

export function createMentionSuggestion(
  items: MentionItem[],
): Partial<SuggestionOptions<MentionItem>> {
  return {
    char: "@",
    allowedPrefixes: [" ", "　"],

    items: ({ query }) => {
      return items
        .filter((item) => {
          return item.label.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 10);
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;

      return {
        onStart(props: SuggestionProps<MentionItem>) {
          component = new ReactRenderer(MentionList, {
            editor: props.editor,
            props,
          });

          const element = component.element as HTMLElement;
          document.body.appendChild(element);
          updatePosition(element, props.clientRect);
        },

        onUpdate(props: SuggestionProps<MentionItem>) {
          component?.updateProps(props);

          if (!component) return;

          updatePosition(component.element as HTMLElement, props.clientRect);
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Escape") {
            component?.destroy();
            component?.element.remove();
            component = null;
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          component?.destroy();
          component?.element.remove();
          component = null;
        },
      };
    },
  };
}
