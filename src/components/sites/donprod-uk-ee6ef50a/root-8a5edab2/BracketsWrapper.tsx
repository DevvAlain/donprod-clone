import React from "react";

function SvgVerticalLine() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2"
      height="39"
      viewBox="0 0 2 39"
      fill="none"
    >
      <path
        stroke="var(--light-color)"
        d="M1 0.499512C1 0.499512 0.998052 17 0.998808 40.0003"
      />
    </svg>
  );
}

function SvgBentCorner({ extraStyle }: { extraStyle?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="43"
      viewBox="0 0 5 43"
      fill="none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        transform: "translate3d(100%, 0px, 0px)",
        ...extraStyle,
      }}
    >
      <path
        stroke="var(--light-color)"
        d="M0.5 41C0.5 41 0.507528 18.5001 0.505722 0.037319"
      />
    </svg>
  );
}

function TopLeftCorner() {
  return (
    <div style={{ width: 40, height: 40 }}>
      <div
        style={{
          transformOrigin: "left top",
          transform: "scale(1)",
          position: "relative",
          width: 40,
          height: 40,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            transform:
              "rotate(90deg) scaleX(-1) translate3d(calc(100% - 2px), 1px, 0px)",
          }}
        >
          <SvgVerticalLine />
        </div>
        <div style={{ transform: "scaleY(-1) rotate(180deg)", position: "relative" }}>
          <SvgBentCorner />
        </div>
      </div>
    </div>
  );
}

function BottomLeftCorner() {
  return (
    <div style={{ width: 40, height: 40 }}>
      <div
        style={{
          transformOrigin: "left bottom",
          height: 40,
          width: 40,
          transform: "scale(1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            transform:
              "rotate(270deg) scaleX(-1) scaleY(-1) translate3d(100%, 1px, 0px)",
          }}
        >
          <SvgVerticalLine />
        </div>
        <div
          style={{
            transform: "scaleY(-1) scaleX(-1) translateY(-1px)",
            width: 40,
            height: 40,
            position: "absolute",
          }}
        >
          <SvgBentCorner extraStyle={{ transform: "translate3d(100%, 0px, 0px) scaleY(1)" }} />
        </div>
      </div>
    </div>
  );
}

function TopRightCorner() {
  return (
    <div style={{ width: 40, height: 40 }}>
      <div
        style={{
          transformOrigin: "right top",
          height: 40,
          width: 40,
          transform: "scale(1)",
          position: "relative",
        }}
      >
        <SvgBentCorner />
        <div
          style={{
            display: "flex",
            transform:
              "rotate(270deg) translate3d(calc(100% - 2px), 1px, 0px)",
          }}
        >
          <SvgVerticalLine />
        </div>
      </div>
    </div>
  );
}

function BottomRightCorner() {
  return (
    <div style={{ width: 40, height: 40 }}>
      <div
        style={{
          transformOrigin: "right bottom",
          height: 40,
          width: 40,
          transform: "scale(1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 0,
            transform: "rotate(90deg) scaleY(-1) translate3d(100%, 1px, 0px)",
          }}
        >
          <SvgVerticalLine />
        </div>
        <div
          style={{
            transform: "scaleY(1) scaleX(-1) rotate(180deg)",
            width: 40,
            height: 40,
            position: "absolute",
          }}
        >
          <SvgBentCorner extraStyle={{ transform: "translate(100%, -1px)" }} />
        </div>
      </div>
    </div>
  );
}

export function BracketsWrapper({ zIndex = 4, offset = 0 }: { zIndex?: number; offset?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -offset,
        left: -offset,
        width: offset === 0 ? "100%" : `calc(100% + ${2 * offset}px)`,
        height: offset === 0 ? "100%" : `calc(100% + ${2 * offset}px)`,
        pointerEvents: "none",
        zIndex,
      }}
    >
      {/* Left side */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TopLeftCorner />
        <BottomLeftCorner />
      </div>
      {/* Right side */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TopRightCorner />
        <BottomRightCorner />
      </div>
    </div>
  );
}
