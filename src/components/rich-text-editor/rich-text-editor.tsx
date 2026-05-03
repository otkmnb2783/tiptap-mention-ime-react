"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { buildExtensions } from "@/lib/rich-text-extensions";
import { cn } from "@/lib/utils";
import { Toolbar } from "./toolbar";

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
          "max-h-48 min-h-32 overflow-y-auto px-4 py-3 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div
      className={cn(
        "min-h-32 overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        className,
      )}
    >
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
