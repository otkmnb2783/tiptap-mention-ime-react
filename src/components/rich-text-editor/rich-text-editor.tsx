"use client";

import Mention from "@tiptap/extension-mention";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";

import { useMentionUsers } from "@/hooks/use-mention-users";
import type { MentionUser } from "@/lib/mention-users";
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
  const mentionUsersRef = useRef<MentionUser[]>([]);
  const { error, isLoading, users } = useMentionUsers();

  useEffect(() => {
    mentionUsersRef.current = users;
  }, [users]);

  const editor = useEditor({
    extensions: buildExtensions({
      additionalExtensions: [
        Mention.configure({
          HTMLAttributes: {
            class: "mention",
          },
          suggestion: createMentionSuggestion(() => mentionUsersRef.current),
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
      {isLoading ? (
        <p className="border-t px-4 py-2 text-muted-foreground text-xs">
          Mention 候補を読み込み中...
        </p>
      ) : null}
      {error ? (
        <p className="border-t px-4 py-2 text-destructive text-xs">{error}</p>
      ) : null}
    </div>
  );
}
