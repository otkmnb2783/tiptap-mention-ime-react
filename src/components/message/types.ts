import type { JSONContent } from "@tiptap/react";

export interface Message {
  author: MessageAuthor;
  content: JSONContent;
  createdAt: string;
  id: string;
}

export interface MessageAuthor {
  id: string;
  name: string;
}
