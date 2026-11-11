import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main>
      <section className="home-hero">
        <h1>IS IT SAFE?</h1>
      </section>

      <div className="home-sections">
        <section className="home-section">
          <h2>Food Recalls</h2>
          <p>{/* recals description */}</p>
          <Link to="/recalls" className="home-button">
            View food recalls
          </Link>
        </section>

        <section className="home-section">
          <h2>Restaurant Inspections</h2>
          <p>{/* inspection description */}</p>
          <Link to="/restaurants" className="home-button">
            View restaurant inspections
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Home;