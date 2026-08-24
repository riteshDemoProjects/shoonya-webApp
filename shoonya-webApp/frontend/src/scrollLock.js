// Body scroll lock, shared by every overlay that covers the page (cart drawer,
// mobile nav).
//
// Counted rather than a plain boolean: the cart button lives in the header and
// stays tappable while the mobile menu is open, so both overlays can be open at
// once. If each one set and cleared the style for itself, whichever closed first
// would unlock the page while the other was still covering it.
//
// The lock goes on <body>, never <html>. Setting overflow:hidden on the root
// element makes the root the scroll container, which yanks the sticky header
// out of view when the menu is opened part-way down a page. Locking <body>
// instead relies on overflow propagating from <body> to the viewport, which
// only happens while <html> is `visible` — so styles.css deliberately keeps its
// overflow-x guard on <body> too.
let locks = 0;
let restoreTo = "";

export function lockScroll() {
  if (locks === 0) {
    restoreTo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;
}

export function unlockScroll() {
  if (locks === 0) return; // already balanced — never go negative
  locks -= 1;
  if (locks === 0) document.body.style.overflow = restoreTo;
}
