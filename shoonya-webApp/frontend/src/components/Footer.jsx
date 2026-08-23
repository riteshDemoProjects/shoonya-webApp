import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="brand brand--light" aria-label="Shoonya Farms home">
            <img src="/logo.svg" alt="Shoonya Farms" className="brand__mark" width="44" height="46" />
          </Link>
          <p className="footer__tag">
            Chemical-free, hand-milled &amp; cold-pressed staples — brought to your kitchen
            straight from the farm, the way nature intended.
          </p>
          <div className="footer__badges">
            <span>🌿 Chemical-Free</span>
            <span>🔬 Lab-Tested</span>
            <span>🐄 Bilona Method</span>
          </div>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <Link to="/shop?category=ghee">A2 Ghee</Link>
          <Link to="/shop?category=honey">Raw Honey</Link>
          <Link to="/shop?category=cold-pressed-oils">Cold-Pressed Oils</Link>
          <Link to="/shop?category=dals-and-pulses">Dals &amp; Pulses</Link>
          <Link to="/shop?category=combos">Combos</Link>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/#story">Our Story</Link>
          <Link to="/shop">All Products</Link>
          <a href="mailto:hello@shoonyafarms.com">Contact</a>
          <a href="#!">Sourcing &amp; Quality</a>
        </div>

        <div className="footer__col">
          <h4>Get in touch</h4>
          <a href="mailto:hello@shoonyafarms.com">hello@shoonyafarms.com</a>
          <a href="tel:+919000000000">+91 90000 00000</a>
          <p className="footer__note">Mon–Sat, 9am–6pm IST</p>
        </div>
      </div>

      <div className="footer__bar">
        <span>© {new Date().getFullYear()} Shoonya Farms. Made with care in India.</span>
        <span className="footer__legal">
          <a href="#!">Privacy</a>
          <a href="#!">Terms</a>
          <a href="#!">Shipping &amp; Returns</a>
        </span>
      </div>
    </footer>
  )
}
