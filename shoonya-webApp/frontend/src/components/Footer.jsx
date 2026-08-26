import { Link } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import Newsletter from './Newsletter'
import {
  ChevronDown,
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
  YoutubeIcon,
} from './icons'

const COLUMNS = [
  {
    head: 'Shop',
    links: [
      { to: '/shop?category=ghee', label: 'A2 Ghee' },
      { to: '/shop?category=honey', label: 'Raw Honey' },
      { to: '/shop?category=cold-pressed-oils', label: 'Cold-Pressed Oils' },
      { to: '/shop?category=dals-and-pulses', label: 'Dals & Pulses' },
      { to: '/shop?category=combos', label: 'Combos' },
    ],
  },
  {
    head: 'Company',
    links: [
      { to: '/story', label: 'Our Story' },
      { to: '/story#methodology', label: 'Sourcing & Quality' },
      { to: '/story#impact', label: 'Community Impact' },
      { to: '/shop', label: 'All Products' },
    ],
  },
  {
    head: 'Support',
    links: [
      { href: 'mailto:hello@shoonyafarms.com', label: 'hello@shoonyafarms.com' },
      { href: 'tel:+919000000000', label: '+91 90000 00000' },
      { to: '/account/orders', label: 'Track an order' },
      { note: 'Mon–Sat, 9am–6pm IST' },
    ],
  },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/', Icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com/', Icon: FacebookIcon },
  { label: 'YouTube', href: 'https://youtube.com/', Icon: YoutubeIcon },
  { label: 'WhatsApp', href: 'https://wa.me/919000000000', Icon: WhatsappIcon },
]

export default function Footer() {
  // The columns are <details>, and `open` is an attribute rather than a style —
  // so "expanded on desktop, collapsed on a phone" cannot be expressed in CSS
  // and has to be decided here.
  const isDesktop = useMediaQuery('(min-width: 721px)')

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="brand brand--light" aria-label="Shoonya Farms home">
            <img
              src="/logo.svg"
              alt="Shoonya Farms"
              className="brand__mark"
              width="40"
              height="42"
            />
          </Link>
          <p className="footer__tag">
            Chemical-free, hand-milled &amp; cold-pressed staples — brought to your kitchen
            straight from the farm, the way nature intended.
          </p>
          <div className="footer__badges">
            <span>Chemical-Free</span>
            <span>Lab-Tested</span>
            <span>Bilona Method</span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <details className="footer__col" key={col.head} open={isDesktop}>
            {/* Above 720px the panel is always open and the marker is hidden, so
                a click on the heading must not shut it. */}
            <summary onClick={(e) => isDesktop && e.preventDefault()}>
              <div className="footer__colhead">
                <h4>{col.head}</h4>
                <ChevronDown aria-hidden="true" />
              </div>
            </summary>
            <div className="footer__links">
              {col.links.map((link) => {
                if (link.note)
                  return (
                    <p className="footer__note" key={link.note}>
                      {link.note}
                    </p>
                  )
                if (link.to)
                  return (
                    <Link to={link.to} key={link.label}>
                      {link.label}
                    </Link>
                  )
                return (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                )
              })}
            </div>
          </details>
        ))}

        <Newsletter />
      </div>

      <div className="footer__bar">
        <span>© {new Date().getFullYear()} Shoonya Farms. Made with care in India.</span>
        <span className="footer__legal">
          <a href="#!">Privacy</a>
          <a href="#!">Terms</a>
          <a href="#!">Shipping &amp; Returns</a>
        </span>
        <span className="footer__social">
          {SOCIAL.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon aria-hidden="true" />
            </a>
          ))}
        </span>
      </div>
    </footer>
  )
}
