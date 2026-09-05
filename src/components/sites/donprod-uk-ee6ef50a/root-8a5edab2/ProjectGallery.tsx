import { DonprodProject } from "@/types/donprod";

interface Props {
  project: DonprodProject;
}

/** Render a still image with a blurred placeholder. */
function StillImage({
  still,
  style,
  alt,
}: {
  still: { backgroundImage: string; placeholder: string };
  style?: React.CSSProperties;
  alt?: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={still.placeholder}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(5px)", display: "block" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={still.backgroundImage}
        alt={alt ?? ""}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 1,
        }}
      />
    </div>
  );
}

/** Horizontally scrolling ticker strip. */
function Ticker({
  text,
  direction = "left",
  hollow = false,
}: {
  text: string;
  direction?: "left" | "right";
  hollow?: boolean;
}) {
  const animation =
    direction === "left" ? "ticker-left 20s linear infinite" : "ticker-right 16s linear infinite";

  return (
    <div
      className="ticker-wrap"
      style={{
        width: "100%",
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "clamp(10px, 1.2vw, 16px)",
        color: hollow ? "transparent" : "#f6f6f6",
        WebkitTextStroke: hollow ? "1px #f6f6f6" : undefined,
        padding: "8px 0",
        borderTop: "1px solid #2a2a2a",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <div
        style={{ display: "inline-flex", animation }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} style={{ marginRight: 60, display: "inline-block" }}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

const SPORTY = '"Sporty Pro Black", sans-serif';
const QUOTE_SIZE = "clamp(20px, 3.5vw, 56px)";

export function ProjectGallery({ project }: Props) {
  const stills = project.stills;
  const content = project.content;

  // Guard: only render a section if the required still exists.
  const s = (idx: number) =>
    stills[idx] ?? { backgroundImage: "", placeholder: "" };
  const hasStill = (idx: number) => !!stills[idx]?.backgroundImage;

  return (
    <>
      <style>{`
        @keyframes ticker-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ticker-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .gallery-hollow {
          -webkit-text-stroke: 1px #f6f6f6;
          color: transparent;
        }
        .split-quote-word {
          display: inline-block;
        }
      `}</style>

      <div
        className="project_gallery__wrapper"
        style={{ marginTop: 80, overflow: "hidden" }}
      >
        <div className="gallery_content__wrapper">

          {/* ── 1. Full-width hero image with quote overlay ── */}
          {hasStill(0) && (
            <div
              className="proj-item_full__wrapper"
              style={{ aspectRatio: `${project.aspectRatio} / 1`, position: "relative", opacity: 1 }}
            >
              <StillImage still={s(0)} alt={project.title} />
              {content.heroQuote && content.heroQuote.length > 0 && (
                <div
                  className="hero_punctuator"
                  style={{ textAlign: "center", padding: "12px 0" }}
                >
                  <span
                    style={{
                      position: "relative",
                      textTransform: "uppercase",
                      paddingTop: 10,
                      color: "#868686",
                      fontWeight: 200,
                      fontSize: "max(10px, 0.6vw)",
                      whiteSpace: "normal",
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                      fontFamily: '"IBM Plex Mono", monospace',
                      gap: 8,
                    }}
                  >
                    {content.heroQuote[0]}
                    {content.heroQuote[1] && (
                      <span className="hero_punctuator__second">
                        {content.heroQuote[1]}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── 2. Rolling ticker + foreground image ── */}
          {content.rollingTitle && content.rollingTitle.length > 0 && (
            <div className="rolling_image__wrapper" style={{ margin: "20px 0" }}>
              <Ticker text={content.rollingTitle[0]} direction="left" />
              <Ticker
                text={content.rollingTitle[content.rollingTitle.length - 1]}
                direction="right"
                hollow
              />

              {/* Foreground image between tickers */}
              {hasStill(1) && (
                <div
                  className="foreground_image__wrapper"
                  style={{ position: "relative", aspectRatio: `${project.aspectRatio} / 1`, marginTop: 20 }}
                >
                  <StillImage still={s(1)} alt="" />
                </div>
              )}
            </div>
          )}

          {/* ── 3. Split section — image+quote / quote+image ── */}
          {content.splitQuote && content.splitQuote.length >= 2 && (hasStill(3) || hasStill(4)) && (
            <div className="proj-split__wrapper" style={{ margin: "60px 0" }}>
              {/* Upper row: image left, first half of quote right */}
              <div
                className="split-row__wrapper proj-upper-split__wrapper"
                style={{ display: "flex", alignItems: "center", gap: "5vw", marginBottom: 40 }}
              >
                {hasStill(3) && (
                  <div
                    className="split-img__wrapper"
                    style={{
                      flex: "0 0 45%",
                      aspectRatio: `${project.aspectRatio} / 1`,
                      position: "relative",
                      paddingRight: "5vw",
                    }}
                  >
                    <StillImage still={s(3)} alt="" />
                  </div>
                )}
                <div
                  className="split-quote__wrapper"
                  style={{
                    flex: 1,
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    color: "#f6f6f6",
                    lineHeight: 1.1,
                    transform: "translateY(-32px)",
                  }}
                >
                  {content.splitQuote[0].split(" ").map((word, i) => (
                    <div key={i} className="split-q-w__wrapper">
                      <span className="split-quote-word">{word}&nbsp;</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower row: second half of quote left (hollow), image right */}
              <div
                className="split-row__wrapper proj-lower-split__wrapper gallery-hollow"
                style={{ display: "flex", alignItems: "center", gap: "5vw" }}
              >
                <div
                  className="split-quote__wrapper"
                  style={{
                    flex: "0 0 40%",
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    lineHeight: 1.1,
                    whiteSpace: "normal",
                    color: "transparent",
                    WebkitTextStroke: "1px #f6f6f6",
                  }}
                >
                  {content.splitQuote[1].split(" ").map((word, i) => (
                    <div key={i} className="split-q-w__wrapper">
                      <span className="split-quote-word">{word}&nbsp;</span>
                    </div>
                  ))}
                </div>
                {hasStill(4) && (
                  <div
                    className="split-img__wrapper"
                    style={{
                      flex: "0 0 60%",
                      aspectRatio: `${project.aspectRatio} / 1`,
                      position: "relative",
                      transform: "translateY(-65px)",
                      paddingLeft: "5vw",
                    }}
                  >
                    <StillImage still={s(4)} alt="" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 4. Large offset image ── */}
          {hasStill(5) && (
            <div
              className="proj-lrg-offset__wrapper"
              style={{ padding: "0 3% 35vh 2%" }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: `${project.aspectRatio} / 1` }}>
                <StillImage still={s(5)} alt="" />
              </div>
            </div>
          )}

          {/* ── 5. Minor quote + offset image ── */}
          {content.minorQuote && content.minorQuote.length >= 2 && hasStill(6) && (
            <div
              className="minor-quote-ele__wrapper"
              style={{ margin: "0 0 10vh" }}
            >
              <div className="mquote__wrapper" style={{ marginBottom: 16 }}>
                <span
                  className="min-q__wrapper"
                  style={{
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    color: "#f6f6f6",
                    lineHeight: 1.1,
                    display: "block",
                  }}
                >
                  {content.minorQuote[0].split(" ").map((word, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block" }}>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
                <span
                  className="min-q__wrapper gallery-hollow"
                  style={{
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    color: "transparent",
                    WebkitTextStroke: "1px #f6f6f6",
                    lineHeight: 1.1,
                    display: "block",
                  }}
                >
                  {content.minorQuote[1].split(" ").map((word, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block" }}>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
              </div>
              <div className="mquote-img__wrapper">
                <div
                  style={{
                    position: "relative",
                    left: "35%",
                    width: "65%",
                    overflow: "hidden",
                    aspectRatio: `${project.aspectRatio} / 1`,
                  }}
                >
                  <StillImage still={s(6)} alt="" />
                </div>
              </div>
            </div>
          )}

          {/* ── 6. Extra content images (stills 7, 8, 9) ── */}
          {(hasStill(7) || hasStill(8) || hasStill(9)) && (
            <div className="extra_content__wrapper">
              {hasStill(7) && (
                <div
                  className="proj-lrg-offset__wrapper"
                  style={{ padding: "0 0 20vh 0" }}
                >
                  <div style={{ position: "relative", width: "83.97%", marginLeft: "10%", aspectRatio: `${project.aspectRatio} / 1` }}>
                    <StillImage still={s(7)} alt="" />
                  </div>
                </div>
              )}
              {hasStill(8) && (
                <div
                  className="proj-lrg-offset__wrapper"
                  style={{ padding: "0 0 20vh 0" }}
                >
                  <div style={{ position: "relative", width: "40.26%", marginLeft: "59.74%", aspectRatio: `${project.aspectRatio} / 1` }}>
                    <StillImage still={s(8)} alt="" />
                  </div>
                </div>
              )}
              {hasStill(9) && (
                <div
                  className="proj-lrg-offset__wrapper"
                  style={{ padding: 0 }}
                >
                  <div style={{ position: "relative", width: "42.91%", marginLeft: "1.22%", aspectRatio: `${project.aspectRatio} / 1` }}>
                    <StillImage still={s(9)} alt="" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 7. Bold quote + image ── */}
          {content.lastQuote && content.lastQuote.length >= 2 && hasStill(10) && (
            <div className="proj_img_quote__wrapper" style={{ position: "relative", marginBottom: 60 }}>
              <div
                className="proj_imgq_img__wrapper"
                style={{ aspectRatio: `${project.aspectRatio} / 1`, position: "relative" }}
              >
                <StillImage still={s(10)} alt="" />
              </div>
              <div
                className="proj_imgq_quote__wrapper"
                style={{ padding: "16px 0" }}
              >
                <span
                  className="l-q__wrapper"
                  style={{
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    color: "#f6f6f6",
                    lineHeight: 1.1,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  {content.lastQuote[0].split(" ").map((word, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block" }}>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
                <span
                  className="l-q__wrapper gallery-hollow"
                  style={{
                    fontFamily: SPORTY,
                    fontSize: QUOTE_SIZE,
                    color: "transparent",
                    WebkitTextStroke: "2px #f6f6f6",
                    lineHeight: 1.1,
                    display: "block",
                  }}
                >
                  {content.lastQuote[1].split(" ").map((word, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block" }}>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* ── 8. Gallery grid — all stills in 3-column rows ── */}
          {stills.length > 0 && (
            <div
              className="project_gallery_grid__wrapper"
              style={{ marginTop: 60 }}
            >
              <div
                className="proj_mini_section__wrapper"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: "10.8px",
                  color: "#f6f6f6",
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                  padding: "0 max(20px, 5vw)",
                }}
              >
                <span>GALLERY</span>
              </div>

              <div className="gal_expander" style={{ marginBottom: 8 }} />

              {/* Group stills into rows of 3 */}
              {Array.from(
                { length: Math.ceil(stills.length / 3) },
                (_, rowIdx) => {
                  const rowStills = stills.slice(rowIdx * 3, rowIdx * 3 + 3);
                  return (
                    <div
                      key={rowIdx}
                      className="proj_grid__row"
                      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginBottom: 2 }}
                    >
                      {rowStills.map((still, colIdx) => (
                        <div
                          key={colIdx}
                          className="proj_grid_still__wrapper"
                          style={{ overflow: "hidden", aspectRatio: `${project.aspectRatio} / 1` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={still.backgroundImage}
                            alt={`${project.title} still ${rowIdx * 3 + colIdx}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
