import Link from "next/link";

function NavItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="dp-nav-item">
      {/* Horizontal top-left */}
      <span className="dp-bx dp-bx-h dp-bx-tl" />
      {/* Horizontal top-right */}
      <span className="dp-bx dp-bx-h dp-bx-tr" />
      {/* Horizontal bottom-left */}
      <span className="dp-bx dp-bx-h dp-bx-bl" />
      {/* Horizontal bottom-right */}
      <span className="dp-bx dp-bx-h dp-bx-br" />
      {/* Vertical top-left */}
      <span className="dp-bx dp-bx-v dp-bx-tl" />
      {/* Vertical top-right */}
      <span className="dp-bx dp-bx-v dp-bx-tr" />
      {/* Vertical bottom-left */}
      <span className="dp-bx dp-bx-v dp-bx-bl" />
      {/* Vertical bottom-right */}
      <span className="dp-bx dp-bx-v dp-bx-br" />
      <span className="dp-nav-label">{children}</span>
    </span>
  );
}

export function Navbar() {
  return (
    <>
      <style>{`
        .dp-nav-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }
        .dp-nav-label {
          position: relative;
          z-index: 1;
        }
        /* Base bracket styles */
        .dp-bx {
          position: absolute;
          background: #f6f6f6;
          transition: transform 1s cubic-bezier(0.87, 0, 0.13, 1);
        }
        /* Horizontal bars: 5px wide × 1px tall */
        .dp-bx-h {
          width: 5px;
          height: 1px;
        }
        /* Vertical bars: 1px wide × 5px tall */
        .dp-bx-v {
          width: 1px;
          height: 5px;
        }
        /* Horizontal default: collapsed (scaleX = 0) */
        .dp-bx-h.dp-bx-tl { right: 40px; bottom: 22px; transform-origin: right center; transform: scaleX(0); }
        .dp-bx-h.dp-bx-tr { left: 40px;  bottom: 22px; transform-origin: left center;  transform: scaleX(0); }
        .dp-bx-h.dp-bx-bl { right: 40px; top: 22px;    transform-origin: right center; transform: scaleX(0); }
        .dp-bx-h.dp-bx-br { left: 40px;  top: 22px;    transform-origin: left center;  transform: scaleX(0); }
        /* Vertical default: collapsed (scaleY = 0) */
        .dp-bx-v.dp-bx-tl { right: 44px; bottom: 18px; transform-origin: center bottom; transform: scaleY(0); }
        .dp-bx-v.dp-bx-tr { left: 44px;  bottom: 18px; transform-origin: center bottom; transform: scaleY(0); }
        .dp-bx-v.dp-bx-bl { right: 44px; top: 18px;    transform-origin: center top;    transform: scaleY(0); }
        .dp-bx-v.dp-bx-br { left: 44px;  top: 18px;    transform-origin: center top;    transform: scaleY(0); }
        /* Hover: reveal all brackets */
        .dp-nav-item:hover .dp-bx-h { transform: scaleX(1); }
        .dp-nav-item:hover .dp-bx-v { transform: scaleY(1); }
      `}</style>

      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "10.8px",
          color: "#f6f6f6",
          pointerEvents: "none",
        }}
      >
        {/* Upper bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "20px 20px 0px",
            width: "100%",
            height: 38,
            position: "relative",
            whiteSpace: "nowrap",
            pointerEvents: "auto",
          }}
        >
          {/* Left wrap — DN-PRD */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: 477.5,
              height: 18,
              position: "relative",
            }}
          >
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              <NavItem>DN-PRD</NavItem>
            </Link>
          </div>

          {/* Dead center column */}
          <div style={{ display: "block", width: 405, height: 0 }} />

          {/* Right wrap — CONTACT + ARCHIVE */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: "62px",
              width: 477.5,
              height: 18,
              position: "relative",
            }}
          >
            <NavItem>CONTACT</NavItem>
            <Link
              href="/archive"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <NavItem>ARCHIVE</NavItem>
            </Link>
          </div>
        </div>

        {/* Lower bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: 0,
          }}
        >
          <div style={{ width: 700 }} />
          <div style={{ width: 700 }} />
        </div>
      </div>
    </>
  );
}
