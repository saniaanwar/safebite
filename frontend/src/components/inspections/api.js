async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });

  // A successful delete has no JSON body.
  if (response.status === 204) {
    return null;
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    // Preserve cancellation when an effect cleans up its request.
    if (options.signal?.aborted) {
      throw error;
    }

    const requestError = new Error(
      "Could not read the server response. Please try again.",
    );
    requestError.status = response.status;
    requestError.fieldErrors = {};
    throw requestError;
  }

  // Fetch does not automatically reject HTTP error responses.
  if (!response.ok) {
    const error = new Error(
      data?.error || "Could not complete the request. Please try again.",
    );
    error.status = response.status;
    error.fieldErrors = data?.errors ?? {};
    throw error;
  }

  return data;
}

export function fetchRestaurants(query, signal) {
  const params = new URLSearchParams({
    name: query.name,
    neighborhood: query.neighborhood,
    result: query.result,
    page: String(query.page),
    pageSize: "10",
  });

  return requestJson(`/api/restaurants?${params}`, { signal });
}

export function fetchRestaurantDetails(restaurantId, signal) {
  return requestJson(`/api/restaurants/${encodeURIComponent(restaurantId)}`, {
    signal,
  });
}

export function fetchReports(restaurantId, signal) {
  return requestJson(
    `/api/restaurants/${encodeURIComponent(restaurantId)}/reports`,
    { signal, cache: "no-store" },
  );
}

export function createReport(restaurantId, { visitDate, description }, signal) {
  return requestJson(
    `/api/restaurants/${encodeURIComponent(restaurantId)}/reports`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitDate, description }),
      signal,
    },
  );
}

export function updateReport(reportId, { visitDate, description }, signal) {
  return requestJson(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitDate, description }),
    signal,
  });
}

export function deleteReport(reportId, signal) {
  return requestJson(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: "DELETE",
    signal,
  });
}
