import { useState, useEffect } from "react";

const EVENT_DATE = new Date(2026, 6, 11, 8, 0, 0);

export function useCountdown() {
  const [countdown, setCountdown] = useState({
    d: "--",
    h: "--",
    m: "--",
    s: "--",
  });

  useEffect(() => {
    const update = () => {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return countdown;
}
