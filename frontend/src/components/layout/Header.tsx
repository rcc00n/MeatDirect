import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Phone, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import logo from "../../assets/logo.png";

type HeaderProps = {
  onCartClick?: () => void;
};

function Header({ onCartClick }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { items, subtotalCents } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = (subtotalCents / 100).toFixed(2);

  const structureLinks = [
    { label: "Shop", to: "/menu", note: "Retail cuts, deli, smoked fish" },
    { label: "Boxes", to: "/pricing", note: "Quarter, half, and whole orders" },
    { label: "Learn", to: "/good-to-know", note: "Temps, sourcing, and guides" },
    { label: "Support", to: "/contact", note: "Call, pickup, and delivery help" },
  ];

  const secondaryLinks = [
    { label: "Blog", to: "/blog" },
    { label: "Gallery", to: "/gallery" },
    { label: "About", to: "/about-us" },
  ];

  const navLinks = [
    ...structureLinks.map(({ label, to }) => ({ label, to })),
    ...secondaryLinks,
  ];

  const toggleMobileMenu = () => setIsMobileOpen((open) => !open);
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleCartClick = () => {
    onCartClick?.();
    closeMobileMenu();
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__content">
          <div className="topbar__info">
            <span className="pill pill--small pill--accent">Local & online</span>
            <span className="topbar__note">Cold-packed delivery Tue/Thu · Pickup from the shop daily</span>
          </div>
          <div className="topbar__structure" role="navigation" aria-label="Site structure">
            {structureLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `topbar__structure-link ${isActive ? "is-active" : ""}`}
              >
                <span className="topbar__structure-label">{link.label}</span>
                <span className="topbar__structure-note">{link.note}</span>
              </NavLink>
            ))}
          </div>
          <div className="topbar__actions">
            <a className="topbar__call" href="tel:555-123-4567">
              <Phone size={16} />
              <span>(555) 123-4567</span>
            </a>
            <Link to="/contact" className="pill pill--outline topbar__cta">
              Need help?
            </Link>
          </div>
        </div>
      </div>

      <div className="container nav-shell">
        <Link to="/" className="brand">
          <img src={logo} alt="MeatDirect logo" className="brand__logo" />
          <div>
            <div className="brand__name">MeatDirect</div>
            <div className="brand__tagline">Quality local meat delivered</div>
          </div>
        </Link>

        <nav className="nav__links nav__links--desktop">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <button type="button" className="nav__cart" onClick={handleCartClick} aria-label="Open cart">
            <ShoppingCart size={18} />
            <div className="nav__cart-text">
              <span className="nav__cart-label">Cart</span>
              <span className="nav__cart-count">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>
            <span className="nav__cart-total">${subtotal}</span>
          </button>
          <button
            type="button"
            className={`nav__toggle ${isMobileOpen ? "is-active" : ""}`}
            aria-expanded={isMobileOpen}
            aria-label="Toggle navigation menu"
            onClick={toggleMobileMenu}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav-drawer ${isMobileOpen ? "is-open" : ""}`}>
        <div className="nav-drawer__header">
          <div className="brand__name">Menu</div>
          <button type="button" className="nav-drawer__close" onClick={closeMobileMenu}>
            Close
          </button>
        </div>
        <div className="nav-drawer__section">
          <div className="nav-drawer__section-heading">Start here</div>
          <div className="nav-drawer__structure">
            {structureLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-drawer__structure-link ${isActive ? "is-active" : ""}`}
                onClick={closeMobileMenu}
              >
                <div className="nav-drawer__structure-label">{link.label}</div>
                <div className="nav-drawer__structure-note">{link.note}</div>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="nav-drawer__section">
          <div className="nav-drawer__section-heading">More from MeatDirect</div>
          <div className="nav-drawer__links">
            {secondaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-drawer__link ${isActive ? "is-active" : ""}`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="nav-drawer__meta">
          <div className="nav-drawer__summary">
            <div className="nav-drawer__summary-label">Cart overview</div>
            <div className="nav-drawer__summary-meta">
              {itemCount} item{itemCount === 1 ? "" : "s"} · ${subtotal}
            </div>
            <button type="button" className="btn btn--solid btn--full" onClick={handleCartClick}>
              Open cart
            </button>
          </div>

          <div className="nav-drawer__contact">
            <div className="nav-drawer__contact-label">Talk to a butcher</div>
            <a href="tel:555-123-4567">(555) 123-4567</a>
            <a href="mailto:hello@meatdirect.com">hello@meatdirect.com</a>
          </div>
        </div>
      </div>
      <div
        className={`nav-drawer__backdrop ${isMobileOpen ? "is-active" : ""}`}
        onClick={closeMobileMenu}
        role="presentation"
      />
    </header>
  );
}

export default Header;
