import type { JSONContent } from "@tiptap/core";
import { generateText } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { generateHTML } from "@tiptap/html";

import { buildExtensions } from "@/lib/rich-text-extensions";

const extensions = buildExtensions({
  additionalExtensions: [
    Mention.configure({
      HTMLAttributes: {
        class: "mention",
      },
    }),
  ],
});

export function toHtml(content: JSONContent): string {
  return generateHTML(content, extensions);
}

export function extractText(content: JSONContent): string {
  return generateText(content, extensions, {
    blockSeparator: "\n",
  }).trim();
}
