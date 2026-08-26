// Body scroll lock — shared by every overlay (cart drawer, mobile nav).
//
// Counted so overlays don't fight: the first lock wins, the last unlock releases.
//
// ─── What works on iOS Safari ────────────────────────────────────────────────
// The only technique that reliably prevents body scroll on iOS without
// side-effects is:
//
//   document.documentElement.style.overflow = 'hidden'   (<html>, not <body>)
//
// Why <html> and NOT <body>:
//   • touch-action:none on <body> blocks ALL touches on every child element
//     for as long as it is set — iOS applies the most-restrictive ancestor
//     value. Buttons with touch-action:manipulation still wait for body's
//     touch-action:none timeout (~30 seconds) before firing. This is the
//     source of the "30-second delay" bug.
//   • overflow:hidden on <body> is ignored by iOS Safari for in-progress
//     touch-scroll gestures.
//   • position:fixed on <body> causes a layout shift (page jumps to top)
//     mid-touch, landing the next tap on the wrong element.
//   • overflow:hidden on <html> IS respected by iOS Safari and does not
//     affect touch-action inheritance on any child element.
//
// Why no touchmove.preventDefault():
//   A non-passive touchmove listener on the document kills 60fps scrolling
//   everywhere while the lock is held. The <html> overflow:hidden approach
//   is cleaner and doesn't need it.
//
// Overflow at the bottom of the page:
//   Caused by lockScroll toggling overflow on <body> while base.css already
//   sets overflow-x:clip on <body>. On iOS, clip is treated as hidden, making
//   <body> a scroll container. Locking <html> instead leaves <body> untouched
//   and avoids the interaction entirely.
// ─────────────────────────────────────────────────────────────────────────────

let locks = 0;

export function lockScroll() {
  if (locks === 0) {
    document.documentElement.style.overflow = "hidden";
  }
  locks += 1;
}

export function unlockScroll() {
  if (locks === 0) return; // already balanced — never go negative
  locks -= 1;
  if (locks === 0) {
    document.documentElement.style.overflow = "";
  }
}
