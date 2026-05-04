"use client";

import type { Editor } from "@tiptap/react";
import type { EmojiClickData } from "emoji-picker-react";
import { EmojiStyle, Theme } from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface EmojiPopoverProps {
  editor: Editor;
}

interface SelectionAnchor {
  left: number;
  top: number;
}

interface SelectionRange {
  from: number;
  to: number;
}

function getSelectionAnchor(editor: Editor): SelectionAnchor {
  const { from, to } = editor.state.selection;
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to);

  return {
    left: (start.left + end.right) / 2,
    top: Math.min(start.top, end.top),
  };
}

export function EmojiPopover({ editor }: EmojiPopoverProps) {
  const selectionRangeRef = useRef<SelectionRange | null>(null);
  const [anchor, setAnchor] = useState<SelectionAnchor | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openEmojiPopover() {
    const { from, to } = editor.state.selection;

    selectionRangeRef.current = { from, to };
    setAnchor(getSelectionAnchor(editor));
    setIsOpen(true);
  }

  function restoreSelection() {
    const selection = selectionRangeRef.current;

    if (!selection) return;

    editor.commands.setTextSelection(selection);
  }

  function insertEmoji(emojiData: EmojiClickData) {
    restoreSelection();
    editor.chain().focus().insertContent(emojiData.emoji).run();
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {anchor ? (
        <PopoverAnchor asChild>
          <span
            aria-hidden
            className="pointer-events-none fixed size-0"
            style={{
              left: anchor.left,
              top: anchor.top,
            }}
          />
        </PopoverAnchor>
      ) : null}
      <PopoverTrigger asChild>
        <Button
          aria-label="絵文字"
          onClick={openEmojiPopover}
          onMouseDown={(event) => event.preventDefault()}
          size="icon"
          type="button"
          variant="ghost"
        >
          <SmilePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      {anchor ? (
        <PopoverContent
          align="center"
          className="w-auto overflow-hidden p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
          side="top"
          sideOffset={12}
        >
          <EmojiPicker
            autoFocusSearch={false}
            emojiStyle={EmojiStyle.NATIVE}
            height={380}
            lazyLoadEmojis
            onEmojiClick={insertEmoji}
            previewConfig={{ showPreview: false }}
            searchPlaceholder="Search emoji"
            skinTonesDisabled
            theme={Theme.AUTO}
            width={320}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  );
}
