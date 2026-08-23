const MESSAGES = [
  "🌿 100% Chemical-Free & Lab-Tested",
  "🚚 Free shipping on orders over ₹999",
  "🐄 Bilona & Hand-Milled, the old way",
  "🍯 Raw, unprocessed & single-origin",
];

export default function AnnounceBar() {
  const loop = [...MESSAGES, ...MESSAGES];
  return (
    <div className="announce">
      <div className="announce__notice" role="status">
        This is a demo-purpose page, not to be used for business purposes.
      </div>
      <div className="announce__track">
        {loop.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
