import { Link } from "react-router-dom"; // The homepage looks good!
import SiteFooter from "./SiteFooter.jsx";
import "./Home.css";

function Home() {
  return (
    <>
      <main>
        <section className="home-hero">
          <h1>IS IT SAFE?</h1>
        </section>

        <section className="home-intro">
          <p>
            Do you love going out to eat? Or are you more of a cook-at-home
            person? Either way, if you love to eat, you’re in the right place.
            SafeBite brings together food recalls and Boston restaurant
            inspection records so you can eat safely, wherever your meal comes
            from. Create your own grocery list to see if anything you bought has
            been recalled, and check out your favorite restaurants or discover
            new ones.
          </p>
          <p className="home-intro-tagline">
            We’re here for you. Eat safe with SafeBite.
          </p>
        </section>

        <div className="home-sections">
          <section className="home-section">
            <h2>Food Recalls</h2>
            <Link to="/recalls" className="home-button">
              View food recalls
            </Link>
          </section>

          <section className="home-section">
            <h2>Restaurant Inspections</h2>
            <Link to="/restaurants" className="home-button">
              View restaurant inspections
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
Home.propTypes = {};

export default Home;
