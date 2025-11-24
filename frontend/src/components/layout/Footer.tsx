function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="brand__mark">MD</div>
          <div>
            <div className="brand__name">MeatDirect</div>
            <div className="brand__tagline">From butcher to doorstep.</div>
          </div>
        </div>
        <div>
          <div className="footer__heading">Visit the shop</div>
          <p>1420 Meadow Lane, Suite B<br />Cleveland, OH 44113</p>
        </div>
        <div>
          <div className="footer__heading">Call or write</div>
          <p>
            <a href="tel:555-123-4567">(555) 123-4567</a>
            <br />
            <a href="mailto:hello@meatdirect.com">hello@meatdirect.com</a>
          </p>
        </div>
        <div>
          <div className="footer__heading">Hours</div>
          <p>
            Mon–Fri: 9a–6p
            <br />
            Sat: 8a–4p
            <br />
            Sun: Closed
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-row">
          <span>Federally inspected · Grass-fed · Hormone-free</span>
          <span>© {new Date().getFullYear()} MeatDirect</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
