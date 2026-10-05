import { useRef, useState } from "react";

import type { DragEvent } from "react";

export interface DragHandlers {
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  dragHandlers: DragHandlers;
}

export const useDragAndDrop = (
  onDrop: (file: File) => void,
): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const containsFiles = (e: DragEvent) => {
    return e.dataTransfer?.types?.includes("Files");
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containsFiles(e)) return;

    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containsFiles(e)) return;

    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containsFiles(e)) return;

    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containsFiles(e)) return;

    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) onDrop(file);
  };

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
