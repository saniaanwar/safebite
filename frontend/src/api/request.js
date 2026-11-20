export async function requestJson(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    // Read a fresh token because Passport rotates sessions at sign-in/sign-out.
    const session = await requestJson("/api/auth/session", {
      signal: options.signal,
      cache: "no-store",
    });
    headers.set("X-CSRF-Token", session.csrfToken);
  }

  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (options.signal?.aborted) throw error;
    const requestError = new Error(
      "Could not read the server response. Please try again.",
    );
    requestError.status = response.status;
    requestError.fieldErrors = {};
    throw requestError;
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      !url.startsWith("/api/auth/") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("safebite:session-changed")); // This is a good way to handle this
    }
    const error = new Error(
      data?.error || "Could not complete the request. Please try again.",
    );
    error.status = response.status;
    error.fieldErrors = data?.errors ?? {};
    throw error;
  }
  return data;
}
