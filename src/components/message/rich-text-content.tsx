import type { JSONContent } from "@tiptap/core";

import { toHtml } from "@/lib/rich-text-content";

interface RichTextContentProps {
  content: JSONContent;
}

export function RichTextContent({ content }: RichTextContentProps) {
  return (
    <div
      className="space-y-1 [&_p]:min-h-6 [&_p]:whitespace-pre-wrap [&_p]:leading-7"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Tiptap JSON を schema / extensions 経由で HTML に変換して表示するため
      dangerouslySetInnerHTML={{ __html: toHtml(content) }}
    />
  );
}
