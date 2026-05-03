"use client";

import { useCallback, useEffect, useRef } from "react";

import { MessageCard } from "./message-card";
import type { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollTop = element.scrollHeight;
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const frameId = requestAnimationFrame(scrollToBottom);

    return () => cancelAnimationFrame(frameId);
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const contentElement = contentRef.current;

    if (!scrollElement || !contentElement) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(scrollToBottom);
    });

    resizeObserver.observe(scrollElement);
    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, [scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        まだ投稿はありません
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
      <div
        className="flex min-h-full flex-col gap-3 px-1 pt-4 pb-6"
        ref={contentRef}
      >
        <div className="flex-1" />
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
