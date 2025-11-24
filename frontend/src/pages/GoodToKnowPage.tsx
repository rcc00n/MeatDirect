import { Link } from "react-router-dom";

const inspectionQuestions = [
  {
    question: "Provincial vs. federal—what is the difference?",
    answer:
      "Provincial inspection lets us sell retail within Alberta. Federal inspection adds CFIA oversight so we can ship interprovincially without changing our standards or labels.",
  },
  {
    question: "How often is an inspector on site?",
    answer:
      "Every production day. Humane handling, sanitation, paperwork, and temperature logs are verified before we start and while we work.",
  },
  {
    question: "How do you track every order?",
    answer:
      "Lot codes, pack dates, and farm groups ride on each label. Cold-chain temps are logged from harvest to delivery so you can trace every box.",
  },
  {
    question: "What happens during an audit or recall?",
    answer:
      "We run mock recalls quarterly. Documentation, lot mapping, and delivery routes mean we can trace and notify quickly if something ever needs attention.",
  },
];

const grassHighlights = [
  "Pasture-first diet with hay in winter—leaner, brighter flavor.",
  "Naturally higher in omega-3s, conjugated linoleic acid (CLA), and antioxidants.",
  "Nutrient-dense: more Vitamin A and E, plus beta-carotene that shows up as a buttery hue in the fat.",
  "Great for meal prep and athletes looking for clean protein with minimal additives.",
];

const grainNotes = [
  "We’re transparent when a herd finishes on grain—usually to boost marbling and a buttery texture.",
  "Grain finish mellows mineral notes and can cook faster because of the extra fat cover.",
  "We still keep feed sheets on file and stick to our hormone-free promise regardless of finish.",
];

const hormonePoints = [
  "No added growth hormones or routine stimulants in our beef, bison, pork, or poultry programs.",
  "Predictable cooking: clean, honest fat cover that renders without a heavy aftertaste.",
  "Better-for-family choice if you’re cooking for kids, weekly meal prep, or recovering athletes.",
  "Supplier affidavits and random lot checks back the promise instead of just marketing copy.",
];

const microFaq = [
  {
    question: "How do you source your animals?",
    answer:
      "Direct relationships with prairie and foothill ranchers—no blind auctions. We walk herds, confirm feed plans, and keep signed affidavits on file.",
    linkLabel: "See sourcing stories",
    linkTo: "/blog",
  },
  {
    question: "Is all your meat inspected?",
    answer:
      "Yes. Retail orders run under provincial inspection and anything we ship out-of-province runs under our federal license with the same paperwork and traceability.",
    linkLabel: "Inspection breakdown",
    linkTo: "#inspection",
  },
  {
    question: "Can I order in bulk?",
    answer:
      "Absolutely. Half/whole beef, family freezer bundles, and wholesale cuts are cut to spec. We help you choose wrap sizes so nothing goes to waste.",
    linkLabel: "Bulk pricing",
    linkTo: "/pricing",
  },
  {
    question: "Do you deliver or ship?",
    answer:
      "Local delivery routes run twice weekly and insulated shipping covers the rest of Canada. Cold-chain stays between 0–4°C with gel packs and liners.",
    linkLabel: "Delivery FAQ",
    linkTo: "/contact",
  },
];

function GoodToKnowPage() {
  return (
    <div className="education-page">
      <section className="container education-hero">
        <div className="education-hero__grid">
          <div className="education-hero__copy">
            <div className="eyebrow">Good to Know</div>
            <h1>Inspection, sourcing, and meat education—condensed in one page.</h1>
            <p className="muted">
              Start here for the essentials: how provincial and federal inspection works, why we champion grass-fed and
              hormone-free programs, and quick answers to the questions we hear most.
            </p>
            <div className="education-hero__tags">
              <span className="pill pill--strong">Provincial + Federal inspected</span>
              <span className="pill">Grass-fed focus</span>
              <span className="pill">Hormone-free promise</span>
            </div>
            <div className="education-hero__actions">
              <a className="btn btn--primary" href="#faq">
                Jump to micro-FAQ
              </a>
              <Link className="btn btn--ghost" to="/blog">
                Read blog posts
              </Link>
            </div>
          </div>

          <div className="education-hero__card">
            <div className="education-hero__card-head">
              <div className="education-hero__badge">Education hub</div>
              <span className="pill pill--small">Updated weekly</span>
            </div>
            <h3>Everything you want to know before filling the cart.</h3>
            <ul className="education-hero__list">
              <li>How inspection works day-to-day and why traceability matters.</li>
              <li>When grass-fed shines vs. when a grain finish makes sense.</li>
              <li>What hormone-free means for flavor, texture, and your family.</li>
              <li>Quick answers on sourcing, bulk orders, and delivery.</li>
            </ul>
            <div className="education-hero__foot">
              <span className="pill">Transparent sourcing</span>
              <span className="pill pill--accent">Label-first culture</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container education-section" id="inspection">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Inspection</div>
            <h2>What it means to be provincially and federally inspected.</h2>
            <p className="muted">Q&A style so you can skim how oversight shows up in your box.</p>
          </div>
          <span className="pill pill--accent">Traceability & paperwork</span>
        </div>

        <div className="education-qa-grid">
          <div className="education-qa__list">
            {inspectionQuestions.map((item) => (
              <div key={item.question} className="education-qa__item">
                <div className="education-qa__question">{item.question}</div>
                <p className="education-qa__answer">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="education-qa__card">
            <div className="education-qa__card-head">
              <div className="education-qa__badge">Daily oversight</div>
              <div className="education-qa__status">CFIA-ready</div>
            </div>
            <h3>Paperwork follows the meat, not the other way around.</h3>
            <p>
              Lot codes, cut sheets, sanitation checks, and cold-chain temps are logged alongside each production run.
              That makes wholesale accounts, households, and gyms easy to serve with the same standard.
            </p>
            <ul className="education-qa__card-list">
              <li>Labels include pack date, lot number, and farm group.</li>
              <li>Temperature checks at receiving, processing, loading, and delivery.</li>
              <li>Documentation is shareable if you need it for your own records.</li>
            </ul>
            <Link className="link-button" to="/about-us">
              See how we run inspection →
            </Link>
          </div>
        </div>
      </section>

      <section className="container education-section" id="grass-fed">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Grass-fed vs grain-fed</div>
            <h2>Choosing the right finish for your kitchen.</h2>
            <p className="muted">
              We prioritize grass-fed herds and stay transparent when a herd finishes on grain for added marbling.
            </p>
          </div>
          <span className="pill pill--accent">Nutrition highlights</span>
        </div>

        <div className="education-compare">
          <div className="education-compare__card education-compare__card--grass">
            <div className="education-compare__eyebrow">Grass-fed focus</div>
            <h3>Why we lean grass-first.</h3>
            <ul className="education-compare__list">
              {grassHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="education-compare__tags">
              <span className="pill pill--small">Vitamin A & E</span>
              <span className="pill pill--small">Higher CLA</span>
              <span className="pill pill--small">Antioxidants</span>
            </div>
          </div>

          <div className="education-compare__card education-compare__card--grain">
            <div className="education-compare__eyebrow">Grain finish perspective</div>
            <h3>When grain-finished makes sense.</h3>
            <ul className="education-compare__list">
              {grainNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="education-compare__note">
              <p className="muted">
                Whether you choose grass-fed or a grain finish, we keep the same traceability and hormone-free standards
                and list finishing details on request.
              </p>
              <Link className="link-button" to="/blog">
                Read the grass-fed vs. grain-fed guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container education-section" id="hormone-free">
        <div className="education-highlight">
          <div>
            <div className="eyebrow">Hormone-free meat</div>
            <h2>Why it matters for taste and health.</h2>
            <p className="muted">
              No added growth hormones or routine stimulants—just clean, honest meat you can feed to family, athletes,
              and restaurant guests with confidence.
            </p>
          </div>
          <div className="education-highlight__grid">
            <div className="education-highlight__card">
              <div className="education-highlight__label">Taste & texture</div>
              <p>
                Balanced marbling without heavy finishes means steadier cooking, less flare-ups, and flavor that tastes
                like the pasture it came from.
              </p>
            </div>
            <div className="education-highlight__card">
              <div className="education-highlight__label">Health-forward</div>
              <p>
                Clean fat cover and nutrient density without added hormones support weekly meal prep, kid-friendly
                lunches, and performance diets.
              </p>
            </div>
            <div className="education-highlight__card">
              <div className="education-highlight__label">Proof, not promises</div>
              <ul className="education-highlight__list">
                {hormonePoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container education-section" id="faq">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Micro-FAQ</div>
            <h2>Fast answers to the questions we hear most.</h2>
            <p className="muted">More details live in our blog posts and on each product page.</p>
          </div>
          <Link className="link-button" to="/blog">
            Open the blog →
          </Link>
        </div>

        <div className="education-faq">
          {microFaq.map((item) => (
            <div key={item.question} className="education-faq__item">
              <div className="education-faq__question">{item.question}</div>
              <p className="education-faq__answer">{item.answer}</p>
              <Link className="education-faq__link" to={item.linkTo}>
                {item.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default GoodToKnowPage;
