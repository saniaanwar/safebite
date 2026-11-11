import PropTypes from "prop-types";
import "./PageBanner.css";

function PageBanner({ title, image }) {
  return (
    <section
      className="page-banner"
      style={{ "--banner-image": `url("${image}")` }}
    >
      <h1>{title}</h1>
    </section>
  );
}

PageBanner.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default PageBanner;