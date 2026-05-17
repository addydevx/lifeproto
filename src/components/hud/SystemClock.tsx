"use client";

import { useEffect, useState } from "react";

export function SystemClock() {
  const [time, setTime] = useState<string>("--:--:--");
  const [date, setDate] = useState<string>("----.--.--");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setDate(`${y}.${m}.${d}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] tracking-wider text-fg-tertiary">
      <span>SYS.{date}</span>
      <span className="text-cyan/40">//</span>
      <span className="tabular-nums text-cyan">{time}</span>
    </div>
  );
}
