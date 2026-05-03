import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export interface BuildExtensionsOptions {
  additionalExtensions?: Extensions;
}

export function buildExtensions({
  additionalExtensions = [],
}: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
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
    }),
    ...additionalExtensions,
  ];
}
