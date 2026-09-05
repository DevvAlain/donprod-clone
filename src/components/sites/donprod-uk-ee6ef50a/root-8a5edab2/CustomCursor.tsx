"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const circle = circleRef.current;
    if (!cursor || !circle) return;

    // Track current position for smooth updates
    let x = -100;
    let y = -100;

    function onMouseMove(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;
      // Offset by half the cursor size (10px) to center it on the pointer
      cursor!.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as Element;
      const isClickable =
        target.closest(
          'a, button, [role="button"], input, select, textarea, label, [tabindex]'
        ) !== null ||
        window.getComputedStyle(target).cursor === "pointer";

      if (isClickable) {
        circle!.style.transform = "scale(2.5)";
        circle!.style.background = "white";
        circle!.style.borderColor = "white";
      } else {
        circle!.style.transform = "scale(1)";
        circle!.style.background = "transparent";
        circle!.style.borderColor = "white";
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <div style={{ position: "static", height: 0, width: "100%" }}>
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          width: 20,
          height: 20,
          display: "flex",
          zIndex: 100000,
          top: 0,
          left: 0,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        <span
          ref={circleRef}
          id="cursor-circle"
          style={{
            display: "block",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "1px solid white",
            background: "transparent",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}
