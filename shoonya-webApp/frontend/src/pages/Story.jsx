import { Link } from 'react-router-dom'
import MediaCard from '../components/MediaCard'
import Reveal from '../components/Reveal'
import SectionHead from '../components/SectionHead'
import SmartImage from '../components/SmartImage'
import SplitFeature from '../components/SplitFeature'
import { unsplashSrcSet } from '../lib/img'
import { ArrowRight } from '../components/icons'

const HERO_IMG =
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=900&fit=crop'
const FIELDS_IMG =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop'
const TEMPLE_IMG =
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=800&fit=crop'
const CTA_IMG =
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&h=800&fit=crop'

// The hero's jump links. Eight sections is a long blind scroll, and this is
// cheaper than a sticky sub-nav — the ids are also what the footer deep-links to.
const JUMP = [
  { id: 'beginning', label: 'The beginning' },
  { id: 'people', label: 'Our people' },
  { id: 'temple', label: 'Sacred roots' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'craft', label: 'Craftsmanship' },
  { id: 'impact', label: 'Impact' },
]

const TEAM = [
  {
    name: 'Hari Prasad',
    role: 'Master Farmer',
    desc: '28 years of organic farming experience, guiding our fields with ancestral wisdom.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face'
  },
  {
    name: 'Meera Devi',
    role: 'Herbal Processing Specialist',
    desc: 'Expert in traditional drying methods, preserving nature\'s potency in every herb.',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face'
  },
  {
    name: 'Raghav Sharma',
    role: 'Quality & Grain Selection',
    desc: 'Ensures every batch meets purity standards with meticulous grain selection.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=face'
  },
  {
    name: 'Anjali Kumari',
    role: 'Chief Technical Officer',
    desc: 'Works at the digital side of the farm — integrating technology, ensuring customer engagement, and maintaining our online presence.',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=face'
  }
]

// No `icon` field any more: the timeline is set in type and hairlines, so the
// five emoji that used to sit in 64px circles have nowhere to go.
const METHODOLOGY = [
  {
    step: '01',
    title: 'Seed Selection',
    desc: 'We handpick heirloom, non-GMO seeds suited to our soil — preserving biodiversity and flavor.'
  },
  {
    step: '02',
    title: 'Natural Cultivation',
    desc: 'Zero synthetic inputs. We nurture crops with compost, crop rotation, and beneficial insects.'
  },
  {
    step: '03',
    title: 'Hand Harvesting',
    desc: 'Every leaf, grain, and fruit is harvested by hand at peak ripeness for maximum nutrition.'
  },
  {
    step: '04',
    title: 'Traditional Stone Processing',
    desc: 'Cold-pressed oils, stone-ground flour, wood-churned ghee — no heat, no machines, no shortcuts.'
  },
  {
    step: '05',
    title: 'Purity Testing & Packaging',
    desc: 'Third-party lab tested for contaminants, then sealed in eco-friendly packaging to lock in freshness.'
  }
]

const CRAFTSMANSHIP = [
  {
    title: 'Handcrafted Spices',
    statement: 'Sun-dried, hand-pounded, and blended in small batches to preserve volatile oils and aroma.',
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop'
  },
  {
    title: 'Cold-Pressed Oils',
    statement: 'Wood-pressed at low temperatures to retain nutrients, antioxidants, and the true taste of the seed.',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop'
  },
  {
    title: 'Sun-Dried Herbs',
    statement: 'Slow-dried under the open sky to concentrate flavor and medicinal properties naturally.',
    img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=400&fit=crop'
  },
  {
    title: 'Naturally Milled Grains',
    statement: 'Stone-milled whole grains keep the bran, germ, and endosperm intact — just as nature intended.',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop'
  }
]

const STATS = [
  { value: '120+', label: 'Farming Families' },
  { value: '350', label: 'Acres Cultivated' },
  { value: '100%', label: 'Natural Practices' },
  { value: '25', label: 'Traditional Products' }
]

export default function Story() {
  return (
    <div className="story-page">
      {/* A. Hero — sand, asymmetric, and the photograph is a companion to the
          headline rather than a 540px green wall in front of it. */}
      <section className="story-hero" aria-labelledby="story-hero-title">
        <div className="wrap story-hero__grid">
          <div className="story-hero__body">
            <span className="eyebrow">Our Journey</span>
            <h1 id="story-hero-title">
              Our story begins <em>in the soil.</em>
            </h1>
            <p className="story-hero__sub lead">
              From the soil of tradition to the purity of every product.
            </p>
            <nav className="story-hero__jump" aria-label="Jump to a section">
              {JUMP.map((j) => (
                <a href={`#${j.id}`} key={j.id}>
                  {j.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="story-hero__media">
            <SmartImage
              src={HERO_IMG}
              alt="Spices being hand-pounded in a stone mortar at Shoonya Farms"
              ratio="landscape"
              sizes="(max-width: 720px) 92vw, 48vw"
              priority
              width={1200}
            />
          </div>
        </div>
      </section>

      {/* B. The Beginning */}
      <section className="section" id="beginning" aria-labelledby="beginning-title">
        <div className="wrap">
          <SplitFeature
            top
            offset
            media={
              <SmartImage
                src={FIELDS_IMG}
                alt="Farm landscape with farmers working in fields"
                ratio="landscape"
                sizes="(max-width: 720px) 92vw, 44vw"
                zoom
              />
            }
          >
            <span className="eyebrow">The Beginning</span>
            <h2 id="beginning-title">
              Roots in the Land, <em>Promise to the People</em>
            </h2>
            <div className="prose">
              <p>
                In the quiet village of <strong>Anantpur</strong>, nestled between rolling hills and the ancient
                Shri Anant Dhaam Temple, a family made a promise to the land. Three generations ago, Ramkishan
                Prasad walked these fields with his father, learning that soil is not a resource — it is a
                living inheritance.
              </p>
              <p>
                When modern farming pushed chemicals and shortcuts, the Prasad family chose a different path.
                They kept the old ways: saving heirloom seeds, rotating crops by the moon calendar, letting
                earthworms do the tilling. What began as a handful of acres tended by one family grew into a
                collective of over 120 farming families, united by a single creed — <em>zero chemicals, zero
                compromise.</em>
              </p>
              <p>
                Today, Shoonya Farms stands for that promise. Every jar of ghee, every bottle of oil, every
                pouch of grain carries the fingerprint of the farmer who grew it, the hands that processed it,
                and the soil that nourished it. This is not just farming. This is stewardship.
              </p>
            </div>
          </SplitFeature>
        </div>
      </section>

      {/* C. Meet Our People */}
      <section
        className="section section--sand"
        id="people"
        aria-labelledby="team-title"
      >
        <div className="wrap">
          <SectionHead
            eyebrow="Our People"
            title="Meet Our People"
            id="team-title"
            sub="The hands that nurture our fields, the hearts that guard our traditions."
          />
          <Reveal className="grid grid--4 grid--rail">
            {TEAM.map((member) => (
              <MediaCard
                key={member.name}
                img={member.img}
                title={member.name}
                meta={member.role}
                ratio="square"
              >
                {member.desc}
              </MediaCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* D. Sacred Roots */}
      <section className="section" id="temple" aria-labelledby="temple-title">
        <div className="wrap">
          <SplitFeature
            reverse
            top
            offset
            media={
              <SmartImage
                src={TEMPLE_IMG}
                alt="Traditional Indian temple architecture at sunrise"
                ratio="landscape"
                sizes="(max-width: 720px) 92vw, 44vw"
                zoom
              />
            }
          >
            <span className="eyebrow">Sacred Roots</span>
            <h2 id="temple-title">Shri Anant Dhaam Temple</h2>
            <div className="prose">
              <p>
                At the heart of Anantpur stands <strong>Shri Anant Dhaam Temple</strong> — a centuries-old
                shrine where every harvest season begins. Before the first seed is sown and before the first
                crop is cut, our farmers gather here at dawn.
              </p>
              <p>
                It is not ritual for ritual's sake. It is gratitude made visible. The temple represents our
                covenant with nature: we take only what the land willingly gives, and we give back through
                compost, care, and restraint. The priest blesses the seeds, the soil, and the hands that will
                tend them. In return, the land has blessed us with harvests that need no certificate to prove
                their purity — the taste speaks.
              </p>
              <p>
                This connection to something older than commerce grounds every decision we make. When a
                shortcut tempts us, we remember the temple bells at 5 AM. When doubt creeps in, we remember
                generations who farmed this way and thrived.
              </p>
            </div>
            {/* The last two sentences of that third paragraph, lifted out and set
                as the quote they always were. */}
            <blockquote className="pullquote">
              The temple is our compass. The land is our witness.
              <cite>The Prasad family, Anantpur</cite>
            </blockquote>
          </SplitFeature>
        </div>
      </section>

      {/* E. Our Methodology */}
      <section
        className="section section--sand"
        id="methodology"
        aria-labelledby="methodology-title"
      >
        <div className="wrap">
          <SectionHead
            eyebrow="Our Way"
            title="Our Methodology"
            id="methodology-title"
            sub="Five steps. Zero shortcuts. Every product, every time."
          />
          <div className="timeline">
            {METHODOLOGY.map((item, i) => (
              <Reveal className="timeline__row" key={item.title} delay={i * 60}>
                <span className="timeline__n">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* F. Craftsmanship & Perfection */}
      <section className="section" id="craft" aria-labelledby="craft-title">
        <div className="wrap">
          <SectionHead
            eyebrow="Craftsmanship"
            title="Craftsmanship & Perfection"
            id="craft-title"
            sub="Why our products taste like they came from your grandmother's kitchen."
          />
          <Reveal className="grid grid--4 grid--rail">
            {CRAFTSMANSHIP.map((item) => (
              <MediaCard key={item.title} img={item.img} title={item.title} ratio="landscape">
                {item.statement}
              </MediaCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* G. Community Impact — the one dark band in the body of the page, and it
          earns it: the figures are the payoff of everything above. */}
      <section
        className="section section--dark"
        id="impact"
        aria-labelledby="impact-title"
      >
        <div className="wrap">
          <SectionHead
            eyebrow="Impact"
            title="Community Impact"
            id="impact-title"
            sub="When you choose Shoonya, you become part of a circle that extends far beyond your kitchen. Your purchase sustains farming families, regenerates soil, and keeps traditional knowledge alive."
          />
          <div className="stats">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <div className="stat__v">{stat.value}</div>
                <span className="stat__l">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H. Closing */}
      <section className="band" aria-labelledby="cta-title">
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
          <span className="eyebrow">Anantpur, India</span>
          <h2 id="cta-title">Every Product Carries a Story</h2>
          <p>From our fields to your family — taste the difference that tradition makes.</p>
          <div className="band__actions">
            <Link to="/shop" className="btn btn--light">
              Explore Our Products <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
