import PropTypes from "prop-types";
import "./CategoryButtons.css";

function CategoryButtons({ categories, selected, onSelect }) {
  return (
    <div className="category-buttons" role="group" aria-label="Filter by category">
      {categories.map((category) => {
        const isActive = selected === category;

        return (
          <button
            key={category}
            type="button"
            className={`category-button${isActive ? " category-button-active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? "" : category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

CategoryButtons.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default CategoryButtons;