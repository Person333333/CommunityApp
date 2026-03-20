import { useEffect, useRef } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutside<T extends HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  listenCapturing = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, listenCapturing);
    document.addEventListener('touchstart', handleClickOutside, listenCapturing);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, listenCapturing);
      document.removeEventListener('touchstart', handleClickOutside, listenCapturing);
    };
  }, [handler, listenCapturing]);

  return ref;
}
