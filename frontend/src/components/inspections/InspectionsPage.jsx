import { useState } from "react";
import RestaurantSearch from "./RestaurantSearch";
import "./InspectionsPage.css";

// These match the current synthetic dataset.
const NEIGHBORHOODS = [
  "Back Bay",
  "Beacon Hill",
  "Dorchester",
  "East Boston",
  "Jamaica Plain",
];

function InspectionsPage() {
  // Results will later use these applied filters.
  const [filters, setFilters] = useState({
    name: "",
    neighborhood: "",
    result: "",
  });

  const resultLabel = filters.result
    ? filters.result.toUpperCase()
    : "All results";

  return (
    <section className="inspections-page" aria-labelledby="inspections-title">
      <p className="inspections-page__notice">
        <strong>Demonstration data:</strong> All restaurant and inspection
        records in this demo are synthetic.
      </p>

      <header className="inspections-page__heading">
        <p className="inspections-page__eyebrow">Boston restaurant workspace</p>

        <h1 id="inspections-title">Restaurant inspections</h1>

        <p className="inspections-page__intro">
          Explore inspection history and community reports for fictional
          restaurants.
        </p>
      </header>

      <RestaurantSearch neighborhoods={NEIGHBORHOODS} onSearch={setFilters} />

      <p className="inspections-page__summary" role="status">
        Search criteria: {filters.name || "All names"} ·{" "}
        {filters.neighborhood || "All neighborhoods"} · {resultLabel}
      </p>
    </section>
  );
}

InspectionsPage.propTypes = {};

export default InspectionsPage;
