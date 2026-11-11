import { useState } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(text.trim());
  }

  function handleChange(event) {
    setText(event.target.value);

    // shoes all recalls
    if (event.target.value === "") {
      onSearch("");
    }
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <label htmlFor="recall-search" className="search-bar-label">
        Search recalls
      </label>
      <input
        id="recall-search"
        type="search"
        placeholder="Search a product or brand"
        value={text}
        onChange={handleChange}
      />
      <button type="submit">Search</button>
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;