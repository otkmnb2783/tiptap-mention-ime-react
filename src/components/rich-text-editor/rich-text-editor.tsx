"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { buildExtensions } from "@/lib/rich-text-extensions";
import { cn } from "@/lib/utils";

export interface RichTextEditorProps {
  content: JSONContent;
  onChange: (json: JSONContent) => void;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: buildExtensions(),
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "max-h-48 min-h-24 overflow-y-auto px-4 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div
      className={cn("rounded-md border border-border bg-background", className)}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
