import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div>
            <div className="brand__name">MeatDirect</div>
            <p className="muted">Quality local meat delivered to your door.</p>
          </div>
        </div>
        <div>
          <h4 className="footer__heading">Contact</h4>
          <div className="footer__text">
            <a href="tel:+15874056328">(587) 405-6328</a>
            <br />
            <a href="mailto:info@meatdirectinc.ca">info@meatdirectinc.ca</a>
            <br />
            <Link to="/contact">Contact page</Link>
          </div>
        </div>
        <div>
          <h4 className="footer__heading">Hours</h4>
          <div className="footer__text">Monday: Closed</div>
          <div className="footer__text">Tuesday–Friday: 11:00 AM–6:00 PM</div>
          <div className="footer__text">Saturday: 10:00 AM–6:00 PM</div>
          <div className="footer__text">Sunday: Closed</div>
          <div className="footer__text">Holidays: Closed</div>
        </div>
        <div>
          <h4 className="footer__heading">Follow</h4>
          <div className="footer__text">Stay connected with us</div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-row">
          <span>Farm-direct sourcing · Hormone-free · Transparent partners</span>
          <span>© {new Date().getFullYear()} MeatDirect</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
