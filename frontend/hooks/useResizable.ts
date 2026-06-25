import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableProps {
  initialSize: number;
  direction: 'horizontal' | 'vertical';
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
}

export const useResizable = ({
  initialSize,
  direction,
  minSize = 100,
  maxSize = 800,
  onResize,
}: UseResizableProps) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      let newSize = size;
      if (direction === 'horizontal') {
        newSize = e.clientX;
      } else {
        newSize = window.innerHeight - e.clientY;
      }

      if (newSize < minSize) newSize = minSize;
      if (newSize > maxSize) newSize = maxSize;

      setSize(newSize);
      if (onResize) {
        onResize(newSize);
      }
    },
    [isResizing, direction, minSize, maxSize, onResize, size]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return {
    size,
    isResizing,
    startResizing,
    resizeRef,
  };
};
