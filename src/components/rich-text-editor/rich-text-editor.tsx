"use client";

import type { Editor, JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef } from "react";

import { useMentionUsers } from "@/hooks/use-mention-users";
import type { MentionUser } from "@/lib/mention-users";
import { buildExtensions } from "@/lib/rich-text-extensions";
import { cn } from "@/lib/utils";

import type { ImeMentionController } from "./mention/suggestion";
import { buildMentionExtensions } from "./plugins/build-mention-extension";
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
  const editorRef = useRef<Editor | null>(null);
  const imeControllerRef = useRef<ImeMentionController | null>(null);
  const mentionUsersRef = useRef<MentionUser[]>([]);
  const { error, isLoading, users } = useMentionUsers();

  useEffect(() => {
    mentionUsersRef.current = users;
  }, [users]);

  const mentionExtensions = useMemo(() => {
    return buildMentionExtensions({
      editorRef,
      getUsers: () => mentionUsersRef.current,
      imeControllerRef,
    });
  }, []);

  const editor = useEditor({
    extensions: buildExtensions({
      additionalExtensions: mentionExtensions,
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

  useEffect(() => {
    editorRef.current = editor;

    return () => {
      if (editorRef.current !== editor) return;

      imeControllerRef.current?.hide();
      imeControllerRef.current = null;
      editorRef.current = null;
    };
  }, [editor]);

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
