import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

export const imeMentionPluginKey = new PluginKey<ImeMentionState>("imeMention");

export interface ImeMentionState {
  active: boolean;
  handingOff: boolean;
  isFullWidth: boolean;
  query: string;
  triggerPos: number | null;
}

interface ImeMentionPluginOptions {
  onHide: () => void;
  onKeyDown?: (event: KeyboardEvent) => boolean;
  onShow: (query: string, triggerPos: number, rect: DOMRect) => void;
}

const createInactiveState = (): ImeMentionState => ({
  active: false,
  handingOff: false,
  isFullWidth: false,
  query: "",
  triggerPos: null,
});

function isMentionTrigger(value: string) {
  return value === "@" || value === "＠";
}

function getTriggerPosition(view: EditorView, triggerPos: number) {
  const docSize = view.state.doc.content.size;

  if (triggerPos < 0 || triggerPos > docSize) return null;

  const triggerAt = view.state.doc.textBetween(triggerPos, triggerPos + 1);

  if (isMentionTrigger(triggerAt)) return triggerPos;

  const beforeTriggerPos = triggerPos - 1;

  if (beforeTriggerPos < 0) return null;

  const triggerBefore = view.state.doc.textBetween(
    beforeTriggerPos,
    triggerPos,
  );

  if (isMentionTrigger(triggerBefore)) return beforeTriggerPos;

  return null;
}

function getRectAtPos(view: EditorView, pos: number) {
  const coords = view.coordsAtPos(pos);

  return new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top);
}

function isImeProcessKeyEvent(event: KeyboardEvent) {
  const legacyKeyCode = (event as KeyboardEvent & { keyCode?: number }).keyCode;

  return event.key === "Process" || legacyKeyCode === 229;
}

function afterCompositionSettled(callback: () => void) {
  let firstFrame = 0;
  let secondFrame = 0;

  firstFrame = requestAnimationFrame(() => {
    secondFrame = requestAnimationFrame(callback);
  });

  return () => {
    cancelAnimationFrame(firstFrame);
    cancelAnimationFrame(secondFrame);
  };
}

export function createImeMentionPlugin({
  onHide,
  onKeyDown,
  onShow,
}: ImeMentionPluginOptions) {
  let cancelSettled: (() => void) | null = null;
  let isComposing = false;
  let isCompositionSettling = false;

  const resetMentionState = (view: EditorView) => {
    view.dispatch(
      view.state.tr.setMeta(imeMentionPluginKey, createInactiveState()),
    );
  };

  return new Plugin<ImeMentionState>({
    key: imeMentionPluginKey,

    state: {
      init: () => createInactiveState(),
      apply(transaction, previousState) {
        const meta = transaction.getMeta(imeMentionPluginKey) as
          | Partial<ImeMentionState>
          | undefined;

        if (meta) {
          return {
            ...previousState,
            ...meta,
          };
        }

        if (
          (!previousState.active && !previousState.handingOff) ||
          previousState.triggerPos === null
        ) {
          return previousState;
        }

        const mappedTriggerPos = transaction.docChanged
          ? transaction.mapping.map(previousState.triggerPos, -1)
          : previousState.triggerPos;

        if (
          mappedTriggerPos < 0 ||
          mappedTriggerPos > transaction.doc.content.size
        ) {
          return createInactiveState();
        }

        if (transaction.docChanged) {
          const triggerAt = transaction.doc.textBetween(
            mappedTriggerPos,
            mappedTriggerPos + 1,
          );
          const triggerBefore =
            mappedTriggerPos > 0
              ? transaction.doc.textBetween(
                  mappedTriggerPos - 1,
                  mappedTriggerPos,
                )
              : "";

          if (
            !isMentionTrigger(triggerAt) &&
            !isMentionTrigger(triggerBefore)
          ) {
            return createInactiveState();
          }
        }

        if (transaction.selection.from < mappedTriggerPos) {
          return createInactiveState();
        }

        return {
          ...previousState,
          triggerPos: mappedTriggerPos,
        };
      },
    },

    props: {
      handleDOMEvents: {
        compositionstart() {
          isComposing = true;
          isCompositionSettling = false;
          return false;
        },

        compositionupdate(view, event) {
          const pluginState = imeMentionPluginKey.getState(view.state);
          const composingText = (event as CompositionEvent).data ?? "";

          if (pluginState?.active && pluginState.triggerPos !== null) {
            const triggerPos = getTriggerPosition(view, pluginState.triggerPos);

            if (triggerPos === null) {
              resetMentionState(view);
              return false;
            }

            const confirmedText = view.state.doc.textBetween(
              triggerPos + 1,
              view.state.selection.from,
            );
            const composingQuery = composingText.replace(/^[@＠]/, "");
            const query = `${confirmedText}${composingQuery}`;
            const rect = getRectAtPos(view, triggerPos);

            onShow(query, triggerPos, rect);
            view.dispatch(
              view.state.tr.setMeta(imeMentionPluginKey, {
                query,
                triggerPos,
              }),
            );
            return false;
          }

          if (!isMentionTrigger(composingText.charAt(0))) {
            return false;
          }

          const query = composingText.replace(/^[@＠]/, "");
          const triggerPos = view.state.selection.from;
          const rect = getRectAtPos(view, triggerPos);

          onShow(query, triggerPos, rect);
          view.dispatch(
            view.state.tr.setMeta(imeMentionPluginKey, {
              active: true,
              handingOff: false,
              isFullWidth: composingText.startsWith("＠"),
              query,
              triggerPos,
            }),
          );
          return false;
        },

        compositionend(view) {
          const pluginState = imeMentionPluginKey.getState(view.state);

          if (!pluginState?.active) {
            isComposing = false;
            isCompositionSettling = false;
            return false;
          }

          isCompositionSettling = true;
          view.dispatch(
            view.state.tr.setMeta(imeMentionPluginKey, {
              active: false,
              handingOff: true,
            }),
          );

          cancelSettled?.();
          cancelSettled = afterCompositionSettled(() => {
            cancelSettled = null;
            isComposing = false;
            isCompositionSettling = false;

            if (view.isDestroyed) return;

            const currentState = imeMentionPluginKey.getState(view.state);

            if (!currentState?.handingOff || currentState.triggerPos === null) {
              resetMentionState(view);
              return;
            }

            const triggerPos = getTriggerPosition(
              view,
              currentState.triggerPos,
            );

            if (triggerPos === null) {
              resetMentionState(view);
              return;
            }

            if (!currentState.isFullWidth) {
              resetMentionState(view);
              return;
            }

            const query = view.state.doc.textBetween(
              triggerPos + 1,
              view.state.selection.from,
            );
            const rect = getRectAtPos(view, triggerPos);

            view.dispatch(
              view.state.tr.setMeta(imeMentionPluginKey, {
                active: true,
                handingOff: false,
                isFullWidth: true,
                query,
                triggerPos,
              }),
            );
            onShow(query, triggerPos, rect);
          });

          return false;
        },

        keydown(view, event) {
          const pluginState = imeMentionPluginKey.getState(view.state);
          const hasPopup = pluginState?.active || pluginState?.handingOff;
          const isImeInProgress =
            isComposing ||
            isCompositionSettling ||
            event.isComposing ||
            isImeProcessKeyEvent(event);

          if (hasPopup && event.key === "Escape") {
            event.preventDefault();
            onHide();
            resetMentionState(view);
            return true;
          }

          if (!["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
            return false;
          }

          if (!pluginState?.active || pluginState.triggerPos === null) {
            return false;
          }

          const triggerPos = getTriggerPosition(view, pluginState.triggerPos);

          if (triggerPos === null) {
            resetMentionState(view);
            return false;
          }

          if (pluginState.isFullWidth && isImeInProgress) {
            return false;
          }

          const handled = onKeyDown?.(event) ?? false;

          if (!handled) return false;

          event.preventDefault();
          return true;
        },
      },
    },

    view() {
      return {
        update(view) {
          const pluginState = imeMentionPluginKey.getState(view.state);

          if (!pluginState?.active && !pluginState?.handingOff) {
            onHide();
          }
        },

        destroy() {
          cancelSettled?.();
          cancelSettled = null;
          onHide();
        },
      };
    },
  });
}
