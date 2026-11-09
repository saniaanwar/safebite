import { useState } from "react";
import PropTypes from "prop-types";
import "./RestaurantSearch.css";

function RestaurantSearch({ neighborhoods, onSearch }) {
  // Keep editable inputs separate from the applied search.
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [result, setResult] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    setName(trimmedName);

    onSearch({
      name: trimmedName,
      neighborhood,
      result,
    });
  }

  function handleClear() {
    setName("");
    setNeighborhood("");
    setResult("");

    // Reset the parent’s applied filters as well.
    onSearch({ name: "", neighborhood: "", result: "" });
  }

  return (
    <form
      className="restaurant-search"
      aria-label="Search restaurant inspections"
      onSubmit={handleSubmit}
    >
      <label
        className="restaurant-search__field"
        htmlFor="restaurant-search-name"
      >
        Restaurant name
        <input
          id="restaurant-search-name"
          name="name"
          type="search"
          placeholder="e.g. Clover Cafe"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label
        className="restaurant-search__field"
        htmlFor="restaurant-search-neighborhood"
      >
        Neighborhood
        <select
          id="restaurant-search-neighborhood"
          name="neighborhood"
          value={neighborhood}
          onChange={(event) => setNeighborhood(event.target.value)}
        >
          <option value="">All neighborhoods</option>
          {neighborhoods.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label
        className="restaurant-search__field"
        htmlFor="restaurant-search-result"
      >
        Latest inspection result
        <select
          id="restaurant-search-result"
          name="result"
          value={result}
          onChange={(event) => setResult(event.target.value)}
        >
          <option value="">All results</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
        </select>
      </label>

      <div className="restaurant-search__actions">
        <button
          className="restaurant-search__button restaurant-search__button--primary"
          type="submit"
        >
          Search
        </button>

        <button
          className="restaurant-search__button"
          type="button"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </form>
  );
}

RestaurantSearch.propTypes = {
  neighborhoods: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default RestaurantSearch;
