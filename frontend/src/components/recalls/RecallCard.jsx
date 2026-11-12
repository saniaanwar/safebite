import PropTypes from "prop-types";
import "./RecallCard.css";

const CLASS_STYLES = {
  "Class I": "recall-badge-class1",
  "Class II": "recall-badge-class2",
  "Class III": "recall-badge-class3",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecallCard({ recall }) {
  return (
    <article className="recall-card">
      <p className="recall-card-category">{recall.category}</p>
      <h3>{recall.product}</h3>
      <p className="recall-card-brand">
        {recall.brand} · {recall.packageSize}
      </p>

      <div className="recall-card-badges">
        <span className={`recall-badge ${CLASS_STYLES[recall.classification]}`}>
          {recall.classification}
        </span>
        <span className="recall-badge recall-badge-status">{recall.status}</span>
      </div>

      <p className="recall-card-reason">{recall.reason}</p>

      {recall.allergens.length > 0 && (
        <ul className="recall-card-allergens" aria-label="Allergens">
          {recall.allergens.map((allergen) => (
            <li key={allergen}>{allergen}</li>
          ))}
        </ul>
      )}

      <dl className="recall-card-meta">
        <div>
          <dt>Recalled</dt>
          <dd>{formatDate(recall.recallDate)}</dd>
        </div>
        <div>
          <dt>What to do</dt>
          <dd>{recall.consumerAction}</dd>
        </div>
      </dl>
    </article>
  );
}

RecallCard.propTypes = {
  recall: PropTypes.shape({
    product: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    packageSize: PropTypes.string.isRequired,
    classification: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    allergens: PropTypes.arrayOf(PropTypes.string).isRequired,
    recallDate: PropTypes.string.isRequired,
    consumerAction: PropTypes.string.isRequired,
  }).isRequired,
};

export default RecallCard;