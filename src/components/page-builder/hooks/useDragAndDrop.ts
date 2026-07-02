import { useState, useCallback, useRef } from "react";

interface DragAndDropOptions<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  onDragStart?: (item: T, index: number) => void;
  onDragEnd?: (item: T, fromIndex: number, toIndex: number) => void;
}

interface DragState {
  draggedIndex: number | null;
  draggedOverIndex: number | null;
  isDragging: boolean;
}

export function useDragAndDrop<T>({ items, onReorder, onDragStart, onDragEnd }: DragAndDropOptions<T>) {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOverIndex: null,
    isDragging: false,
  });

  const dragStartIndexRef = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      dragStartIndexRef.current = index;
      setDragState({
        draggedIndex: index,
        draggedOverIndex: null,
        isDragging: true,
      });

      if (onDragStart) {
        onDragStart(items[index], index);
      }

      // Set drag image and effect
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());

      // Add custom drag class
      setTimeout(() => {
        e.target.classList.add("dragging");
      }, 0);
    },
    [items, onDragStart]
  );

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    setDragState((prev) => ({
      ...prev,
      draggedOverIndex: index,
    }));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragState((prev) => ({
      ...prev,
      draggedOverIndex: index,
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset if leaving the actual drop zone, not entering a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState((prev) => ({
        ...prev,
        draggedOverIndex: null,
      }));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      const dragIndex = dragStartIndexRef.current;
      if (dragIndex === null || dragIndex === dropIndex) {
        resetDragState();
        return;
      }

      // Reorder items
      const newItems = [...items];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      onReorder(newItems);

      if (onDragEnd) {
        onDragEnd(draggedItem, dragIndex, dropIndex);
      }

      resetDragState();
    },
    [items, onReorder, onDragEnd]
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Remove drag class
    e.target.classList.remove("dragging");
    resetDragState();
  }, []);

  const resetDragState = useCallback(() => {
    dragStartIndexRef.current = null;
    setDragState({
      draggedIndex: null,
      draggedOverIndex: null,
      isDragging: false,
    });
  }, []);

  const getDraggableProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDragEnter: (e: React.DragEvent) => handleDragEnter(e, index),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
      style: {
        cursor: dragState.isDragging ? "grabbing" : "grab",
      },
    }),
    [dragState.isDragging, handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleDragEnd]
  );

  return {
    dragState,
    getDraggableProps,
    resetDragState,
  };
}
