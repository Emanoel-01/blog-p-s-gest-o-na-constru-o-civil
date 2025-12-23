import { useEffect, useRef } from 'react';

/**
 * Hook para detectar inatividade e disparar callback
 */
export function useInactivityDetector(callback, timeout = 60000) {
  const timeoutRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      hasTriggeredRef.current = false;
      
      timeoutRef.current = setTimeout(() => {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          callback();
        }
      }, timeout);
    };

    // Eventos que resetam o timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Iniciar timer
    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [callback, timeout]);
}