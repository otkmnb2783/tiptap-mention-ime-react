import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

const extensions = [
  StarterKit.configure({
    heading: false,
    horizontalRule: false,
  }),
];

export function toHtml(content: JSONContent): string {
  return generateHTML(content, extensions);
}
