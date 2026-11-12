import { useEffect, useState } from "react";
import PageBanner from "../PageBanner.jsx";
import CategoryButtons from "./CategoryButtons.jsx";
import SearchBar from "./SearchBar.jsx";
import GroceryListButton from "./GroceryListButton.jsx";
import RecallCard from "./RecallCard.jsx";
import Pagination from "./Pagination.jsx";
import { CATEGORIES } from "./categories.js";
import "./RecallsPage.css";

const PAGE_SIZE = 8;

function RecallsPage() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [recalls, setRecalls] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    let ignore = false;
    setLoading(true);
    setError("");

    fetch(`/api/recalls?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setRecalls(data.recalls);
          setTotalPages(data.totalPages);
        }
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load recalls. Try again.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [category, search, page]);

  function handleCategory(nextCategory) {
    setCategory(nextCategory);
    setPage(1);
  }

  function handleSearch(nextSearch) {
    setSearch(nextSearch);
    setPage(1);
  }

  return (
    <main>
      <PageBanner title="FOOD RECALLS" image="/grocery.jpg" position="center 60%" />

      <div className="recalls-content">
        <CategoryButtons
          categories={CATEGORIES}
          selected={category}
          onSelect={handleCategory}
        />

        <div className="recalls-toolbar">
          <SearchBar onSearch={handleSearch} />
          <GroceryListButton />
        </div>

        {error && <p className="recalls-message">{error}</p>}
        {!error && loading && <p className="recalls-message">Loading recalls . . .</p>}
        {!error && !loading && recalls.length === 0 && (
          <p className="recalls-message">No recalls match your search.</p>
        )}

        {!error && !loading && recalls.length > 0 && (
          <>
            <div className="recalls-grid">
              {recalls.map((recall) => (
                <RecallCard key={recall._id} recall={recall} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default RecallsPage;