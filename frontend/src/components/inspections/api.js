export async function fetchRestaurants(query, signal) {
  const params = new URLSearchParams({
    name: query.name,
    neighborhood: query.neighborhood,
    result: query.result,
    page: String(query.page),
    pageSize: "10",
  });

  const response = await fetch(`/api/restaurants?${params}`, {
    signal,
  });

  // Fetch does not automatically reject HTTP error responses.
  if (!response.ok) {
    throw new Error(`Restaurant request failed with HTTP ${response.status}.`);
  }

  return response.json();
}

export async function fetchRestaurantDetails(restaurantId, signal) {
  const response = await fetch(
    `/api/restaurants/${encodeURIComponent(restaurantId)}`,
    { signal },
  );

  if (!response.ok) {
    const error = new Error(
      `Restaurant details request failed with HTTP ${response.status}.`,
    );

    // Let the component distinguish a missing restaurant from other errors.
    error.status = response.status;
    throw error;
  }

  return response.json();
}
