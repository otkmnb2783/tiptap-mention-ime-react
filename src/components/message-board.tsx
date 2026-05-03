"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";

import { MessageComposer } from "./message/message-composer";
import { MessageList } from "./message/message-list";
import type { Message, MessageAuthor } from "./message/types";

const emptyContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const authors: MessageAuthor[] = [
  { id: "u_akari", name: "Akari" },
  { id: "u_haruto", name: "Haruto" },
  { id: "u_mei", name: "Mei" },
  { id: "u_ren", name: "Ren" },
];

function pickAuthor(): MessageAuthor {
  return authors[Math.floor(Math.random() * authors.length)] ?? authors[0];
}

export function MessageBoard() {
  const [content, setContent] = useState<JSONContent>(emptyContent);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = () => {
    setMessages((current) => [
      ...current,
      {
        author: pickAuthor(),
        content,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
      },
    ]);
    setContent(emptyContent);
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-4">
      <MessageList messages={messages} />
      <MessageComposer
        content={content}
        editorKey={messages.length}
        onChange={setContent}
        onPost={handlePost}
      />
    </div>
  );
}
