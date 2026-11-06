import { useState } from "react";
import RestaurantSearch from "./RestaurantSearch";
import "./InspectionsPage.css";
import RestaurantResults from "./RestaurantResults";

// These match the current synthetic dataset.
const NEIGHBORHOODS = [
  "Back Bay",
  "Beacon Hill",
  "Dorchester",
  "East Boston",
  "Jamaica Plain",
];

// Temporary examples matching the seeded restaurant summaries.
// Replace these with API responses in the next checkpoint.
const PREVIEW_RESTAURANTS = [
  {
    restaurantId: "demo-rest-001",
    restaurantName: "Demo Restaurant 001",
    neighborhood: "Back Bay",
    latestInspectionDate: "2026-10-01",
    latestResult: "fail",
  },
  {
    restaurantId: "demo-rest-002",
    restaurantName: "Demo Restaurant 002",
    neighborhood: "Beacon Hill",
    latestInspectionDate: "2026-10-02",
    latestResult: "pass",
  },
  {
    restaurantId: "demo-rest-003",
    restaurantName: "Demo Restaurant 003",
    neighborhood: "Dorchester",
    latestInspectionDate: "2026-10-03",
    latestResult: "fail",
  },
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

  // Derive the visible rows from the applied filters.
  const matchingRestaurants = PREVIEW_RESTAURANTS.filter((restaurant) => {
    const matchesName = restaurant.restaurantName
      .toLowerCase()
      .includes(filters.name.toLowerCase());

    const matchesNeighborhood =
      !filters.neighborhood || restaurant.neighborhood === filters.neighborhood;

    const matchesResult =
      !filters.result || restaurant.latestResult === filters.result;

    return matchesName && matchesNeighborhood && matchesResult;
  });

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

      <p className="inspections-page__summary">
        Search criteria: {filters.name || "All names"} ·{" "}
        {filters.neighborhood || "All neighborhoods"} · {resultLabel}
      </p>

      <RestaurantResults restaurants={matchingRestaurants} />
    </section>
  );
}

InspectionsPage.propTypes = {};

export default InspectionsPage;
