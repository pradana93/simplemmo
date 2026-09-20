"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useActiveTick } from "@/store/useActiveTick";

export function Providers({ children }: { children: React.ReactNode }) {
  useActiveTick(true);
  const setLastSeen = useGameStore((s) => s.setLastSeen);

  useEffect(() => {
    setLastSeen(new Date().toISOString());
    const onHide = () => setLastSeen(new Date().toISOString());
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, [setLastSeen]);

  return <>{children}</>;
}
