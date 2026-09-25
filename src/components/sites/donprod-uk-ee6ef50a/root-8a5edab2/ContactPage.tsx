"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "./Navbar";
import styles from "./ContactPage.module.css";

interface ContactSettings {
  readyText: string;
  designerLabel: string;
  designerUrl: string;
  locationName: string;
  locationAddress: string;
  coordinates: string;
  footerBrand: string;
  footerDescription: string;
  copyrightYear: string;
  showreelUrl: string;
  tickerText: string;
  socialLinks: Array<{ label: string; url: string }>;
  btsImages: Array<{ imageUrl: string; publicId?: string | null }>;
}

const defaultContact: ContactSettings = {
  readyText: "READY WHEN YOU ARE.",
  designerLabel: "@DANNY.LINES",
  designerUrl: "https://www.linkedin.com/in/danny-lines-4113ab15/",
  locationName: "TOTTENHAM",
  locationAddress: "LONDON, UNITED KINGDOM",
  coordinates: "51.5072° N, 0.1276° W",
  footerBrand: "I8 STUDIO",
  footerDescription: "I8 STUDIO",
  copyrightYear: "2026",
  showreelUrl: "https://vimeo.com/1173388074",
  tickerText: "I8 STUDIO",
  socialLinks: [
    ["TIKTOK", "https://www.tiktok.com/@donprod"],
    ["YOUTUBE", "https://youtube.com/@donprod"],
    ["INSTA", "https://www.instagram.com/donprod"],
    ["EMAIL US", "mailto:doubleornothingproductions@gmail.com"],
  ].map(([label, url]) => ({ label, url })),
  btsImages: [],
};

function Control({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className={styles.control} type="button" onClick={onClick}>{children}</button>;
}

function ReadyText({ text, mobile = false }: { text: string; mobile?: boolean }) {
  return (
    <div className={mobile ? styles.mobileStatement : styles.statement} aria-label={text}>
      {text.split("").map((character, index) => (
        <span key={`${character}-${index}`} style={{ animationDelay: `${0.25 + index * 0.05}s` }}>
          {character === " " ? " " : character}
        </span>
      ))}
    </div>
  );
}

function socialLabel(label: string) {
  if (label === "INSTA") return "INSTAGRAM";
  return label;
}

function pickLink(links: Array<{ label: string; url: string }>, names: string[]) {
  return links.find((link) => names.includes(link.label.toUpperCase()));
}

function Carousel({ images, index, colour, onChange }: { images: ContactSettings["btsImages"]; index: number; colour: boolean; onChange: (direction: 1 | -1) => void }) {
  const [failed, setFailed] = useState(false);
  const image = images[index];
  useEffect(() => setFailed(false), [image?.imageUrl]);

  return (
    <div className={`${styles.btsColour} ${colour ? "" : styles.btsGrey}`}>
      <div className={styles.btsHider}>
        <div className={styles.btsStack}>
          {image && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.btsImage} src={image.imageUrl} alt={`Behind the scenes still ${index + 1}`} onError={() => setFailed(true)} />
          ) : (
            <div className={styles.btsFallback}>BTS IMAGE {String(index + 1).padStart(3, "0")}</div>
          )}
        </div>
      </div>
      <div className={styles.btsCounter}>{String(index + 1).padStart(3, "0")} / {String(Math.max(images.length, 1)).padStart(3, "0")}</div>
      <div className={styles.btsControls}>
        <Control onClick={() => onChange(-1)}>PREV</Control>
        <Control onClick={() => onChange(1)}>NEXT</Control>
      </div>
    </div>
  );
}

function Ticker({ text }: { text: string }) {
  const tickerText = `${text} `;
  return (
    <div className={styles.ticker} aria-label={text}>
      {Array.from({ length: 11 }, (_, index) => (
        <div className={`${styles.marquee} ${index % 2 ? styles.outline : ""}`} key={index}>
          <div className={styles.marqueeTrack}><span>{tickerText.repeat(3)}</span><span aria-hidden="true">{tickerText.repeat(3)}</span></div>
        </div>
      ))}
    </div>
  );
}

function ShowreelOverlay({ url, onClose }: { url: string; onClose: () => void }) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  const source = match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1&pip=0` : url;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Showreel">
      <button className={styles.overlayClose} type="button" onClick={onClose}>CLOSE</button>
      <iframe title="DONPROD showreel" src={source} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    </div>
  );
}

function ShowreelCursor({ url, disabled, onOpen }: { url: string; disabled: boolean; onOpen: () => void }) {
  const previewRefs = useRef<Array<HTMLDivElement | null>>([]);
  const target = useRef({ x: -300, y: -300 });
  const current = useRef(Array.from({ length: 5 }, () => ({ x: -300, y: -300 })));
  const frame = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];

  useEffect(() => {
    if (disabled || !url) return;

    const move = (event: MouseEvent) => {
      const interactive = (event.target as Element).closest("a, button, input, select, textarea, label, [role=button], [tabindex]");
      target.current = { x: event.clientX, y: event.clientY };
      const nextActive = event.clientY > 40 && !interactive;
      activeRef.current = nextActive;
      setActive(nextActive);
    };
    const click = (event: MouseEvent) => {
      const interactive = (event.target as Element).closest("a, button, input, select, textarea, label, [role=button], [tabindex]");
      if (activeRef.current && !interactive) onOpen();
    };
    const animate = () => {
      current.current.forEach((position, index) => {
        const easing = 0.012 + index * 0.006;
        position.x += (target.current.x - position.x) * easing;
        position.y += (target.current.y - position.y) * easing;
        const preview = previewRefs.current[index];
        if (preview) {
          const skew = Math.max(-8, Math.min(8, (target.current.x - position.x) * 0.018));
          preview.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) skewX(${skew}deg)`;
        }
      });
      frame.current = window.requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("click", click);
    frame.current = window.requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("click", click);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [disabled, onOpen, url]);

  if (!url || disabled) return null;
  return <div className={`${styles.cursorShowreelGroup} ${active ? styles.cursorShowreelActive : ""}`} aria-hidden="true">
    {Array.from({ length: 5 }, (_, index) => <div key={index} ref={(element) => { previewRefs.current[index] = element; }} className={styles.cursorShowreel}>
      {vimeoId ? <iframe title="Showreel preview" src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&background=1&dnt=1`} allow="autoplay; fullscreen" /> : <video autoPlay loop muted playsInline src={url} />}
    </div>)}
  </div>;
}

export function ContactPage() {
  const [contact, setContact] = useState<ContactSettings>(defaultContact);
  const [index, setIndex] = useState(0);
  const [colour, setColour] = useState(true);
  const [showreel, setShowreel] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const images = contact.btsImages;
  const imageCount = Math.max(images.length, 1);
  const changeImage = useCallback((direction: 1 | -1) => setIndex((current) => (current + direction + imageCount) % imageCount), [imageCount]);

  useEffect(() => {
    let active = true;
    void fetch("/api/contact").then((response) => response.ok ? response.json() : null).then((payload: { data?: ContactSettings } | null) => {
      if (active && payload?.data) setContact({ ...defaultContact, ...payload.data });
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth <= 600);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => changeImage(1), 5000);
    return () => window.clearInterval(timer);
  }, [changeImage]);

  const ticker = useMemo(() => <Ticker text={contact.tickerText} />, [contact.tickerText]);
  const socialLinks = contact.socialLinks;

  return (
    <main className={styles.contactPage}>
      <ShowreelCursor url={contact.showreelUrl} disabled={mobile || showreel} onOpen={() => setShowreel(true)} />
      <Navbar />
      <div className={styles.grid} aria-hidden="true"><span className={styles.gridTop} /><span className={styles.gridBottom} /><span className={styles.gridLeft} /><span className={styles.gridRight} /></div>
      {!mobile ? (
        <div className={styles.desktopContent}>
          <section className={`${styles.row} ${styles.upper}`}>
            <div className={styles.leftDivide}>
              <div className={styles.location}><span>{contact.locationName}</span><span>{contact.locationAddress}</span><span>{contact.coordinates}</span></div>
              <div className={styles.upperCredit}><span>DESIGN &amp; DEVELOPMENT BY</span><a href={contact.designerUrl} target="_blank" rel="noreferrer">{contact.designerLabel}</a></div>
            </div>
            <div className={styles.rightDivide}>
              <div className={styles.upperControls}><span>{String(index + 1).padStart(3, "0")} / {String(imageCount).padStart(3, "0")}</span><Control onClick={() => changeImage(1)}>NEXT</Control></div>
            </div>
          </section>
          <section className={`${styles.row} ${styles.middle}`}>
            <div className={styles.leftDivide}>
              <ReadyText text={contact.readyText} />
              <div className={styles.socials}>{socialLinks.map(({ label, url }) => <a key={label} href={url} target={url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{label}</a>)}</div>
            </div>
            <div className={`${styles.rightDivide} ${styles.btsRight}`}><Carousel images={images} index={index} colour={colour} onChange={changeImage} /></div>
          </section>
          <section className={`${styles.row} ${styles.lower}`}>
            <div className={`${styles.leftDivide} ${styles.tickerCell}`}>{ticker}</div>
            <div className={`${styles.rightDivide} ${styles.lowerRight}`}>
              <div className={styles.lowerControls}><Control onClick={() => setColour((value) => !value)}>MODE: {colour ? "COLOUR" : "MONO"}</Control><Control onClick={() => setShowreel(true)}>PREV</Control></div>
              <div className={styles.footer}><strong>{contact.footerBrand}</strong><span>{contact.footerDescription}</span></div>
              <div className={styles.rating}><button type="button" onClick={() => setRating("good")} aria-label="Rate positively">{rating === "good" ? "🔥" : "♨"}</button><button type="button" onClick={() => setRating("bad")} aria-label="Rate negatively">{rating === "bad" ? "👎" : "—"}</button><span>©{contact.copyrightYear}</span></div>
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.mobileContent}>
          <div className={styles.mobileUpper}>
            <div className={styles.mobileLogo}>
              <strong>{contact.footerBrand.replace(/\s+/g, "")}</strong>
              <span>DOUBLE OR NOTHING.</span>
            </div>
            <div className={styles.mobileLocation}>
              <span>{contact.locationName}</span>
              <span>{contact.locationAddress}</span>
              <span>{contact.coordinates}</span>
            </div>
            <div className={styles.mobileLinks}>
              <div>
                {[pickLink(socialLinks, ["YOUTUBE"]), pickLink(socialLinks, ["INSTA", "INSTAGRAM"])].map((link) =>
                  link ? (
                    <a key={link.label} href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {socialLabel(link.label)}
                    </a>
                  ) : null,
                )}
              </div>
              <div>
                {[pickLink(socialLinks, ["TIKTOK"]), pickLink(socialLinks, ["EMAIL US", "EMAIL"])].map((link) =>
                  link ? (
                    <a key={link.label} href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {socialLabel(link.label)}
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          </div>
          <div className={styles.mobileLower}>
            <div className={styles.mobileHeadingRow}>
              <ReadyText text={contact.readyText} mobile />
              <Control onClick={() => setShowreel(true)}>VIEW SHOWREEL</Control>
            </div>
            <div className={styles.mobileBts}><Carousel images={images} index={index} colour={colour} onChange={changeImage} /></div>
            <div className={styles.mobileFooter}>
              <div className={styles.mobileCredit}>
                <a href={contact.designerUrl} target="_blank" rel="noreferrer">{contact.designerLabel.replace(/^@/, "")}</a>
                <span>DESIGN &amp; DEVELOPMENT</span>
              </div>
              <div className={styles.mobilePager}>
                <span>{String(index + 1).padStart(3, "0")} / {String(imageCount).padStart(3, "0")}</span>
                <span>
                  <Control onClick={() => changeImage(-1)}>PREV</Control>
                  <Control onClick={() => changeImage(1)}>NEXT</Control>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showreel ? <ShowreelOverlay url={contact.showreelUrl} onClose={() => setShowreel(false)} /> : null}
    </main>
  );
}
