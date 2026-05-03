import type { JSONContent } from "@tiptap/react";
import { useState } from "react";

import { postMessageSchema } from "@/lib/rich-text-content-schema";

interface PostedMessage {
  author: {
    id: string;
    name: string;
  };
  id: string;
  content: JSONContent;
  text: string;
  createdAt: string;
}

export function usePostMessage() {
  const [isPosting, setIsPosting] = useState(false);

  const postMessage = async (content: JSONContent): Promise<PostedMessage> => {
    const input = postMessageSchema.parse({ content });

    setIsPosting(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to post message");
      }

      const data = (await response.json()) as { message: PostedMessage };
      return data.message;
    } finally {
      setIsPosting(false);
    }
  };

  return { isPosting, postMessage };
}
