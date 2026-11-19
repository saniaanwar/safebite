import { useEffect, useState } from "react";
import PageBanner from "../PageBanner.jsx";
import SiteFooter from "../SiteFooter.jsx";
import { useAuth } from "../auth/auth.js";
import GroceryItemForm from "./GroceryItemForm.jsx";
import GroceryItem from "./GroceryItem.jsx";
import RecallAlert from "./RecallAlert.jsx";
import {
  addGroceryItem,
  deleteGroceryItem,
  fetchGroceryItems,
  updateGroceryItem,
} from "./api.js";
import "./GroceryListPage.css";

function GroceryListPage() {
  const { user, loading: authLoading, openAuth } = useAuth();
  const userId = user?.id ?? null;

  // results are connected with the user they belong to
  const [list, setList] = useState({ userId: null, items: [], error: "" });
  const [alertItem, setAlertItem] = useState(null);

  const loadingItems = Boolean(userId) && list.userId !== userId;
  const items = list.userId === userId ? list.items : [];

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();

    fetchGroceryItems(controller.signal)
      .then((data) => setList({ userId, items: data.items, error: "" }))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setList({ userId, items: [], error: err.message });
        }
      });

    return () => controller.abort();
  }, [userId]);

  async function handleAdd(name) {
    const { item } = await addGroceryItem(name);
    setList((current) => ({ ...current, items: [item, ...current.items] }));
    if (item.recalls.length > 0) setAlertItem(item);
  }

  async function handleUpdate(itemId, name) {
    const { item } = await updateGroceryItem(itemId, name);
    setList((current) => ({
      ...current,
      items: current.items.map((entry) =>
        entry._id === itemId ? item : entry,
      ),
    }));
    if (item.recalls.length > 0) setAlertItem(item);
  }

  async function handleDelete(itemId) {
    await deleteGroceryItem(itemId);
    setList((current) => ({
      ...current,
      items: current.items.filter((entry) => entry._id !== itemId),
    }));
  }

  function renderContent() {
    if (authLoading) {
      return <p className="grocery-page__message">Checking your sign-in…</p>;
    }

    if (!user) {
      return (
        <div className="grocery-page__signin">
          <p>Want to create your own grocery list? Sign in!</p>
          <button type="button" onClick={() => openAuth("login")}>
            Sign in
          </button>
        </div>
      );
    }

    const recalledCount = items.filter(
      (item) => item.recalls.length > 0,
    ).length;

    return (
      <>
        <p className="grocery-page__intro">
          Add groceries that you’d like to buy. We’ll tell you if they’ve been
          recalled!
        </p>

        <GroceryItemForm onAdd={handleAdd} />

        {list.error && (
          <p className="grocery-page__message" role="alert">
            {list.error}
          </p>
        )}

        {loadingItems && (
          <p className="grocery-page__message">Loading your list…</p>
        )}

        {!loadingItems && !list.error && items.length === 0 && (
          <p className="grocery-page__message">Your list is empty.</p>
        )}

        {!loadingItems && items.length > 0 && (
          <>
            <p className="grocery-page__summary">
              {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
              {recalledCount} recalled
            </p>
            <ul className="grocery-page__list">
              {items.map((item) => (
                <GroceryItem
                  key={item._id}
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onShowRecalls={setAlertItem}
                />
              ))}
            </ul>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <main>
        <PageBanner
          title="MY GROCERY LIST"
          image="/grocery.jpg"
          position="center 60%"
        />
        <div className="grocery-page">{renderContent()}</div>
      </main>

      <RecallAlert item={alertItem} onClose={() => setAlertItem(null)} />
      <SiteFooter showFdaLink />
    </>
  );
}

GroceryListPage.propTypes = {};

export default GroceryListPage;
