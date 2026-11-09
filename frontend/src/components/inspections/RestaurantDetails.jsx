import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { fetchRestaurantDetails } from "./api";
import "./RestaurantDetails.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function RestaurantDetails({ restaurantId, onBack }) {
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState({
    key: null,
    data: null,
    error: null,
  });
  const headingRef = useRef(null);

  // Identify the selected restaurant and current retry.
  const requestKey = `${restaurantId}:${attempt}`;
  const loading = response.key !== requestKey;
  const data = loading ? null : response.data;
  const error = loading ? null : response.error;

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      try {
        const data = await fetchRestaurantDetails(
          restaurantId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data: null, error });
        }
      }
    }

    loadDetails();

    // Cancel when leaving or switching restaurants.
    return () => controller.abort();
  }, [restaurantId, requestKey]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [restaurantId]);

  function handleRetry() {
    headingRef.current?.focus();
    setAttempt((current) => current + 1);
  }

  return (
    <section
      className="restaurant-details"
      aria-labelledby="restaurant-details-title"
    >
      <button type="button" onClick={onBack}>
        Back to results
      </button>

      <h2
        id="restaurant-details-title"
        className="restaurant-details__title"
        ref={headingRef}
        tabIndex={-1}
      >
        {data ? data.restaurant.restaurantName : "Restaurant details"}
      </h2>

      {loading && <p role="status">Loading restaurant details...</p>}

      {error && (
        <div className="restaurant-details__error" role="alert">
          <p>
            {error.status === 404
              ? "This restaurant could not be found."
              : "Could not load restaurant details. Please try again."}
          </p>

          <button type="button" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          <p>
            {data.restaurant.neighborhood} · {data.restaurant.address}
          </p>

          <h3>Inspection history</h3>
          <p>Inspections are shown newest first.</p>

          <ol className="restaurant-details__history">
            {data.inspections.map((inspection) => (
              <li
                className="restaurant-details__inspection"
                key={inspection.inspectionDate}
              >
                <h4>
                  <time dateTime={inspection.inspectionDate}>
                    {dateFormatter.format(new Date(inspection.inspectionDate))}
                  </time>
                  {" · "}
                  {inspection.result === "pass" ? "Pass" : "Fail"}
                </h4>

                {inspection.violations.length === 0 ? (
                  <p>No violations recorded.</p>
                ) : (
                  <ul>
                    {inspection.violations.map((violation) => (
                      <li key={violation.code}>
                        <strong>{violation.code}:</strong>{" "}
                        {violation.description}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

RestaurantDetails.propTypes = {
  restaurantId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default RestaurantDetails;
