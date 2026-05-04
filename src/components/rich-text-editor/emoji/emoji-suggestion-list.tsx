"use client";

import type { EmojiItem } from "@tiptap/extension-emoji";
import { forwardRef, useImperativeHandle, useState } from "react";

import { cn } from "@/lib/utils";

export interface EmojiSuggestionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface EmojiSuggestionListProps {
  command: (item: EmojiItem) => void;
  items: EmojiItem[];
}

export const EmojiSuggestionList = forwardRef<
  EmojiSuggestionListRef,
  EmojiSuggestionListProps
>(function EmojiSuggestionList({ command, items }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  function selectItem(index: number) {
    const item = items[index];

    if (!item) return;

    command(item);
  }

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      if (event.key === "ArrowDown") {
        setSelectedIndex((index) => (index + 1) % items.length);
        return true;
      }

      if (event.key === "ArrowUp") {
        setSelectedIndex((index) => (index + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-muted-foreground text-sm shadow-md">
        候補がありません
      </div>
    );
  }

  return (
    <div className="w-72 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-md">
      {items.map((item, index) => (
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
            index === selectedIndex ? "bg-accent" : "hover:bg-accent/60",
          )}
          key={item.name}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => setSelectedIndex(index)}
          onClick={() => selectItem(index)}
          type="button"
        >
          <span className="text-base">{item.emoji}</span>
          <span className="font-medium">{item.shortcodes[0]}</span>
          <span className="truncate text-muted-foreground">{item.name}</span>
        </button>
      ))}
    </div>
  );
});
