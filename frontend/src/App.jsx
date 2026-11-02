import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Could not reach backend"));
  }, []);

  return (
    <main>
      <h1>SafeBite</h1>
      <p>{message}</p>
    </main>
  );
}

export default App;