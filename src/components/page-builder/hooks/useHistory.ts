import { useState, useCallback, useRef } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface HistoryAction {
  type: "add" | "delete" | "move" | "update" | "duplicate";
  description: string;
  timestamp: number;
}

interface UseHistoryOptions<T> {
  maxHistory?: number;
  onStateChange?: (state: T, action: HistoryAction) => void;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions<T> = {}
) {
  const { maxHistory = 50, onStateChange } = options;
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });
  const [lastAction, setLastAction] = useState<HistoryAction | null>(null);

  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);

  const setState = useCallback(
    (newState: T, action: HistoryAction) => {
      if (isUndoingRef.current || isRedoingRef.current) {
        // Don't track history during undo/redo operations
        setHistory((prev) => ({
          ...prev,
          present: newState,
        }));
        return;
      }

      const newAction = {
        ...action,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const newPast = [...prev.past, prev.present].slice(-maxHistory);
        return {
          past: newPast,
          present: newState,
          future: [],
        };
      });

      setLastAction(newAction);

      if (onStateChange) {
        onStateChange(newState, newAction);
      }
    },
    [maxHistory, onStateChange]
  );

  const undo = useCallback(() => {
    if (history.past.length === 0) return null;

    isUndoingRef.current = true;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    const newFuture = [history.present, ...history.future];

    setHistory({
      past: newPast,
      present: previous,
      future: newFuture,
    });

    setLastAction({
      type: "update",
      description: "Undo",
      timestamp: Date.now(),
    });

    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);

    return previous;
  }, [history]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return null;

    isRedoingRef.current = true;

    const next = history.future[0];
    const newPast = [...history.past, history.present];
    const newFuture = history.future.slice(1);

    setHistory({
      past: newPast,
      present: next,
      future: newFuture,
    });

    setLastAction({
      type: "update",
      description: "Redo",
      timestamp: Date.now(),
    });

    setTimeout(() => {
      isRedoingRef.current = false;
    }, 0);

    return next;
  }, [history]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
    setLastAction(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
    setLastAction(null);
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearHistory,
    lastAction,
    historySize: history.past.length + history.future.length + 1,
  };
}
