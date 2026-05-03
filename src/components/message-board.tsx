"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";

import { usePostMessage } from "@/hooks/use-post-message";

import { MessageComposer } from "./message/message-composer";
import { MessageList } from "./message/message-list";
import type { Message } from "./message/types";

const emptyContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function MessageBoard() {
  const [content, setContent] = useState<JSONContent>(emptyContent);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isPosting, postMessage } = usePostMessage();

  const handlePost = async () => {
    setError(null);

    try {
      const message = await postMessage(content);

      setMessages((current) => [...current, message]);
      setContent(emptyContent);
    } catch {
      setError("投稿に失敗しました");
    }
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-4">
      <MessageList messages={messages} />
      {error ? <p className="px-1 text-destructive text-sm">{error}</p> : null}
      <MessageComposer
        content={content}
        editorKey={messages.length}
        onChange={setContent}
        onPost={handlePost}
        submitting={isPosting}
      />
    </div>
  );
}
