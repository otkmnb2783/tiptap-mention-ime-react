import type { Extensions } from "@tiptap/core";
import type { EmojiOptions } from "@tiptap/extension-emoji";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import StarterKit from "@tiptap/starter-kit";

export interface BuildExtensionsOptions {
  additionalExtensions?: Extensions;
  emojiSuggestion?: EmojiOptions["suggestion"];
}

export function buildExtensions({
  additionalExtensions = [],
  emojiSuggestion,
}: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
      link: {
        autolink: true,
        defaultProtocol: "https",
        linkOnPaste: true,
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      },
      paragraph: {
        HTMLAttributes: {
          class: "my-0.5",
        },
      },
      blockquote: {
        HTMLAttributes: {
          class:
            "my-2 border-l-4 border-border pl-4 text-muted-foreground italic",
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: "my-1 list-disc pl-6",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "my-1 list-decimal pl-6",
        },
      },
      listItem: {
        HTMLAttributes: {
          class: "my-1",
        },
      },
      code: {
        HTMLAttributes: {
          class:
            "rounded bg-muted px-1 py-0.5 font-mono text-muted-foreground text-sm",
        },
      },
    }),
    Emoji.configure({
      emojis: gitHubEmojis,
      ...(emojiSuggestion ? { suggestion: emojiSuggestion } : {}),
      HTMLAttributes: {
        class: "rte-emoji",
      },
    }),
    ...additionalExtensions,
  ];
}
