"use client";

import type { Editor } from "@tiptap/react";
import { Link2, Unlink2 } from "lucide-react";
import type { SyntheticEvent } from "react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LinkPopoverProps {
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

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (/^https?:\/\//.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function getSelectionText(editor: Editor) {
  const { from, to } = editor.state.selection;

  return editor.state.doc.textBetween(from, to, " ").trim();
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

export function LinkPopover({ editor }: LinkPopoverProps) {
  const selectionRangeRef = useRef<SelectionRange | null>(null);
  const [anchor, setAnchor] = useState<SelectionAnchor | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function openLinkPopover() {
    const { from, to } = editor.state.selection;

    selectionRangeRef.current = { from, to };

    const attrs = editor.getAttributes("link") as {
      href?: string;
    };
    const selectedText = getSelectionText(editor);

    setIsLink(editor.isActive("link"));
    setTitle(selectedText);
    setUrl(attrs.href ?? "");
    setAnchor(getSelectionAnchor(editor));
    setIsOpen(true);
  }

  function restoreSelection() {
    const selection = selectionRangeRef.current;

    if (!selection) return;

    editor.commands.setTextSelection(selection);
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    restoreSelection();

    const href = normalizeUrl(url);

    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsOpen(false);
      return;
    }

    const label = title.trim() || getSelectionText(editor) || href;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .insertContent({
        type: "text",
        text: label,
        marks: [
          {
            type: "link",
            attrs: {
              href,
            },
          },
        ],
      })
      .run();

    setIsOpen(false);
  }

  function handleUnlink() {
    restoreSelection();
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
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
          aria-label="リンク"
          onClick={openLinkPopover}
          onMouseDown={(event) => event.preventDefault()}
          size="icon"
          type="button"
          variant={isLink ? "secondary" : "ghost"}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      {anchor ? (
        <PopoverContent
          align="center"
          className="w-96"
          side="top"
          sideOffset={12}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <label className="font-medium text-sm" htmlFor="link-title">
                タイトル
              </label>
              <Input
                id="link-title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="リンクの表示テキスト"
                value={title}
              />
            </div>
            <div className="grid gap-1">
              <label className="font-medium text-sm" htmlFor="link-url">
                URL
              </label>
              <Input
                id="link-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                value={url}
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button
                disabled={!isLink}
                onClick={handleUnlink}
                type="button"
                variant="ghost"
              >
                <Unlink2 className="h-4 w-4" />
                解除
              </Button>
              <Button type="submit">
                <Link2 className="h-4 w-4" />
                設定
              </Button>
            </div>
          </form>
        </PopoverContent>
      ) : null}
    </Popover>
  );
}
