// hooks/use-viewport.ts
import { useState, useEffect, useCallback, RefObject } from 'react';

export function useViewport() {
  const [isIntersecting, setIsIntersecting] = useState<Record<string, boolean>>({});

  const observer = typeof window !== 'undefined' 
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('data-viewport-id') || '';
            if (id) {
              setIsIntersecting(prev => ({
                ...prev,
                [id]: entry.isIntersecting
              }));
            }
          });
        },
        { threshold: 0.1 } // 10% visibility is considered "in view"
      )
    : null;

  const observe = useCallback((element: HTMLElement | null, id: string) => {
    if (!element || !observer) return;
    
    element.setAttribute('data-viewport-id', id);
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [observer]);

  const isInViewport = useCallback((element: HTMLElement | null, id?: string) => {
    if (!element) return false;
    
    // If a specific ID is provided, check that element's status
    if (id && id in isIntersecting) {
      return isIntersecting[id];
    }

    // Otherwise, check if the element itself is in the viewport using getBoundingClientRect
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, [isIntersecting]);

  // Clean up the observer on unmount
  useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return { observe, isInViewport };
}