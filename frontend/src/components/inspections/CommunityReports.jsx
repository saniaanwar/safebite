import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { fetchReports } from "./api";
import "./CommunityReports.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function CommunityReports({ restaurantId }) {
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState({
    key: null,
    data: null,
    error: null,
  });
  const headingRef = useRef(null);

  const requestKey = `${restaurantId}:${attempt}`;
  const loading = response.key !== requestKey;
  const data = loading ? null : response.data;
  const error = loading ? null : response.error;
  const reportCount = data?.reports.length ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      try {
        const data = await fetchReports(restaurantId, controller.signal);

        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, data: null, error });
        }
      }
    }

    loadReports();

    return () => controller.abort();
  }, [restaurantId, requestKey]);

  function handleRefresh() {
    headingRef.current?.focus();
    setAttempt((current) => current + 1);
  }

  return (
    <section
      className="community-reports"
      aria-labelledby="community-reports-title"
    >
      <header className="community-reports__header">
        <h3
          id="community-reports-title"
          className="community-reports__title"
          ref={headingRef}
          tabIndex={-1}
        >
          Community reports
        </h3>

        {data && (
          <div className="community-reports__actions">
            <p className="community-reports__count" role="status">
              {reportCount.toLocaleString("en-US")}{" "}
              {reportCount === 1 ? "report" : "reports"}
            </p>

            <button
              className="community-reports__button"
              type="button"
              onClick={handleRefresh}
            >
              Refresh reports
            </button>
          </div>
        )}
      </header>

      <p className="community-reports__intro">
        Observations from restaurant visits, shown newest first.
      </p>

      {loading && <p role="status">Loading community reports...</p>}

      {error && (
        <div className="community-reports__error" role="alert">
          <p>
            {error.status === 404
              ? "Community reports are unavailable for this restaurant."
              : "Could not load community reports. Please try again."}
          </p>

          <button
            className="community-reports__button"
            type="button"
            onClick={handleRefresh}
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          {data.currentUserId === null && (
            <p className="community-reports__notice">
              Sign in to share an observation or manage your own reports.
            </p>
          )}

          {reportCount === 0 ? (
            <p className="community-reports__empty">
              No community reports have been posted for this restaurant.
            </p>
          ) : (
            <ul className="community-reports__list">
              {data.reports.map((report) => (
                <li className="community-reports__report" key={report._id}>
                  <h4>
                    Visit on{" "}
                    <time dateTime={report.visitDate}>
                      {dateFormatter.format(new Date(report.visitDate))}
                    </time>
                  </h4>

                  <p className="community-reports__author">
                    {report.authorId === data.currentUserId
                      ? "You"
                      : report.authorName || "Community member"}
                  </p>

                  <p className="community-reports__description">
                    {report.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

CommunityReports.propTypes = {
  restaurantId: PropTypes.string.isRequired,
};

export default CommunityReports;
