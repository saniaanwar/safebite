import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import InspectionsPage from "./components/inspections/InspectionsPage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="site-shell">
        <a className="site-shell__skip-link" href="#main-content">
          Skip to content
        </a>

        <Navbar />

        <main className="site-shell__content" id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Navigate to="/restaurants" replace />} />
            <Route path="/restaurants" element={<InspectionsPage />} />
            <Route path="*" element={<Navigate to="/restaurants" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

App.propTypes = {};

export default App;
