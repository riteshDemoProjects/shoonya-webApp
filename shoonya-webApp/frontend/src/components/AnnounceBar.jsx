import { useEffect, useRef } from "react";

const MESSAGES = [
  "🌿 100% Chemical-Free & Lab-Tested",
  "🚚 Free shipping on orders over ₹999",
  "🐄 Bilona & Hand-Milled, the old way",
  "🍯 Raw, unprocessed & single-origin",
];

export default function AnnounceBar() {
  const trackRef = useRef(null);

  // Measure the duplicated track so the loop ends exactly where its first copy
  // begins, including after webfonts load or the viewport changes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let alive = true;
    const measure = () => {
      if (!alive || !el.isConnected) return;
      const half = Math.round(el.scrollWidth / 2);
      if (half > 0) el.style.setProperty("--marquee-shift", `${half}px`);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="announce">
      <div className="announce__notice" role="status">
        This page is for demonstration purposes only and is not intended for
        business use.
      </div>
      <div className="announce__track" ref={trackRef}>
        {[...MESSAGES, ...MESSAGES].map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
