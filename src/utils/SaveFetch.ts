export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(input, init);

    // Clone response so we can inspect the JSON
    const clone = response.clone();

    try {
      const data = await clone.json();
      console.log("🧩 safeFetch response data:", data);

      if (data?.message === "Token expired" || data?.message === "User logged out") {
        console.warn("⚠️ Token expired or user logged out detected!");
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    } catch (jsonError) {
      console.log("ℹ️ Response is not JSON or cannot parse:", jsonError);
    }

    return response;
  } catch (error) {
    console.error("❌ Network error in safeFetch:", error);
    throw error;
  }
}
