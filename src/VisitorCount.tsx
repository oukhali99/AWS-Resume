import { useEffect, useState } from 'react';

export const useVisitorCount = () => {
  const [count, setCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/add-visitor`, { method: 'POST' });
        const res = await fetch(`${import.meta.env.VITE_API_URL}/get-visitor-count`);
        const data = await res.json();
        if (!cancelled) setCount(data.visitorCount);
      } catch {
        if (!cancelled) setCount(undefined);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return count;
};
