// src/lib/fetch-utils.ts — Safe JSON parsing utilities
export async function safeFetchJSON<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(input, init);
    
    if (!response.ok) {
      console.error("[safeFetchJSON] Request failed with status:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("[safeFetchJSON] Response is not JSON:", contentType);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("[safeFetchJSON] Error:", error);
    return null;
  }
}

export async function safeFetchJSONWithResponse<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ data: T | null; response: Response | null }> {
  try {
    const response = await fetch(input, init);
    
    if (!response.ok) {
      console.error("[safeFetchJSONWithResponse] Request failed with status:", response.status);
      return { data: null, response };
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("[safeFetchJSONWithResponse] Response is not JSON:", contentType);
      return { data: null, response };
    }
    
    const data = await response.json();
    return { data, response };
  } catch (error) {
    console.error("[safeFetchJSONWithResponse] Error:", error);
    return { data: null, response: null };
  }
}
