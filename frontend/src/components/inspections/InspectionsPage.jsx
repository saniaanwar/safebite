import { useEffect, useState } from "react";
import RestaurantSearch from "./RestaurantSearch";
import RestaurantResults from "./RestaurantResults";
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

  // Associate each response with the query that produced it.
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

    // Cancel this request when the query changes or the page unmounts.
    return () => controller.abort();
  }, [query]);

  function handleSearch(filters) {
    setQuery({ ...filters, page: 1 });
  }

  function goToPage(nextPage) {
    setQuery((current) => ({ ...current, page: nextPage }));
  }

  function retry() {
    // A new query object triggers another request with the same values.
    setQuery((current) => ({ ...current }));
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

      <RestaurantSearch neighborhoods={NEIGHBORHOODS} onSearch={handleSearch} />

      <p className="inspections-page__summary">
        Search criteria: {query.name || "All names"} ·{" "}
        {query.neighborhood || "All neighborhoods"} · {resultLabel}
      </p>

      {loading && <p role="status">Loading restaurants...</p>}

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

      {data && (
        <RestaurantResults
          restaurants={data.restaurants}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
        />
      )}

      {lastData?.totalPages > 1 && (
        <nav
          className="inspections-page__pagination"
          aria-label="Restaurant result pages"
        >
          <button
            type="button"
            disabled={loading || lastData.page <= 1}
            onClick={() => goToPage(lastData.page - 1)}
          >
            Previous
          </button>

          <span>
            {loading
              ? "Loading results..."
              : `Page ${lastData.page} of ${lastData.totalPages}`}
          </span>

          <button
            type="button"
            disabled={loading || lastData.page >= lastData.totalPages}
            onClick={() => goToPage(lastData.page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

InspectionsPage.propTypes = {};

export default InspectionsPage;
