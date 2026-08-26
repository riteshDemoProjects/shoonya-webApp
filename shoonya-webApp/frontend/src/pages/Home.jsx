import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { CATEGORY_META } from '../data/catalogMeta'
import ProductCard from '../components/ProductCard'
import SmartImage from '../components/SmartImage'
import SectionHead from '../components/SectionHead'
import SplitFeature from '../components/SplitFeature'
import Reveal from '../components/Reveal'
import { unsplashSrcSet } from '../lib/img'
import {
  ArrowRight,
  CategoryIcon,
  FlaskIcon,
  LeafIcon,
  PotIcon,
  TruckIcon,
} from '../components/icons'

const HERO_IMG =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop'
const STORY_IMG =
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800&fit=crop'
const CTA_IMG =
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&h=800&fit=crop'

// Line icons rather than emoji: 🌿🐄🔬🚚 come from four different type designers
// and never sit on a shared baseline or optical weight.
const VALUES = [
  { Icon: LeafIcon, title: 'Chemical-Free', text: 'No pesticides, no preservatives, no shortcuts — ever.' },
  { Icon: PotIcon, title: 'Bilona Method', text: 'A2 ghee hand-churned from cultured curd, the ancient way.' },
  { Icon: FlaskIcon, title: 'Lab-Tested', text: 'Every batch is third-party tested for purity you can trust.' },
  { Icon: TruckIcon, title: 'Farm-to-Kitchen', text: 'Small batches, sourced direct, shipped fresh across India.' },
]

const STEPS = [
  { n: '01', title: 'Sourced with intent', text: 'We partner with small farms that never touch synthetic chemicals.' },
  { n: '02', title: 'Made the slow way', text: 'Cold-pressed, hand-milled, wood-churned — traditional methods, no heat damage.' },
  { n: '03', title: 'Tested & sealed', text: 'Lab-verified for purity, then sealed fresh to lock in nutrition.' },
]

const TRUST = [
  { Icon: LeafIcon, label: '100% chemical-free' },
  { Icon: FlaskIcon, label: 'Lab-tested, every batch' },
  { Icon: TruckIcon, label: 'Free shipping over ₹999' },
]

const STATS = [
  { v: '12,000+', l: 'Families served' },
  { v: '40+', l: 'Partner farms' },
  { v: '100%', l: 'Chemical-free' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let alive = true
    api.getProducts({ sort: 'featured' }).then((all) => {
      if (alive) setFeatured(all.filter((p) => p.featured).slice(0, 8))
    }).catch(() => {})
    api.getCategories().then((c) => {
      if (alive) setCategories(c.filter((x) => x.key !== 'all'))
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  return (
    <div className="home">
      <section className="hero">
        {/* Not SmartImage: this one fills a container of unknown ratio rather
            than reserving a box, and it is the page's largest contentful paint,
            so it is eager and high priority instead of lazy. */}
        <div className="hero__bg" aria-hidden="true">
          <img
            src={HERO_IMG}
            srcSet={unsplashSrcSet(HERO_IMG) || undefined}
            sizes="100vw"
            alt=""
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <div className="hero__inner wrap">
          <span className="eyebrow">Pure · Traditional · Chemical-Free</span>
          <h1>
            Staples from the farm,{' '}
            <em>the way nature intended.</em>
          </h1>
          <p className="hero__sub">
            Bilona ghee, raw honey, cold-pressed oils and hand-milled grains — sourced from
            small Indian farms and delivered fresh to your kitchen.
          </p>
          <div className="hero__cta">
            <Link to="/shop" className="btn btn--light">
              Shop all staples <ArrowRight />
            </Link>
            <Link to="/story" className="btn btn--outline-light">
              Our story
            </Link>
          </div>
          <ul className="hero__trust">
            {TRUST.map(({ Icon, label }) => (
              <li key={label}>
                <Icon aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <a className="hero__scroll" href="#categories">
          Scroll
          <span aria-hidden="true" />
        </a>
      </section>

      <section className="values section section--tight" aria-label="Why Shoonya">
        <div className="wrap">
          <div className="values__grid">
            {VALUES.map(({ Icon, title, text }) => (
              <div className="value" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="categories" aria-labelledby="categories-title">
        <div className="wrap">
          <SectionHead
            eyebrow="Shop by category"
            title="Find your daily essentials"
            id="categories-title"
            action={
              <Link to="/shop" className="link-arrow">
                View all <ArrowRight />
              </Link>
            }
          />
          <Reveal className="cat-grid">
            {categories.map((c) => {
              const meta = CATEGORY_META[c.name] || {}
              return (
                <Link to={`/shop?category=${c.key}`} className="cat-card" key={c.key}>
                  <span className="cat-card__mark">
                    <CategoryIcon theme={meta.theme} aria-hidden="true" />
                  </span>
                  <span className="cat-card__name">{c.name}</span>
                  <span className="cat-card__tag">
                    {meta.tag ? `${meta.tag} · ` : ''}
                    {c.count} products
                  </span>
                  <span className="cat-card__go" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </Link>
              )
            })}
          </Reveal>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="featured-title">
        <div className="wrap">
          <SectionHead
            eyebrow="Loved by our customers"
            title="Bestsellers & new arrivals"
            id="featured-title"
            action={
              <Link to="/shop" className="link-arrow">
                Shop all <ArrowRight />
              </Link>
            }
          />
          {/* --rail turns this into a horizontal swipe track on phones, where
              eight stacked cards were 2,381px of scrolling on their own. */}
          <Reveal className="grid grid--rail">
            {featured.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
            {featured.length === 0 &&
              Array.from({ length: 4 }, (_, i) => (
                <div className="card card--skeleton" key={i} aria-hidden="true" />
              ))}
          </Reveal>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="process-title">
        <div className="wrap">
          <SectionHead
            eyebrow="How it's made"
            title="Three steps, no shortcuts"
            id="process-title"
            sub="Every jar takes the long route: the right farm, the slow method, the lab report."
          />
          <div className="process__grid">
            {STEPS.map((s, i) => (
              <Reveal className="step" key={s.n} delay={i * 80}>
                <span className="step__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section section--ruled story-preview"
        id="story"
        aria-labelledby="story-preview-title"
      >
        <div className="wrap">
          <SplitFeature
            reverse
            offset
            media={
              <SmartImage
                src={STORY_IMG}
                alt="Cold-pressed oil being decanted at Shoonya Farms"
                ratio="landscape"
                sizes="(max-width: 720px) 92vw, 46vw"
                zoom
              />
            }
          >
            <span className="eyebrow">Our story</span>
            <h2 id="story-preview-title">
              Shoonya means zero — <em>zero chemicals, zero shortcuts.</em>
            </h2>
            <div className="prose">
              <p>
                We started Shoonya Farms with a simple belief: the food that nourishes us
                shouldn't come at the cost of our health or our land. So we went back to the
                source — small farms, traditional methods, and an obsession with purity.
              </p>
            </div>
            <div className="story-preview__stats">
              {STATS.map((s) => (
                <div className="story-preview__stat" key={s.l}>
                  <strong>{s.v}</strong>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
            <Link to="/story" className="link-arrow">
              Read our full story <ArrowRight />
            </Link>
          </SplitFeature>
        </div>
      </section>

      <section className="band" aria-labelledby="home-cta-title">
        <div className="band__bg" aria-hidden="true">
          <img
            src={CTA_IMG}
            srcSet={unsplashSrcSet(CTA_IMG, [768, 1280, 1920]) || undefined}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="band__inner wrap">
          <span className="eyebrow">Rated 4.8/5 by 12,000+ families</span>
          <h2 id="home-cta-title">
            Real food, delivered <em>with care.</em>
          </h2>
          <p>Join thousands of families who've made the switch to chemical-free staples.</p>
          <div className="band__actions">
            <Link to="/shop" className="btn btn--light">
              Start shopping <ArrowRight />
            </Link>
            <Link to="/story" className="btn btn--outline-light">
              How we source
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
