import { Extension, type Extensions } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import type { Editor } from "@tiptap/react";

import type { MentionUser } from "@/lib/mention-users";

import {
  createMentionSuggestion,
  ImeMentionController,
} from "../mention/suggestion";
import { createImeMentionPlugin } from "./ime-mention-plugin";

interface MutableRef<T> {
  current: T;
}

interface BuildMentionExtensionsOptions {
  editorRef: MutableRef<Editor | null>;
  getUsers: () => MentionUser[];
  imeControllerRef: MutableRef<ImeMentionController | null>;
}

export function buildMentionExtensions({
  editorRef,
  getUsers,
  imeControllerRef,
}: BuildMentionExtensionsOptions): Extensions {
  return [
    Mention.configure({
      HTMLAttributes: {
        class: "mention",
      },
      suggestion: createMentionSuggestion(getUsers),
    }),
    Extension.create({
      name: "imeMentionBridge",
      addProseMirrorPlugins() {
        return [
          createImeMentionPlugin({
            onHide: () => {
              imeControllerRef.current?.hide();
            },
            onKeyDown: (event) => {
              if (!imeControllerRef.current?.isVisible()) return false;

              return imeControllerRef.current.onKeyDown(event);
            },
            onShow: (query, triggerPos, rect) => {
              const editor = editorRef.current;

              if (!editor) return;

              imeControllerRef.current ??= new ImeMentionController(editor);
              imeControllerRef.current.show({
                onSelect: (attrs) => {
                  const { state, view } = editor;
                  const { from } = state.selection;

                  view.dispatch(state.tr.delete(triggerPos, from));
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      attrs,
                      type: "mention",
                    })
                    .run();
                  imeControllerRef.current?.hide();
                },
                query,
                rect,
                users: getUsers(),
              });
            },
          }),
        ];
      },
    }),
  ];
}
