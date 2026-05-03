"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MentionUser } from "@/lib/mention-users";
import { cn } from "@/lib/utils";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  command: (attrs: { id: string; label: string }) => void;
  items: MentionUser[];
}

function getAvatarFallback(name: string) {
  return name.trim().charAt(0) || "?";
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

        command({ id: item.id, label: item.name });
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
      <div className="w-80 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {items.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground text-sm">
                候補がありません
              </p>
            ) : (
              items.map((item, index) => (
                <button
                  className={cn(
                    "flex h-14 w-full items-center gap-3 rounded-md px-3 text-left outline-none transition-colors",
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
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage alt={item.name} src={item.avatarUrl} />
                    <AvatarFallback>
                      {getAvatarFallback(item.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-sm">
                      {item.name}
                    </span>
                    <span className="block truncate text-muted-foreground text-xs">
                      @{item.username}
                    </span>
                  </span>
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
