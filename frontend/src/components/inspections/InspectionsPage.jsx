import { useEffect, useRef, useState } from "react";
import RestaurantSearch from "./RestaurantSearch";
import RestaurantResults from "./RestaurantResults";
import RestaurantDetails from "./RestaurantDetails";
import { fetchRestaurants } from "./api";
import "./InspectionsPage.css";

const NEIGHBORHOODS = [
  "Back Bay",
  "Beacon Hill",
  "Dorchester",
  "East Boston",
  "Jamaica Plain",
];

function InspectionsPage() {
  const [query, setQuery] = useState({
    name: "",
    neighborhood: "",
    result: "",
    page: 1,
  });

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const openerRef = useRef(null);

  const [response, setResponse] = useState({
    query: null,
    data: null,
    error: false,
  });

  const loading = response.query !== query;
  const failed = !loading && response.error;
  const data = !loading && !failed ? response.data : null;
  const lastData = response.data;

  useEffect(() => {
    const controller = new AbortController();

    async function loadRestaurants() {
      try {
        const data = await fetchRestaurants(query, controller.signal);

        if (!controller.signal.aborted) {
          setResponse({ query, data, error: false });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Restaurant lookup failed:", error);
          setResponse({ query, data: null, error: true });
        }
      }
    }

    loadRestaurants();

    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    // Restore focus after returning from details.
    if (selectedRestaurantId === null) {
      openerRef.current?.focus();
    }
  }, [selectedRestaurantId]);

  function handleSearch(filters) {
    setQuery({ ...filters, page: 1 });
  }

  function goToPage(nextPage) {
    setQuery((current) => ({ ...current, page: nextPage }));
  }

  function retry() {
    setQuery((current) => ({ ...current }));
  }

  function openDetails(restaurantId, button) {
    openerRef.current = button;
    setSelectedRestaurantId(restaurantId);
  }

  function closeDetails() {
    setSelectedRestaurantId(null);
  }

  const resultLabel = query.result ? query.result.toUpperCase() : "All results";

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

      {/* Preserve search inputs while viewing details. */}
      <div hidden={selectedRestaurantId !== null}>
        <RestaurantSearch
          neighborhoods={NEIGHBORHOODS}
          onSearch={handleSearch}
        />

        <p className="inspections-page__summary">
          Search criteria: {query.name || "All names"} ·{" "}
          {query.neighborhood || "All neighborhoods"} · {resultLabel}
        </p>

        {loading && !lastData && <p role="status">Loading restaurants...</p>}

        {failed && (
          <div className="inspections-page__error" role="alert">
            <p>Could not load restaurants. Please try again.</p>

            <button
              className="inspections-page__retry"
              type="button"
              onClick={retry}
            >
              Try again
            </button>
          </div>
        )}

        {lastData && !failed && (
          <RestaurantResults
            restaurants={data?.restaurants ?? []}
            total={lastData.total}
            page={lastData.page}
            totalPages={lastData.totalPages}
            loading={loading}
            onPageChange={goToPage}
            onSelect={openDetails}
          />
        )}
      </div>

      {selectedRestaurantId !== null && (
        <RestaurantDetails
          key={selectedRestaurantId}
          restaurantId={selectedRestaurantId}
          onBack={closeDetails}
        />
      )}
    </section>
  );
}

InspectionsPage.propTypes = {};

export default InspectionsPage;
