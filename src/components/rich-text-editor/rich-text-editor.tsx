"use client";

import Mention from "@tiptap/extension-mention";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";

import { mentionItems } from "@/lib/mention-items";
import { buildExtensions } from "@/lib/rich-text-extensions";
import { cn } from "@/lib/utils";

import { createMentionSuggestion } from "./mention/suggestion";
import { Toolbar } from "./toolbar";

export interface RichTextEditorProps {
  className?: string;
  content: JSONContent;
  onChange: (json: JSONContent) => void;
}

export function RichTextEditor({
  className,
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: buildExtensions({
      additionalExtensions: [
        Mention.configure({
          HTMLAttributes: {
            class: "mention",
          },
          suggestion: createMentionSuggestion(mentionItems),
        }),
      ],
    }),
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
