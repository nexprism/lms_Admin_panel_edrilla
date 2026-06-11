// SECURITY: send credentials (the httpOnly auth cookie) on requests to OUR API so
// authentication no longer depends on a JWT in localStorage. Scoped to our API
// hosts / relative URLs so cross-origin third-party requests are unaffected.
declare global {
  interface Window {
    __fetchCredsPatched?: boolean;
  }
}

if (typeof window !== "undefined" && window.fetch && !window.__fetchCredsPatched) {
  const original = window.fetch.bind(window);

  const isOurApi = (url: string): boolean => {
    if (!url) return false;
    if (!/^https?:\/\//i.test(url)) return true; // relative => same origin
    return (
      url.includes("edrilla.com") ||
      url.includes("nexprism") ||
      url.includes("localhost:5000") ||
      url.includes("localhost:4000") ||
      url.includes("localhost:5050") ||
      url.includes("127.0.0.1:5000") ||
      url.includes("127.0.0.1:5050")
    );
  };

  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : (input as Request)?.url || String(input);
    if (isOurApi(url) && init.credentials === undefined) {
      init = { ...init, credentials: "include" };
    }
    return original(input, init);
  };
  window.__fetchCredsPatched = true;
}

export {};
