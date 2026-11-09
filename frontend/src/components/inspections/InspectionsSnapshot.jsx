import PropTypes from "prop-types";
import "./InspectionsSnapshot.css";

const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function InspectionsSnapshot({ total, summary = null, loading, error }) {
  const hasData = !loading && !error && summary !== null;

  const metrics = [
    { label: "Matching restaurants", value: total },
    {
      label: "Inspection records",
      value: summary?.inspectionCount ?? 0,
    },
    {
      label: "Latest pass",
      value: summary?.latestPassCount ?? 0,
    },
    {
      label: "Latest fail",
      value: summary?.latestFailCount ?? 0,
    },
  ];

  const outcomes =
    hasData && total > 0
      ? [
          {
            result: "pass",
            label: "Pass",
            count: summary.latestPassCount,
          },
          {
            result: "fail",
            label: "Fail",
            count: summary.latestFailCount,
          },
        ].filter((outcome) => outcome.count > 0)
      : [];

  return (
    <section
      className="inspections-snapshot"
      aria-labelledby="inspections-snapshot-title"
    >
      <header className="inspections-snapshot__heading">
        <h2 id="inspections-snapshot-title">Restaurant snapshot</h2>
        <p>Across all restaurants matching your applied filters.</p>
      </header>

      <dl className="inspections-snapshot__metrics">
        {metrics.map((metric) => (
          <div className="inspections-snapshot__metric" key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{hasData ? numberFormatter.format(metric.value) : "—"}</dd>
          </div>
        ))}
      </dl>

      <figure className="inspections-snapshot__chart">
        <figcaption>Latest inspection outcomes</figcaption>

        {loading ? (
          <p role="status">Loading snapshot...</p>
        ) : error ? (
          <p>Snapshot unavailable. Use Try again below to reload the data.</p>
        ) : !hasData ? (
          <p>Snapshot data is unavailable.</p>
        ) : total === 0 ? (
          <p>No matching restaurants to chart.</p>
        ) : (
          <ul className="inspections-snapshot__bars">
            {outcomes.map((outcome) => {
              const fraction = outcome.count / total;

              return (
                <li key={outcome.result}>
                  <div className="inspections-snapshot__bar-label">
                    <strong>{outcome.label}</strong>
                    <span>
                      {numberFormatter.format(outcome.count)}{" "}
                      {outcome.count === 1 ? "restaurant" : "restaurants"}
                      {" · "}
                      {percentFormatter.format(fraction)}
                    </span>
                  </div>

                  <div
                    className="inspections-snapshot__track"
                    aria-hidden="true"
                  >
                    <span
                      className={`inspections-snapshot__fill inspections-snapshot__fill--${outcome.result}`}
                      style={{ width: `${fraction * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </figure>

      <p className="inspections-snapshot__note">
        Inspection records include each matching restaurant’s complete history.
        Pass and fail counts use each restaurant’s latest inspection.
      </p>
    </section>
  );
}

InspectionsSnapshot.propTypes = {
  total: PropTypes.number.isRequired,
  summary: PropTypes.shape({
    inspectionCount: PropTypes.number.isRequired,
    latestPassCount: PropTypes.number.isRequired,
    latestFailCount: PropTypes.number.isRequired,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
};

export default InspectionsSnapshot;
