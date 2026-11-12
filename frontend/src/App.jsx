import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import RecallsPage from "./components/recalls/RecallsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recalls" element={<RecallsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;