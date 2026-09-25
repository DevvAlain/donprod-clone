"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, useInView } from "framer-motion";
import { DonprodProject } from "@/types/donprod";

interface Props {
  project: DonprodProject;
}

type Still = DonprodProject["stills"][number];

const SPORTY = '"Sporty Pro Black", sans-serif';
const MONO = '"IBM Plex Mono", monospace';
const EASE = [0.16, 1, 0.3, 1] as const;

function StillImage({
  still,
  style,
  alt = "",
}: {
  still: Still;
  style?: CSSProperties;
  alt?: string;
}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(imageRef, { once: true, margin: "-12% 0px" });
  return (
    <motion.div
      ref={imageRef}
      initial={{ clipPath: "inset(14% 0 14% 0)" }}
      animate={isInView ? { clipPath: "inset(0% 0 0% 0)" } : undefined}
      transition={{ duration: 1, ease: EASE }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}>
      {still.placeholder ? (
        <img
          src={still.placeholder}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(5px)",
            transform: "scale(1.04)",
          }}
        />
      ) : null}
      {still.backgroundImage ? (
        <img
          src={still.backgroundImage}
          alt={alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}
    </motion.div>
  );
}

function OffsetStill({
  still,
  aspectRatio,
  width,
  left = "0%",
  padding = "0 0 20vh",
}: {
  still: Still;
  aspectRatio: number;
  width: string;
  left?: string;
  padding?: string;
}) {
  return (
    <div style={{ padding }}>
      <div
        className="proj-lrg-offset__wrapper"
        style={{
          position: "relative",
          width,
          marginLeft: left,
          aspectRatio: `${aspectRatio} / 1`,
        }}>
        <StillImage still={still} />
      </div>
    </div>
  );
}

function SplitSection({
  stills,
  quote,
  aspectRatio,
}: {
  stills: Still[];
  quote: string[];
  aspectRatio: number;
}) {
  if (
    stills.length < 2 ||
    quote.length < 2 ||
    (!quote[0]?.trim() && !quote[1]?.trim())
  )
    return null;
  const words = (text: string) =>
    text.split(/\s+/).map((word, index) => (
      <div key={`${word}-${index}`} className="split-q-w__wrapper">
        <span className="split-quote-word">{word}&nbsp;</span>
      </div>
    ));
  return (
    <div
      className="proj-split__wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        fontWeight: 800,
        justifyContent: "flex-start",
        lineHeight: 0.8,
        paddingBottom: "10vh",
      }}>
      <div
        className="split-row__wrapper proj-upper-split__wrapper"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: SPORTY,
          fontSize: "4vw",
          fontStretch: "extra-condensed",
          fontWeight: 800,
          lineHeight: 0.8,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}>
        <div
          className="split-img__wrapper"
          style={{
            flex: "0 0 45%",
            aspectRatio: `${aspectRatio} / 1`,
            paddingRight: "5vw",
            position: "relative",
          }}>
          <StillImage still={stills[0]} />
        </div>
        <div
          className="split-quote__wrapper"
          style={{ transform: "translateY(-16.25px)" }}>
          {words(quote[0])}
        </div>
      </div>
      <div
        className="split-row__wrapper proj-lower-split__wrapper hollow-text"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          top: 0,
          fontFamily: SPORTY,
          fontSize: "4vw",
          fontStretch: "extra-condensed",
          fontWeight: 800,
          lineHeight: 0.8,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}>
        <div
          className="split-quote__wrapper"
          style={{ flex: "0 0 40%", whiteSpace: "normal" }}>
          {words(quote[1])}
        </div>
        <div
          className="split-img__wrapper"
          style={{
            transform: "translateY(-32.5px)",
            flex: "0 0 60%",
            aspectRatio: `${aspectRatio} / 1`,
            paddingLeft: "5vw",
            position: "relative",
          }}>
          <StillImage still={stills[1]} />
        </div>
      </div>
    </div>
  );
}

function MinorQuoteSection({
  still,
  quote,
  aspectRatio,
}: {
  still?: Still;
  quote: string[];
  aspectRatio: number;
}) {
  if (!still || quote.length < 2 || (!quote[0]?.trim() && !quote[1]?.trim()))
    return null;
  return (
    <div
      className="minor-quote-ele__wrapper"
      style={{ margin: "0vh 0px 10vh" }}>
      <div className="mquote__wrapper">
        <span className="min-q__wrapper">
          {quote[0].split(/\s+/).map((word, index) => (
            <div key={`${word}-${index}`}>
              <span>{word}&nbsp;</span>
            </div>
          ))}
        </span>
        <span className="min-q__wrapper hollow-text">
          {quote[1].split(/\s+/).map((word, index) => (
            <div key={`${word}-${index}`}>
              <span>{word}&nbsp;</span>
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
            aspectRatio: `${aspectRatio} / 1`,
          }}>
          <StillImage still={still} />
        </div>
      </div>
    </div>
  );
}

function GalleryGrid({
  project,
  onOpen,
}: {
  project: DonprodProject;
  onOpen: (index: number, element: HTMLElement) => void;
}) {
  const rows = Array.from(
    { length: Math.ceil(project.stills.length / 3) },
    (_, row) => project.stills.slice(row * 3, row * 3 + 3),
  );
  return (
    <div
      className="project_gallery_grid__wrapper"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "min(100vw, 100dvh)",
      }}>
      <div
        className="proj_mini_section__wrapper"
        style={{
          alignSelf: "stretch",
          textAlign: "center",
          fontFamily: MONO,
          fontSize: "max(10px,.75vw)",
          fontWeight: 100,
          paddingBottom: 30,
        }}>
        <span>GALLERY</span>
      </div>
      <div
        className="gal_expander"
        style={{
          position: "absolute",
          inset: "0 0 auto",
          height: "100%",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="proj_grid__row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}>
          {row.map((still, columnIndex) => {
            const index = rowIndex * 3 + columnIndex;
            return (
              <button
                key={index}
                type="button"
                className="proj_grid_still__wrapper"
                aria-label={`Open ${project.title} still ${index + 1}`}
                onClick={(event) => onOpen(index, event.currentTarget)}
                style={{
                  display: "flex",
                  width: "100%",
                  margin: 2,
                  overflow: "hidden",
                  aspectRatio: `${project.aspectRatio} / 1`,
                  border: 0,
                  padding: 0,
                  background: "transparent",
                  cursor: "zoom-in",
                  transition: "transform 1.25s cubic-bezier(.87,0,.13,1)",
                }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    overflow: "hidden",
                  }}>
                  <StillImage
                    still={still}
                    alt={`${project.title} still ${index + 1}`}
                    style={{
                      transition: "transform .35s ease, filter .25s ease",
                    }}
                  />
                </div>
              </button>
            );
          })}
          {row.length < 3 && row.length === 2 && (
            <div
              className="proj_grid_empty__wrapper"
              aria-hidden="true"
              style={{
                position: "relative",
                width: "100%",
                margin: 2,
                aspectRatio: `${project.aspectRatio} / 1`,
                overflow: "hidden",
              }}>
              <img
                alt=""
                aria-hidden="true"
                src={row[0].backgroundImage}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  opacity: 0,
                }}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="815"
                height="233"
                viewBox="0 0 815 233"
                fill="none"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  maxWidth: "45%",
                  height: "auto",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                <path
                  d="M529.988 12.2081C529.455 5.84812 535.908 1.59482 541.521 0.701488C553.948 -0.591845 566.481 0.341457 578.948 0.128124C588.255 0.221457 598.068 -1.00521 606.828 2.91479C613.721 5.82145 618.135 12.1281 623.295 17.2348C641.041 35.1948 657.735 54.2615 676.761 70.9015C671.615 50.5548 663.668 31.0348 658.335 10.7415C657.708 4.64815 664.175 0.728145 669.521 0.274812C684.255 -0.0585215 699.001 -0.0851816 713.721 0.448152C719.321 0.501485 725.241 3.62146 727.081 9.16812C755.068 79.0081 784.921 148.075 814.095 217.421C814.855 221.115 812.535 224.688 809.615 226.768C804.348 230.675 797.228 231.101 791.015 229.608C775.388 225.901 759.761 222.141 744.268 217.928C737.441 216.048 730.241 214.821 724.188 210.928C715.561 205.555 709.281 197.381 702.361 190.101C685.215 172.101 668.241 153.942 651.428 135.635C639.895 123.528 629.455 110.408 617.268 98.9548C617.375 101.248 617.628 103.528 618.001 105.821C622.588 127.515 628.095 149.008 632.281 170.795C633.308 175.168 628.975 178.528 625.135 179.328C620.695 180.635 616.268 178.875 612.095 177.515C594.375 171.848 576.868 165.515 559.201 159.728C554.148 157.995 549.055 154.101 548.548 148.421C542.068 103.061 535.521 57.7015 529.988 12.2081Z"
                  fill="white"
                />
                <path
                  d="M98.253 5.18111C102.32 3.72777 106.68 3.92777 110.933 3.92777C162.04 3.48777 213.16 3.91443 264.266 3.75443C270.72 3.7011 278.64 6.48779 280.466 13.3678C279.306 24.5678 276.813 35.5811 274.866 46.6611C269.24 80.9678 263.64 115.274 258.786 149.714C257.84 156.354 251.64 160.634 245.733 162.688C173.666 188.208 100.933 211.981 27.0396 231.674C20.3596 233.421 13.0263 233.061 6.7463 230.074C2.11963 228.008 -0.947036 222.554 0.266297 217.554C23.5996 148.968 53.2663 82.7678 84.0796 17.2878C86.4663 11.2078 92.173 7.06111 98.253 5.18111ZM150.106 40.9678C145.693 41.9011 143.386 46.3278 142.013 50.2078C132.826 75.8078 123.733 101.448 115.2 127.288C112.826 134.661 109.72 141.981 109.44 149.848C112.52 150.088 115.68 150.341 118.68 149.408C135.453 144.808 152.106 139.728 168.52 133.954C174.426 132.168 180.853 129.381 183.573 123.421C188.946 111.648 190.306 98.6078 193.973 86.3011C197.506 71.3544 202.306 56.6878 204.546 41.4744C194.786 39.3678 184.773 40.5411 174.906 40.3144C166.64 40.2344 158.293 39.5411 150.106 40.9678Z"
                  fill="white"
                />
                <path
                  d="M322.107 6.24822C326.213 4.80822 330.627 5.06157 334.893 5.00823C383.373 4.86157 431.84 4.9549 480.307 4.92824C486.44 4.7549 493.6 8.12822 495.04 14.5816C497.093 27.5016 497.6 40.6082 499.267 53.5682C502.8 83.3149 506.053 113.088 509.653 142.822C511.093 151.808 501.973 158.982 493.64 159.022C433.64 159.848 373.613 159.662 313.613 158.795C305.813 158.435 294.253 155.155 294.48 145.528C299.373 102.502 304.933 59.5149 311.88 16.7549C312.507 11.4082 317.32 7.80822 322.107 6.24822ZM372.867 50.7816C372.027 70.4349 369.493 90.0349 370.293 109.728C373.733 111.782 377.387 113.995 381.533 114.088C394 114.555 406.48 114.848 418.96 114.702C424.173 114.648 429.427 113.928 434.307 111.982C435.653 101.368 434.067 90.7016 433.88 80.0749C433.2 67.5416 433.893 54.8882 431.773 42.4749C424.347 39.3282 416.147 39.9682 408.28 39.9149C398.44 39.9949 388.533 39.1281 378.76 40.5949C374.227 41.5149 373.187 46.8883 372.867 50.7816Z"
                  fill="white"
                />
                <path
                  d="M291.734 226.275C292.908 214.329 294.161 202.395 296.001 190.542C307.681 190.529 319.361 190.382 331.041 190.595C334.588 190.515 337.854 193.849 337.534 197.435C337.374 202.155 337.174 206.889 336.534 211.582C336.268 214.329 333.708 216.675 330.948 216.715C322.854 217.062 314.734 216.755 306.628 216.862C306.308 219.982 305.961 223.102 305.601 226.249C300.974 226.395 296.361 226.409 291.734 226.275ZM308.068 200.889C307.961 202.209 307.774 204.849 307.681 206.182C313.054 206.182 318.441 206.195 323.828 206.035C323.921 204.729 324.081 202.115 324.174 200.809C318.801 200.809 313.428 200.809 308.068 200.889Z"
                  fill="white"
                />
                <path
                  d="M352.773 225.608C352.947 214.088 353.547 202.568 354.52 191.088C364.853 189.675 375.28 190.968 385.667 190.421C389.733 190.021 394.747 192.008 395.707 196.381C396.227 202.008 396.187 207.741 395.667 213.381C394.613 215.275 392.48 216.101 390.773 217.261C392.72 220.061 394.453 223.021 395.773 226.168C391.467 226.408 387.147 226.368 382.827 226.408C380.653 223.275 378.6 220.075 376.547 216.861C373.12 216.835 369.707 216.848 366.293 216.888C366.187 219.955 366.053 223.035 365.92 226.115C361.547 226.195 357 227.221 352.773 225.608ZM367.027 200.781C366.88 202.568 366.773 204.368 366.707 206.168C372.093 206.181 377.493 206.168 382.893 206.181C382.893 204.381 382.92 202.595 382.96 200.821C377.64 200.808 372.333 200.848 367.027 200.781Z"
                  fill="white"
                />
                <path
                  d="M413.787 191.168C422.52 189.741 431.493 190.808 440.333 190.501C444.787 190.088 449.507 193.515 449.773 198.128C450.373 205.501 450.72 212.901 451.16 220.288C451.693 223.141 449.36 226.101 446.467 226.235C437.72 226.555 428.947 226.368 420.2 226.341C415.573 226.541 411.32 222.381 411.427 217.755C411.173 210.528 411.08 203.288 411.107 196.061C410.893 194.048 412.08 192.128 413.787 191.168ZM424.28 200.821C424.373 205.688 424.48 210.568 424.56 215.461C428.92 215.461 433.28 215.501 437.654 215.475C437.36 210.581 437.107 205.701 436.907 200.808C432.693 200.821 428.48 200.808 424.28 200.821Z"
                  fill="white"
                />
                <path
                  d="M465.879 190.755C477.359 190.408 488.839 190.262 500.319 190.742C505.266 190.902 508.266 195.928 508.732 200.395C509.106 206.582 510.372 212.702 510.612 218.915C510.639 222.995 506.692 226.262 502.786 226.368C491.319 226.368 479.852 226.502 468.399 226.222C467.492 214.408 466.186 202.608 465.879 190.755ZM479.426 200.822C479.892 205.702 480.372 210.595 480.852 215.488C486.266 215.488 491.679 215.488 497.092 215.488C496.572 210.608 496.026 205.728 495.532 200.862C490.159 200.822 484.786 200.808 479.426 200.822Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ProjectGallery({ project }: Props) {
  const stills = project.stills;
  const content = project.content;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );
  const galleryRef = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeGallery = useCallback(() => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setLightboxImage(null);
    transitionTimer.current = setTimeout(() => setExpandedIndex(null), 950);
  }, []);

  const openGallery = useCallback((index: number, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    setFocusedElement(element);
    setLightboxImage({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
    setExpandedIndex(index);
  }, []);

  const moveGallery = useCallback(
    (direction: 1 | -1) => {
      setExpandedIndex((current) =>
        current === null
          ? null
          : (current + direction + stills.length) % stills.length,
      );
      setLightboxImage(null);
    },
    [stills.length],
  );

  useEffect(() => {
    if (expandedIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowRight") moveGallery(1);
      if (event.key === "ArrowLeft") moveGallery(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [expandedIndex, closeGallery, moveGallery]);

  useEffect(() => {
    if (expandedIndex !== null) return;
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
    focusedElement?.focus();
  }, [expandedIndex, focusedElement]);

  useEffect(
    () => () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      document.body.style.overflow = "";
    },
    [],
  );

  const variableStills = stills.length > 2 ? stills.slice(2, -1) : [];
  const finalStill = stills.length > 2 ? stills[stills.length - 1] : undefined;
  const count = variableStills.length;
  const hasMinorQuote =
    content.minorQuote?.some((quote) => quote.trim()) ?? false;
  const showLargeOffset = count === 1 || count >= 3;
  const showSplit =
    count >= 2 && content.splitQuote?.some((quote) => quote.trim());
  const showPostSplit = count >= 4;
  const showMinor = count >= 5 && hasMinorQuote;
  const extrasStart = showMinor ? 5 : 4;
  const extras = variableStills.slice(extrasStart);
  const extraOffsetPattern: Array<[string, string]> = [
    ["52.0785%", "10%"],
    ["53.7575%", "46.2425%"],
    ["78.6703%", "2.31848%"],
  ];

  return (
    <>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}to{transform:translateX(-100%)}}@keyframes swap{0%,50%{left:0}50.01%,to{left:100%}}.rolling_image__wrapper{position:relative;width:100%}.foreground_image__wrapper{height:auto;left:50%;margin-bottom:35vh;margin-top:35vh;overflow:hidden;position:relative;transform:translateX(-50%);width:50%}.foreground_image__wrapper>div{height:auto;width:100%}.ticker-wrap{font-family:${SPORTY};font-size:4.5vw;font-stretch:condensed;font-weight:600;line-height:.8;margin:0 auto;position:absolute;text-transform:uppercase;top:50%;white-space:nowrap;width:100%}.first_ticker{color:var(--light-color);transform:translateY(-100%)}.second_ticker{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--light-color);color:var(--dark-color);transform:translateY(0)}.ticker{animation:marquee 60s linear infinite;display:inline-block}.item-collection-1{animation:swap 60s linear infinite;left:0;position:relative}.item{display:inline-block}.proj-split__wrapper{display:flex;flex-direction:column;font-weight:800;justify-content:flex-start;line-height:.8;padding-bottom:10vh}.proj-split__wrapper span{line-height:.85}.split-quote-word{display:inline-block}.split-quote__wrapper{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;text-align:center;width:100%}.split-q-w__wrapper{overflow:hidden}.split-row__wrapper{align-items:center;display:flex;flex-direction:row;font-family:${SPORTY};font-size:4vw;font-stretch:extra-condensed;font-weight:bolder;justify-content:space-between;text-transform:uppercase;white-space:nowrap}.split-img__wrapper{display:flex;flex-direction:column;justify-content:space-between;position:relative}.minor-quote-ele__wrapper{position:relative}.mquote__wrapper{align-items:flex-start;display:flex;flex-direction:column;font-family:${SPORTY};font-stretch:condensed;font-weight:700;justify-content:center;left:0;line-height:.9;position:absolute;text-transform:uppercase;top:50%;transform:translateY(-50%);z-index:2}.min-q__wrapper{display:flex;flex-direction:row}.mquote__wrapper>span:first-child{font-size:5vw}.mquote__wrapper>span:last-child{font-size:3.5vw}.mquote-img__wrapper{height:auto;position:relative;width:100%;z-index:1}.proj_img_quote__wrapper{margin-bottom:40vh;margin-top:40vh;position:relative;width:100%}.proj_imgq_img__wrapper{overflow:hidden;position:relative;width:65%}.proj_imgq_img__wrapper>div{height:100%;width:100%}.proj_imgq_quote__wrapper{align-items:flex-end;display:flex;flex-direction:column;font-family:${SPORTY};font-size:7.5vw;font-stretch:condensed;font-weight:600;justify-content:flex-start;position:absolute;right:0;top:0}.proj_imgq_quote__wrapper>span{line-height:.91;position:relative;right:0;top:0;transform:translateY(-50%);white-space:nowrap}.l-q__wrapper{display:flex;flex-direction:row}.hollow-text{-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--light-color);color:transparent}@media(max-width:767px){.project_gallery__wrapper{margin-top:42px!important;padding:0 16px 80px!important}.split-row__wrapper{flex-direction:column!important;gap:24px!important;font-size:7vw!important;white-space:normal!important}.split-img__wrapper,.split-quote__wrapper{flex-basis:auto!important;width:100%;padding:0!important;transform:none!important}.proj-lrg-offset__wrapper{width:100%!important;margin-left:0!important}.foreground_image__wrapper{width:100%!important;margin-top:12vh;margin-bottom:12vh}.proj_imgq_img__wrapper{width:100%!important}.proj_img_quote__wrapper{margin-top:16vh;margin-bottom:16vh}.proj_grid__row{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <div
        ref={galleryRef}
        className="project_gallery__wrapper"
        style={{
          marginTop: 0,
          padding: "0 60px 240px",
          overflow: "hidden",
          textTransform: "uppercase",
        }}>
        <div className="gallery_content__wrapper">
          {stills[0] && (
            <div
              className="proj-item_full__wrapper"
              style={{ position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: `${project.aspectRatio} / 1`,
                  position: "relative",
                }}>
                <StillImage still={stills[0]} alt={project.title} />
              </div>
              {content.heroQuote?.some((quote) => quote.trim()) && (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textAlign: "center",
                    paddingTop: 10,
                    color: "var(--dp-unselected-light, #c0c0c0)",
                    fontFamily: MONO,
                    fontSize: "max(10px,.6vw)",
                    textTransform: "uppercase",
                  }}>
                  <span>{content.heroQuote[0] ?? ""}</span>
                  {content.heroQuote[1]?.trim() && (
                    <span
                      style={{
                        position: "absolute",
                        top: "calc(100% + 5px)",
                        right: "50%",
                        transform: "translateX(50%)",
                        whiteSpace: "nowrap",
                      }}>
                      {content.heroQuote[1]}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {content.rollingTitle?.some((text) => text.trim()) && stills[1] && (
            <div className="rolling_image__wrapper">
              {[content.rollingTitle[0], content.rollingTitle[1]].map(
                (text, index) =>
                  text?.trim() ? (
                    <div
                      key={`${text}-${index}`}
                      className={`ticker-wrap ${index === 0 ? "first_ticker" : "second_ticker"}`}>
                      <div className="ticker">
                        <span className="item-collection-1">
                          {Array.from({ length: 4 }, (_, itemIndex) => (
                            <span className="item" key={`first-${itemIndex}`}>
                              {text}&nbsp;
                            </span>
                          ))}
                        </span>
                        <span className="item-collection-2">
                          {Array.from({ length: 4 }, (_, itemIndex) => (
                            <span className="item" key={`second-${itemIndex}`}>
                              {text}&nbsp;
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  ) : null,
              )}
              <div
                className="foreground_image__wrapper"
                style={{
                  position: "relative",
                  aspectRatio: `${project.aspectRatio} / 1`,
                }}>
                <StillImage still={stills[1]} />
              </div>
            </div>
          )}
          {!showSplit && showLargeOffset && variableStills[0] && (
            <OffsetStill
              still={variableStills[0]}
              aspectRatio={project.aspectRatio}
              width="80%"
              left="20%"
              padding="0 0 20vh"
            />
          )}
          {showSplit && (
            <SplitSection
              stills={
                count === 2
                  ? variableStills.slice(0, 2)
                  : variableStills.slice(1, 3)
              }
              quote={content.splitQuote}
              aspectRatio={project.aspectRatio}
            />
          )}
          {showPostSplit && variableStills[3] && (
            <OffsetStill
              still={variableStills[3]}
              aspectRatio={project.aspectRatio}
              width="100%"
              left="0%"
              padding="0 3% 35vh 2%"
            />
          )}
          {showMinor && (
            <MinorQuoteSection
              still={variableStills[4]}
              quote={content.minorQuote}
              aspectRatio={project.aspectRatio}
            />
          )}
          {extras.length > 0 && (
            <div className="extra_content__wrapper">
              {extras.map((still, index) => {
                const [width, left] =
                  extraOffsetPattern[index % extraOffsetPattern.length];
                return (
                  <OffsetStill
                    key={`${still.backgroundImage}-${index}`}
                    still={still}
                    aspectRatio={project.aspectRatio}
                    width={width}
                    left={left}
                    padding={index === extras.length - 1 ? "0" : "0 0 20vh"}
                  />
                );
              })}
            </div>
          )}
          {content.lastQuote?.some((quote) => quote.trim()) && finalStill && (
            <div
              className="proj_img_quote__wrapper"
              style={{ position: "relative", width: "100%" }}>
              <div
                className="proj_imgq_img__wrapper"
                style={{ aspectRatio: `${project.aspectRatio} / 1` }}>
                <StillImage still={finalStill} />
              </div>
              <div className="proj_imgq_quote__wrapper">
                <span className="l-q__wrapper">
                  {content.lastQuote[0].split(/\s+/).map((word, i) => (
                    <div key={`${word}-${i}`}>
                      <span>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
                <span
                  className="l-q__wrapper hollow-text"
                  style={{ WebkitTextStrokeWidth: 2 }}>
                  {content.lastQuote[1].split(/\s+/).map((word, i) => (
                    <div key={`${word}-${i}`}>
                      <span>{word}&nbsp;</span>
                    </div>
                  ))}
                </span>
              </div>
            </div>
          )}
          {stills.length > 0 && (
            <GalleryGrid project={project} onOpen={openGallery} />
          )}
        </div>
      </div>
      {expandedIndex !== null && stills[expandedIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} gallery`}
          onClick={closeGallery}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,.25)",
            backdropFilter: "blur(3px) grayscale(1)",
            transition: "background .95s ease, backdrop-filter .95s ease",
          }}>
          <button
            type="button"
            aria-label="Close gallery"
            onClick={(event) => {
              event.stopPropagation();
              closeGallery();
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 2,
              border: 0,
              background: "none",
              color: "#f6f6f6",
              font: `10px ${MONO}`,
              letterSpacing: ".12em",
              cursor: "pointer",
            }}>
            CLOSE
          </button>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              moveGallery(-1);
            }}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              zIndex: 2,
              border: 0,
              background: "none",
              color: "#f6f6f6",
              font: `10px ${MONO}`,
              cursor: "pointer",
            }}>
            PREV
          </button>
          <img
            src={stills[expandedIndex].backgroundImage}
            alt={`${project.title} still ${expandedIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "absolute",
              left: lightboxImage ? lightboxImage.x : "50%",
              top: lightboxImage ? lightboxImage.y : "50%",
              width: lightboxImage?.width ?? "auto",
              height: lightboxImage?.height ?? "auto",
              maxWidth: "calc(100vw - 140px)",
              maxHeight: "calc(100dvh - 120px)",
              objectFit: "contain",
              transform: lightboxImage ? "none" : "translate(-50%, -50%)",
              transition:
                "left .95s cubic-bezier(.16,1,.3,1), top .95s cubic-bezier(.16,1,.3,1), width .95s cubic-bezier(.16,1,.3,1), height .95s cubic-bezier(.16,1,.3,1)",
            }}
          />
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              moveGallery(1);
            }}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              zIndex: 2,
              border: 0,
              background: "none",
              color: "#f6f6f6",
              font: `10px ${MONO}`,
              cursor: "pointer",
            }}>
            NEXT
          </button>
          <span
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#f6f6f6",
              font: `10px ${MONO}`,
              letterSpacing: ".12em",
            }}>
            {String(expandedIndex + 1).padStart(2, "0")} /{" "}
            {String(stills.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </>
  );
}
