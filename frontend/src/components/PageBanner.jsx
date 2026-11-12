import PropTypes from "prop-types";
import "./PageBanner.css";

function PageBanner({ title, image, position = "center" }) {
  return (
    <section
      className="page-banner"
      style={{
        "--banner-image": `url("${image}")`,
        "--banner-position": position,
      }}
    >
      <h1>{title}</h1>
    </section>
  );
}

PageBanner.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  position: PropTypes.string,
};

export default PageBanner;
