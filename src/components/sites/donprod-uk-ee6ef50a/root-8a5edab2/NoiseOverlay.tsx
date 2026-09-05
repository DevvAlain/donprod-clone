export function NoiseOverlay() {
  return (
    <div
      className="dp-noise-overlay"
      style={{
        position: "fixed",
        top: -160,
        right: -160,
        bottom: -160,
        left: -160,
        width: "calc(100vw + 320px)",
        height: "calc(100vh + 320px)",
        zIndex: 100,
        backgroundImage:
          'url("/sites/donprod-uk-ee6ef50a/shared/noise.webp")',
        backgroundRepeat: "repeat",
        backgroundSize: "1000px 1000px",
        opacity: 0.04,
        pointerEvents: "none",
        animation: "dp-noise-drift 8s ease-in-out infinite",
      }}
    />
  );
}
