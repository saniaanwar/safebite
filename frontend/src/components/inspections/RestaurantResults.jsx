import PropTypes from "prop-types";
import "./RestaurantResults.css";

// Keep date-only records consistent across browser time zones.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function RestaurantResults({ restaurants, total, page, pageSize }) {
  const first = (page - 1) * pageSize + 1;
  const last = first + restaurants.length - 1;
  const noun = total === 1 ? "restaurant" : "restaurants";

  const summary =
    restaurants.length === 0
      ? `${total} matching ${noun}`
      : `Showing ${first}-${last} of ${total} ${noun}`;
  return (
    <section
      className="restaurant-results"
      aria-labelledby="restaurant-results-title"
    >
      <header className="restaurant-results__header">
        <h2 id="restaurant-results-title">Restaurants</h2>

        <p role="status">{summary}</p>
      </header>

      {restaurants.length === 0 ? (
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
                    <span className="restaurant-results__result">
                      {restaurant.latestResult === "pass" ? "Pass" : "Fail"}
                    </span>
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
  pageSize: PropTypes.number.isRequired,
};

export default RestaurantResults;
