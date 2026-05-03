"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { MentionItem } from "@/lib/mention-items";
import { cn } from "@/lib/utils";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  command: (attrs: { id: string; label: string }) => void;
  items: MentionItem[];
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  function MentionList({ command, items }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const itemCount = items.length;

    useEffect(() => {
      setSelectedIndex((current) => {
        if (itemCount === 0) return 0;
        return Math.min(current, itemCount - 1);
      });
    }, [itemCount]);

    useEffect(() => {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];

        if (!item) return;

        command({ id: item.id, label: item.label });
      },
      [command, items],
    );

    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }) => {
          if (itemCount === 0) return false;

          if (event.key === "ArrowUp") {
            setSelectedIndex((current) => {
              return (current + itemCount - 1) % itemCount;
            });
            return true;
          }

          if (event.key === "ArrowDown") {
            setSelectedIndex((current) => {
              return (current + 1) % itemCount;
            });
            return true;
          }

          if (event.key === "Enter") {
            selectItem(selectedIndex);
            return true;
          }

          return false;
        },
      }),
      [itemCount, selectItem, selectedIndex],
    );

    return (
      <div className="w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {items.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground text-sm">
                見つかりませんでした
              </p>
            ) : (
              items.map((item, index) => (
                <button
                  className={cn(
                    "flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm outline-none transition-colors",
                    index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/60",
                  )}
                  key={item.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectItem(index);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  },
);

export default MentionList;
