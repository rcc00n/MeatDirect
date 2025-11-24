import type { Product } from "../../types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="product-card product-card--skeleton">
            <div className="product-card__image-wrapper">
              <div className="skeleton skeleton--image" />
            </div>
            <div className="product-card__body">
              <div className="skeleton skeleton--text" />
              <div className="skeleton skeleton--text skeleton--short" />
              <div className="skeleton skeleton--pill" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="product-empty">
        <div className="product-empty__title">No products match your filters yet.</div>
        <p className="product-empty__hint">Try clearing the filters or searching a simpler term.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
