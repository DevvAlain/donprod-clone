import { DonprodProject } from "@/types/donprod";

interface Props {
  project: DonprodProject;
}

const TIMER_COUNT = 150;

export function ProjectMeta({ project }: Props) {
  const monoFont = '"IBM Plex Mono", monospace';
  const creditEntries = Object.entries(project.credits);

  const locationStr = Array.isArray(project.meta.location)
    ? project.meta.location.join(", ")
    : project.meta.location;

  const coordsStr =
    project.meta.coords && project.meta.coords.length > 0
      ? project.meta.coords.join(", ")
      : null;

  return (
    <div
      className="extra__wrapper"
      style={{ padding: "0px", opacity: 1, marginTop: 60 }}
    >
      <div className="video_aux__wrapper">
        {/* Timer bars */}
        <div
          className="timer__wrapper"
          style={{
            display: "flex",
            alignItems: "flex-end",
            height: 40,
            marginBottom: 24,
            overflow: "hidden",
            padding: "0 max(20px, 5vw)",
          }}
        >
          {Array.from({ length: TIMER_COUNT }, (_, i) => {
            // Bell curve / hill shape: tallest at center, shorter at edges
            const center = (TIMER_COUNT - 1) / 2;
            const dist = Math.abs(i - center) / center; // 0 at center, 1 at edges
            const scaleY = 0.25 + 0.75 * (1 - dist * dist);
            return (
              <div
                key={i}
                className="timer-line"
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 28,
                  background: "#f6f6f6",
                  margin: "0 1px",
                  verticalAlign: "bottom",
                  transformOrigin: "bottom",
                  flexShrink: 0,
                  transform: `scaleY(${scaleY})`,
                }}
              />
            );
          })}
        </div>

        {/* Main meta row — title | empty | artist */}
        <div
          className="main_meta__wrapper"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "0 max(20px, 5vw)",
            marginBottom: 40,
          }}
        >
          <div className="meta_first_col">
            <div
              className="proj-title__wrapper"
              style={{
                fontFamily: '"Sporty Pro Black", sans-serif',
                fontSize: "clamp(32px, 5vw, 72px)",
                color: "#f6f6f6",
                lineHeight: 1,
              }}
            >
              {project.title.split("").map((char, i) => (
                <span key={i} style={{ display: "inline-block" }}>
                  {char === " " ? " " : char}
                </span>
              ))}
            </div>
          </div>

          <div className="meta_second_col">&nbsp;</div>

          <div
            className="meta_third_col"
            style={{
              fontFamily: '"Sporty Pro Black", sans-serif',
              fontSize: "clamp(24px, 3.5vw, 56px)",
              color: "#f6f6f6",
              lineHeight: 1,
              textAlign: "right",
            }}
          >
            {project.artist && (
              <span>
                {project.artist.split("").map((char, i) => (
                  <span key={i} style={{ display: "inline-block" }}>
                    {char === " " ? " " : char}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Secondary meta */}
        <div
          className="secondary_meta__wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "5vw",
            padding: "0 max(20px, 5vw)",
            opacity: 1,
          }}
        >
          {/* Credits + keywords */}
          <div className="sm_left" style={{ flex: "0 0 auto" }}>
            <div className="credit__wrapper">
              {/* "CREDIT" heading */}
              <div
                className="m_title"
                style={{
                  fontFamily: monoFont,
                  fontSize: "10.8px",
                  color: "#f6f6f6",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                CREDIT
              </div>

              {/* Key-value table */}
              <div
                style={{ display: "flex", flexDirection: "row", gap: "2vw" }}
              >
                <div
                  className="meta_col_keys"
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {creditEntries.map(([key]) => (
                    <div
                      key={key}
                      className="mk"
                      style={{
                        fontFamily: monoFont,
                        fontSize: "10.8px",
                        color: "#f6f6f6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {key}
                    </div>
                  ))}
                </div>
                <div
                  className="meta_col_values"
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {creditEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="mv"
                      style={{
                        fontFamily: monoFont,
                        fontSize: "10.8px",
                        color: "#f6f6f6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div
              className="sm_keywords__wrapper"
              style={{
                marginTop: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {project.keywords.map((kw) => (
                <span
                  key={kw}
                  className="keyword_item"
                  style={{
                    fontFamily: monoFont,
                    fontSize: "10.8px",
                    color: "#868686",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Description + date / location / coords */}
          <div className="sm_right" style={{ flex: 1, paddingTop: 24 }}>
            {project.description && (
              <div
                className="sm_description__wrapper"
                style={{
                  fontFamily: monoFont,
                  fontSize: "10.8px",
                  color: "#f6f6f6",
                  marginBottom: 24,
                }}
              >
                <span>{project.description}</span>
              </div>
            )}

            <div className="meta_info_row__wrapper">
              <div className="credit__wrapper">
                <div
                  className="meta_col_values"
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {project.meta.date && (
                    <div
                      className="mv"
                      style={{
                        fontFamily: monoFont,
                        fontSize: "10.8px",
                        color: "#f6f6f6",
                      }}
                    >
                      {project.meta.date}
                    </div>
                  )}
                  {locationStr && (
                    <div
                      className="mv"
                      style={{
                        fontFamily: monoFont,
                        fontSize: "10.8px",
                        color: "#f6f6f6",
                      }}
                    >
                      {locationStr}
                    </div>
                  )}
                  {coordsStr && (
                    <div
                      className="mv"
                      style={{
                        fontFamily: monoFont,
                        fontSize: "10.8px",
                        color: "#f6f6f6",
                      }}
                    >
                      {coordsStr}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
