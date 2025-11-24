import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import CartLineItem from "../cart/CartLineItem";

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, subtotalCents } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <aside
        className={`cart-drawer ${open ? "cart-drawer--open" : ""}`}
        aria-hidden={!open}
        aria-label="Cart drawer"
        role="dialog"
        aria-modal={open}
      >
        <div className="cart-drawer__header">
          <div>
            <div className="cart-drawer__title">Cart</div>
            <div className="cart-drawer__subtitle">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </div>
          </div>
          <button type="button" className="cart-drawer__close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="cart-drawer__items">
          {items.length === 0 ? (
            <p className="cart-drawer__empty">Cart is empty. Add something tasty.</p>
          ) : (
            items.map((item) => <CartLineItem key={item.product.id} item={item} />)
          )}
        </div>

        <div className="cart-drawer__footer">
          <div className="cart-drawer__row">
            <span>Subtotal</span>
            <strong>${(subtotalCents / 100).toFixed(2)}</strong>
          </div>

          <div className="cart-drawer__actions">
            <Link to="/cart" onClick={onClose} className="button button--ghost">
              View Cart
            </Link>
            <Link to="/checkout" onClick={onClose} className="button button--accent">
              Checkout
            </Link>
          </div>
        </div>
      </aside>

      <div
        className={`cart-drawer__backdrop ${open ? "is-active" : ""}`}
        onClick={onClose}
        role="presentation"
      />
    </>
  );
}

export default CartSidebar;
