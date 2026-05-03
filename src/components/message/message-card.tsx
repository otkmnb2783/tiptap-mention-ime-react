import { RichTextContent } from "./rich-text-content";

import type { Message } from "./types";

interface MessageCardProps {
  message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <article className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-sm">{message.author.name}</span>
        <time
          className="text-muted-foreground text-xs"
          dateTime={message.createdAt}
        >
          {new Intl.DateTimeFormat("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(message.createdAt))}
        </time>
      </div>
      <RichTextContent content={message.content} />
      <details className="rounded-md bg-muted/50 px-3 py-2">
        <summary className="cursor-pointer text-muted-foreground text-xs">
          JSON を表示
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto text-xs">
          {JSON.stringify(message.content, null, 2)}
        </pre>
      </details>
    </article>
  );
}
