"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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
      <div className="w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
        <div className="max-h-40 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-3 py-2 text-muted-foreground text-sm">
              見つかりませんでした
            </p>
          ) : (
            items.map((item, index) => (
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm",
                  index === selectedIndex ? "bg-accent" : "hover:bg-accent/60",
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
                {item.label}
              </button>
            ))
          )}
        </div>
      </div>
    );
  },
);

export default MentionList;
