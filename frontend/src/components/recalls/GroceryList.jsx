import { Link } from "react-router-dom";
import "./GroceryListButton.css";

function GroceryListButton() {
  return (
    <div className="grocery-cta">
      <Link to="/grocery-list" className="grocery-cta-button">
        My Grocery List
      </Link>
      <p>Create your own custom grocery list!</p>
    </div>
  );
}

export default GroceryListButton;