"use client";

import type { JSONContent } from "@tiptap/react";
import { Send } from "lucide-react";

import { RichTextEditor } from "@/components/rich-text-editor/rich-text-editor";
import { Button } from "@/components/ui/button";

interface MessageComposerProps {
  content: JSONContent;
  editorKey: number;
  onChange: (content: JSONContent) => void;
  onPost: () => void;
  submitting?: boolean;
}

export function MessageComposer({
  content,
  editorKey,
  onChange,
  onPost,
  submitting = false,
}: MessageComposerProps) {
  return (
    <div className="min-h-[196px] shrink-0 bg-background py-4">
      <div className="space-y-3 border-t border-border pt-4">
        <RichTextEditor content={content} key={editorKey} onChange={onChange} />
        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <p className="text-muted-foreground text-xs">Enter で改行できます</p>
          <Button
            className="gap-2"
            disabled={submitting}
            onClick={onPost}
            size="sm"
            type="button"
          >
            <Send className="h-4 w-4" />
            {submitting ? "投稿中" : "投稿"}
          </Button>
        </div>
      </div>
    </div>
  );
}
