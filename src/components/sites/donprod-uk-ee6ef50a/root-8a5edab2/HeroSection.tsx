// Renders logo content only — positioning handled by parent (scroll section wrapper in ScrollList)
// CSS values from original: .hero_img__wrapper{height:90%} .home-logo-upper{height:100%}
// .lower-logo-wrapper{position:absolute;bottom:10%;height:13%;width:100%}
export function HeroSection() {
  return (
    /* main-hero__wrapper: position:absolute, centered in home_hero__wrapper, height:50% */
    <div
      className="main-hero__wrapper"
      id="noisy"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        width: "100%",
        height: "68%",
        zIndex: 5,
      }}
    >
      <div
        className="hero_img__wrapper"
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="home-logo-upper"
          src="/sites/donprod-uk-ee6ef50a/root-8a5edab2/images/logo-upper.png"
          alt="I8 STUDIO"
          style={{
            height: "100%",
            width: "auto",
            transform: "translate3d(0px, 0%, 0px)",
            opacity: 1,
          }}
        />
      </div>

      {/* I8 single logo — lower part hidden, upper logo is the I8 mark */}
    </div>
  );
}
