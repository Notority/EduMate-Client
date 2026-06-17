import { useState, useEffect } from 'react';

export function useBattery() {
  const [level, setLevel] = useState(85);

  useEffect(() => {
    const id = setInterval(() => {
      setLevel((prev) => (prev <= 10 ? 99 : prev - 1));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return level;
}
