import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useCart } from "../../context/CartContext";

type HeaderProps = {
  onCartClick?: () => void;
};

function Header({ onCartClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, subtotalCents } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = (subtotalCents / 100).toFixed(2);
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "About Us", to: "/about-us" },
    { label: "Good to Know", to: "/good-to-know" },
    { label: "Pricing", to: "/pricing" },
    { label: "Gallery", to: "/gallery" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleCartClick = () => {
    onCartClick?.();
    closeMobileMenu();
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar__content">
          <div className="topbar__contact">
            <a href="mailto:hello@meatdirect.com">hello@meatdirect.com</a>
            <span className="divider">•</span>
            <a href="tel:555-123-4567">(555) 123-4567</a>
            <span className="divider">•</span>
            <Link to="/contact">Contact page</Link>
          </div>
          <div className="topbar__education">
            <Link to="/good-to-know" className="topbar__education-link">
              Good to Know / Meat education
            </Link>
            <span className="pill pill--small">New</span>
          </div>
          <div className="topbar__note">Local delivery · Grass-fed & hormone-free · Federally inspected</div>
        </div>
      </div>

      <div className="nav-shell">
        <div className="container nav">
          <Link to="/" className="brand">
            <span className="brand__mark">MD</span>
            <div>
              <div className="brand__name">MeatDirect</div>
              <div className="brand__tagline">From farms to your doorstep</div>
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

          <div className="nav__actions nav__actions--desktop">
            <button
              type="button"
              onClick={onCartClick}
              className="header-cart-button"
              aria-label="Open cart"
            >
              <span>Cart</span>
              <span className="header-cart-button__meta">
                {itemCount} item{itemCount === 1 ? "" : "s"} · ${subtotal}
              </span>
            </button>
          </div>

          <div className="nav__mobile-actions">
            <button
              type="button"
              className="nav__mobile-cart"
              onClick={handleCartClick}
              aria-label="Open cart"
            >
              Cart · ${subtotal}
            </button>
            <button
              type="button"
              className={`nav__toggle ${isMobileMenuOpen ? "is-active" : ""}`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={toggleMobileMenu}
            >
              <span className="nav__toggle-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="nav__toggle-label">{isMobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mobile-menu__backdrop ${isMobileMenuOpen ? "is-active" : ""}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <div
        className={`mobile-menu ${isMobileMenuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="mobile-menu__header">
          <div className="mobile-menu__brand">
            <span className="brand__mark">MD</span>
            <div>
              <div className="mobile-menu__brand-name">MeatDirect</div>
              <div className="mobile-menu__brand-tagline">Local, grass-fed, hormone-free</div>
            </div>
          </div>
          <button type="button" className="mobile-menu__close" onClick={closeMobileMenu}>
            Close
          </button>
        </div>

        <div className="mobile-menu__links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-menu__link ${isActive ? "is-active" : ""}`}
              onClick={closeMobileMenu}
            >
              <span>{link.label}</span>
              <span className="mobile-menu__chevron">{">"}</span>
            </NavLink>
          ))}
        </div>

        <div className="mobile-menu__meta">
          <div className="mobile-menu__chips">
            <a href="tel:555-123-4567" className="mobile-menu__chip">
              Call us
            </a>
            <a href="mailto:hello@meatdirect.com" className="mobile-menu__chip">
              Email
            </a>
            <Link to="/good-to-know" className="mobile-menu__chip mobile-menu__chip--accent" onClick={closeMobileMenu}>
              Meat education
            </Link>
            <Link to="/contact" className="mobile-menu__chip" onClick={closeMobileMenu}>
              Contact page
            </Link>
          </div>
          <p className="mobile-menu__note">
            Local delivery · Grass-fed & hormone-free · Federally inspected
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
