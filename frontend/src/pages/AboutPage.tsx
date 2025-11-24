import { Link } from "react-router-dom";

const inspectionHighlights = [
  "Licensed for both provincial and federal inspection so we can serve local families and ship interprovincially.",
  "Inspectors review sanitation, humane handling, and traceability on every production day.",
  "Every label carries pack date, lot, and cut sheet details so you always know the source.",
  "Cold chain is logged from farm pickup through delivery vans—kept between 0–4°C.",
];

const founders = [
  {
    name: "Mike",
    role: "Co-founder · Sourcing & fabrication",
    bio: "Raised on a mixed farm and trained under old-world butchers, Mike handpicks the partner ranches and specs every cut that leaves our shop.",
    points: [
      "Walks herds with ranchers before we sign on.",
      "Works shoulder-to-shoulder with inspectors to keep paperwork clean.",
      "Obsessed with consistent aging, trimming, and marbling.",
    ],
  },
  {
    name: "Natalia",
    role: "Co-founder · Food safety & community",
    bio: "Natalia grew up on a dairy farm and studied supply chain. She runs the cold room, delivery routes, and customer programs that keep orders dependable.",
    points: [
      "Builds routes that keep everything within safe temps.",
      "Translates inspection rules into simple labels and guides.",
      "Champions family-friendly cuts and ready-to-cook kits.",
    ],
  },
];

const standards = [
  {
    title: "Grass-Fed Meat",
    summary:
      "Pasture-first diets with winter hay when the prairie freezes. Leaner, cleaner flavor with healthy omega-3s and CLA.",
    bullets: [
      "Natural marbling without heavy grain finish.",
      "Higher in nutrients and clean, mineral-rich flavor.",
      "Great for weeknight grills and meal prep.",
    ],
    linkLabel: "Read the grass-fed article",
    linkTo: "/blog",
  },
  {
    title: "Hormone Free Meat",
    summary: "Raised without growth hormones or routine stimulants. Predictable cooking, honest texture, and kinder sourcing.",
    bullets: [
      "No added hormones—ever.",
      "Better-for-family choice for staples and school lunches.",
      "Pairs with our clean spice blends for quick dinners.",
    ],
    linkLabel: "Why hormone-free matters",
    linkTo: "/blog",
  },
];

const metrics = [
  { value: "100%", label: "Grass-fed beef & bison line", note: "Nature-led sourcing" },
  { value: "20+", label: "Awards & community nods", note: "Taste, service, and safety" },
  { value: "2", label: "Inspection programs", note: "Provincial + federal" },
  { value: "48 hrs", label: "Avg. order-to-door", note: "Cold-packed delivery windows" },
];

function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div className="about-hero__copy">
            <div className="eyebrow">About Us</div>
            <h1>Meat Direct is Mike & Natalia—connecting prairie farms to your family table.</h1>
            <p>
              We built Meat Direct Inc to be the honest butcher shop we wanted nearby: transparent sourcing, grass-fed
              and hormone-free programs, and inspection-ready processes that keep every box trustworthy.
            </p>
            <div className="about-hero__pills">
              <span className="pill pill--strong">Provincial + federal inspection</span>
              <span className="pill">Local Alberta shop & delivery</span>
              <span className="pill">Grass-fed · Hormone-free</span>
            </div>
            <div className="about-hero__actions">
              <a className="btn btn--primary" href="#founders">
                Meet the founders
              </a>
              <a className="btn btn--ghost" href="#standards">
                Our standards
              </a>
            </div>
          </div>

          <div className="about-hero__card">
            <div className="about-hero__card-header">
              <div className="eyebrow eyebrow--green">Local shop position</div>
              <h3>Inspection-ready facility positioned for Alberta and Canada-wide delivery.</h3>
              <p className="muted">
                From our cold room and counter service, we can serve neighbors, supply restaurants, and ship nationwide
                under both provincial and federal programs.
              </p>
            </div>
            <dl className="about-hero__facts">
              <div>
                <dt>Location</dt>
                <dd>Alberta-based shop with pickup, local delivery routes, and insulated shipping.</dd>
              </div>
              <div>
                <dt>Credentials</dt>
                <dd>Provincially and federally inspected with documented lot tracking.</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>Grass-fed beef, heritage pork, bison, and hormone-free poultry.</dd>
              </div>
            </dl>
            <ul className="about-hero__checks">
              <li>CFIA-ready paperwork & sanitation logs</li>
              <li>Temperature-controlled processing and delivery</li>
              <li>Transparent labels with pack date and farm group</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container about-story" id="story">
        <div className="about-section-header">
          <div>
            <div className="eyebrow">Intro story</div>
            <h2>We started with family recipes and a promise to keep things honest.</h2>
          </div>
          <span className="pill pill--accent">Built on trust & inspection</span>
        </div>
        <div className="about-story__grid">
          <div className="about-story__text">
            <p>
              Mike grew up watching his family cut and cure meat by hand. Natalia spent her childhood rotating between
              chores in the barn and the kitchen table. Together we knew there was a gap between big-box meat and the
              flavor—and accountability—of small farms. Meat Direct closes that gap.
            </p>
            <p>
              We keep relationships personal: walking pastures, confirming feed plans, and keeping batch sizes small so
              every cut gets attention. That respect extends to inspection—we welcome oversight because it keeps our
              promises real.
            </p>
          </div>
          <div className="about-story__values">
            <h3>Mission & values</h3>
            <ul className="checklist">
              <li>Pay farmers fairly and put their names on the label.</li>
              <li>Make inspection logs and cold-chain data easy to understand.</li>
              <li>Offer cuts for everyday families, athletes, and chefs alike.</li>
              <li>Ship with minimal additives—just clean, honest flavor.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container founders" id="founders">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Founders story</div>
            <h2>Meet Mike & Natalia</h2>
            <p className="muted">
              A farmer-butcher and a supply-chain pro running one inspected, transparent shop.
            </p>
          </div>
          <span className="pill">Farm partners · Family-run</span>
        </div>
        <div className="founder-grid">
          {founders.map((founder) => (
            <div key={founder.name} className="founder-card">
              <div className="founder-card__header">
                <div className="founder-card__avatar">{founder.name[0]}</div>
                <div>
                  <div className="founder-card__name">{founder.name}</div>
                  <div className="founder-card__role">{founder.role}</div>
                </div>
              </div>
              <p>{founder.bio}</p>
              <ul className="founder-card__list">
                {founder.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container good-to-know" id="good-to-know">
        <div className="good-to-know__card">
          <div>
            <div className="eyebrow eyebrow--green">Good to know</div>
            <h3>Yes—Meat Direct is both provincially and federally inspected.</h3>
            <p>
              That means daily oversight, full traceability, and the ability to serve local pickup customers and
              ship-to-door orders across provinces without changing our standards.
            </p>
            <div className="good-to-know__links">
              <Link to="/good-to-know" className="link-button">
                Read the full FAQ & education page →
              </Link>
              <span className="pill pill--small">Transparency first</span>
            </div>
          </div>
          <div className="good-to-know__badge">
            <div className="good-to-know__seal">Inspected</div>
            <div className="muted">CFIA-ready · Provincial retail & federal shipping</div>
          </div>
        </div>
      </section>

      <section className="container inspection" id="inspection-summary">
        <div className="section-heading">
          <div>
            <div className="eyebrow">What it means</div>
            <h2>Provincial & federal inspection, condensed.</h2>
          </div>
          <span className="pill">3–5 point summary</span>
        </div>
        <div className="inspection__grid">
          <ul className="inspection__list">
            {inspectionHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="inspection__card">
            <div className="inspection__tag">Documentation</div>
            <h3>Paperwork that travels with every box.</h3>
            <p>
              Lot tracking, cut sheets, sanitation logs, and temperature charts live with each batch. Restaurants, gyms,
              and families get the same level of clarity.
            </p>
            <div className="inspection__meta">
              <span className="pill pill--small">HACCP-minded</span>
              <span className="pill pill--accent">Cold-chain protected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container standards" id="standards">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Standards</div>
            <h2>Grass-fed & hormone-free programs, at a glance.</h2>
          </div>
          <Link to="/blog" className="link-button">
            Extended articles →
          </Link>
        </div>
        <div className="standards__grid">
          {standards.map((standard) => (
            <div key={standard.title} className="standard-card">
              <div className="standard-card__eyebrow">{standard.title}</div>
              <h3>{standard.summary}</h3>
              <ul className="standard-card__list">
                {standard.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link to={standard.linkTo} className="link-button">
                {standard.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container metrics" id="metrics">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Metrics</div>
            <h2>Proof points in the open.</h2>
          </div>
          <p className="muted">Configurable fields you can swap as new milestones land.</p>
        </div>
        <div className="metrics__grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric">
              <div className="metric__value">{metric.value}</div>
              <div className="metric__label">{metric.label}</div>
              <div className="metric__note">{metric.note}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
