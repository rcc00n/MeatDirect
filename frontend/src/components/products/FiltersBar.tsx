interface FiltersBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

function FiltersBar({ categories, selectedCategory, onSelect }: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`filter-pill ${selectedCategory === null ? "is-active" : ""}`}
      >
        All categories
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`filter-pill ${selectedCategory === category ? "is-active" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default FiltersBar;
