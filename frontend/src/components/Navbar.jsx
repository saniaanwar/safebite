import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const NAV_ITEMS = [
  { label: "Home" },
  { label: "Food Recalls" },
  { label: "Restaurants", path: "/restaurants" },
  { label: "About Us" },
];

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/restaurants" className="navbar-brand">
        <img src="/safebite_logo.png" alt="SafeBite restaurant inspections" />
      </Link>

      <nav aria-label="Main">
        <ul className="navbar-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.path ? (
                <NavLink to={item.path} end>
                  {item.label}
                </NavLink>
              ) : (
                <span
                  className="navbar-link-unavailable"
                  role="link"
                  aria-disabled="true"
                  title={`${item.label} is unavailable in this workspace.`}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

Navbar.propTypes = {};

export default Navbar;
