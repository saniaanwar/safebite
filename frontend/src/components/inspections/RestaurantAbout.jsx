import { Link } from "react-router-dom";
import "./RestaurantAbout.css";

function RestaurantAbout() {
  return (
    <section
      className="restaurant-about"
      aria-labelledby="restaurant-about-title"
    >
      <h2 id="restaurant-about-title">
        Restaurant inspections &amp; community reports
      </h2>

      <p className="restaurant-about__intro">
        Explore inspection histories and community observations for restaurants
        across five Boston neighborhoods. Start with the latest result, then
        open a restaurant to see its earlier inspections and visit reports.
      </p>

      <ul className="restaurant-about__features">
        <li>
          <h3>Find and compare</h3>
          <p>
            Search by name, neighborhood, or latest result. Combine column sorts
            and compare inspection outcomes across all matching restaurants.
          </p>
        </li>

        <li>
          <h3>Explore inspection history</h3>
          <p>
            Review dated pass and fail results, with recorded violations shown
            alongside each inspection. Histories appear newest first.
          </p>
        </li>

        <li>
          <h3>Share an observation</h3>
          <p>
            Read community reports, or sign in to share a visit observation.
            Each account can edit and delete its own reports.
          </p>
        </li>
      </ul>

      <div className="restaurant-about__data" id="restaurant-data">
        <h3>About the restaurant data</h3>
        <p>
          Restaurant profiles were generated with Mockaroo. The demonstration
          includes 200 fictional restaurants and 1,000 synthetic inspection
          records, with five inspections per restaurant. Community reports are
          observations submitted by users of the demonstration.
        </p>

        <p>
          For official Boston inspection records, visit the separate{" "}
          <a
            href="https://data.boston.gov/dataset/food-establishment-inspections"
            target="_blank"
            rel="noopener noreferrer"
          >
            Boston ISD food establishment inspections dataset
          </a>
          .
        </p>
      </div>

      <div className="restaurant-about__actions">
        <p className="restaurant-about__credit">
          Restaurant inspections and community reports by John Paintsil.
        </p>

        <Link to="/restaurants" className="restaurant-about__link">
          Explore restaurant inspections
        </Link>
      </div>
    </section>
  );
}

RestaurantAbout.propTypes = {};

export default RestaurantAbout;
