"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ExpandIcon from "@/components/expand-icon";

interface CustomCursorProps {
  isActive: boolean;
}

export function CustomCursor({ isActive }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${positionRef.current.x - 12}px, ${positionRef.current.y - 12}px, 0)`;
        }
        rafRef.current = undefined;
      });
    };

    window.addEventListener("mousemove", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 will-change-transform flex items-center justify-center",
        isActive ? "opacity-100" : "opacity-0",
      )}
      style={{
        transform: "translate3d(-50vw, -50vh, 0)",
      }}
    >
      <span
        style={{
          filter: "drop-shadow(1px 1px 0 black) drop-shadow(0 0 2px black)",
        }}
      >
        <ExpandIcon size={24} color="#ffffff" strokeWidth={2} shadow={2} />
      </span>
    </div>
  );
}
