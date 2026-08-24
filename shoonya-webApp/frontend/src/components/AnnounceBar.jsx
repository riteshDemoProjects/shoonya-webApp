import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "🌿 100% Chemical-Free & Lab-Tested",
  "🚚 Free shipping on orders over ₹999",
  "🐄 Bilona & Hand-Milled, the old way",
  "🍯 Raw, unprocessed & single-origin",
];

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

export default function AnnounceBar() {
  const trackRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_MOTION);
    const onChange = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // With motion reduced there is no marquee to read, so step through the
  // messages instead. A text swap is a content change, not motion, so it
  // honours the preference — and it beats the previous behaviour, where killing
  // the animation left the track parked at translateX(0) showing one and a half
  // messages with the rest clipped off screen for good.
  useEffect(() => {
    if (!reduced) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, [reduced]);

  // The keyframes shift the track by one half of its own width. Expressing that
  // as translateX(-50%) makes the animation depend on `width: max-content`
  // resolving correctly on an off-screen-wide flex container — which is exactly
  // the kind of intrinsic-sizing edge WebKit gets wrong, and a wrong resolution
  // there means a shift of zero and a marquee that never visibly moves. Measure
  // the half-width and hand over a plain pixel value instead. Re-measured once
  // the webfonts land, since Poppins swapping in changes every span's width.
  useEffect(() => {
    if (reduced) return undefined;
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
  }, [reduced]);

  return (
    <div className="announce">
      <div className="announce__notice" role="status">
        This page is for demonstration purposes only and is not intended for business use.
      </div>
      {reduced ? (
        <div className="announce__rotator">{MESSAGES[idx]}</div>
      ) : (
        <div className="announce__track" ref={trackRef}>
          {[...MESSAGES, ...MESSAGES].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}
