import PropTypes from "prop-types";
import "./RestaurantResults.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function RestaurantResults({
  restaurants,
  total,
  page,
  totalPages,
  loading,
  onPageChange,
  onSelect,
}) {
  const noun = total === 1 ? "restaurant" : "restaurants";

  return (
    <section
      className="restaurant-results"
      aria-labelledby="restaurant-results-title"
    >
      <header className="restaurant-results__header">
        <h2 id="restaurant-results-title">Restaurant Records</h2>

        <p role="status">
          {loading ? (
            "Updating results..."
          ) : (
            <>
              {total.toLocaleString("en-US")} matching {noun}
              {totalPages > 0 && (
                <span className="restaurant-results__sr-only">
                  {`, page ${page} of ${totalPages}`}
                </span>
              )}
            </>
          )}
        </p>
      </header>

      {totalPages > 0 && (
        <nav
          className="restaurant-results__pagination"
          aria-label="Restaurant result pages"
        >
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>

          <p>{loading ? "Loading..." : `Page ${page} of ${totalPages}`}</p>

          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </nav>
      )}

      {loading ? (
        <p>Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p>
          No restaurants match these filters. Try another search or use Clear.
        </p>
      ) : (
        <div
          className="restaurant-results__scroll"
          role="region"
          aria-label="Restaurant inspection results"
          tabIndex={0}
        >
          <table className="restaurant-results__table">
            <caption>Latest inspection for each matching restaurant</caption>

            <thead>
              <tr>
                <th scope="col">Restaurant</th>
                <th scope="col">Neighborhood</th>
                <th scope="col">Latest inspection</th>
                <th scope="col">Result</th>
                <th scope="col">Details</th>
              </tr>
            </thead>

            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant.restaurantId}>
                  <th scope="row">{restaurant.restaurantName}</th>
                  <td>{restaurant.neighborhood}</td>
                  <td>
                    <time dateTime={restaurant.latestInspectionDate}>
                      {dateFormatter.format(
                        new Date(restaurant.latestInspectionDate),
                      )}
                    </time>
                  </td>
                  <td>
                    <span
                      className={`restaurant-results__result restaurant-results__result--${restaurant.latestResult}`}
                    >
                      {restaurant.latestResult === "pass" ? "Pass" : "Fail"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="restaurant-results__details"
                      type="button"
                      aria-label={`View details for ${restaurant.restaurantName}`}
                      onClick={(event) =>
                        onSelect(restaurant.restaurantId, event.currentTarget)
                      }
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

RestaurantResults.propTypes = {
  restaurants: PropTypes.arrayOf(
    PropTypes.shape({
      restaurantId: PropTypes.string.isRequired,
      restaurantName: PropTypes.string.isRequired,
      neighborhood: PropTypes.string.isRequired,
      latestInspectionDate: PropTypes.string.isRequired,
      latestResult: PropTypes.oneOf(["pass", "fail"]).isRequired,
    }),
  ).isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default RestaurantResults;
