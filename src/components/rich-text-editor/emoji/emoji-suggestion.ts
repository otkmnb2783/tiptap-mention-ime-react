import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import type { EmojiItem } from "@tiptap/extension-emoji";
import { gitHubEmojis } from "@tiptap/extension-emoji";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";

import {
  EmojiSuggestionList,
  type EmojiSuggestionListRef,
} from "./emoji-suggestion-list";

function searchEmoji(query: string): EmojiItem[] {
  const normalizedQuery = query.toLowerCase();

  return gitHubEmojis
    .filter((emoji) => {
      if (!normalizedQuery) return true;

      return (
        emoji.name.toLowerCase().includes(normalizedQuery) ||
        emoji.shortcodes.some((shortcode) =>
          shortcode.toLowerCase().includes(normalizedQuery),
        ) ||
        emoji.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    })
    .slice(0, 8);
}

export const emojiSuggestion: Partial<SuggestionOptions<EmojiItem>> = {
  char: ":",

  items({ query }) {
    return searchEmoji(query);
  },

  render() {
    let component: ReactRenderer<EmojiSuggestionListRef> | null = null;
    let popup: HTMLDivElement | null = null;

    async function updatePosition(props: SuggestionProps<EmojiItem>) {
      if (!popup || !props.clientRect) return;

      const rect = props.clientRect();

      if (!rect) return;

      const virtualElement = {
        getBoundingClientRect: () => rect,
      };

      const { x, y } = await computePosition(virtualElement, popup, {
        placement: "bottom-start",
        middleware: [offset(6), flip(), shift({ padding: 8 })],
      });

      Object.assign(popup.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    }

    return {
      onStart(props) {
        popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.zIndex = "50";
        document.body.appendChild(popup);

        component = new ReactRenderer(EmojiSuggestionList, {
          editor: props.editor,
          props,
        });

        popup.appendChild(component.element);
        updatePosition(props);
      },

      onUpdate(props) {
        component?.updateProps(props);
        updatePosition(props);
      },

      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === "Escape") {
          return true;
        }

        return component?.ref?.onKeyDown(props.event) ?? false;
      },

      onExit() {
        component?.destroy();
        popup?.remove();
        component = null;
        popup = null;
      },
    };
  },
};
