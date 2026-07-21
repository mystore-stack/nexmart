// src/lib/fetch.ts
// Centralized fetch wrapper with automatic auth error handling
import { signOut } from "next-auth/react";
import { useAuthStore } from "../store/index";

interface ApiResponse {
  success: boolean;
  error?: string;
  code?: string;
  action?: "FORCE_SIGN_OUT" | "REAUTHENTICATE";
  data?: any;
}

/**
 * Enhanced fetch wrapper that handles authentication errors
 * Automatically signs out the user when API returns FORCE_SIGN_OUT action
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // Check for FORCE_SIGN_OUT action in JSON responses
  if (!response.ok) {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data: ApiResponse = await response.clone().json();
        
        if (data.action === "FORCE_SIGN_OUT") {
          console.error("[FETCH] FORCE_SIGN_OUT action received, signing out user");
          
          // Clear local auth state
          useAuthStore.getState().setUser(null);
          
          // Sign out from NextAuth
          await signOut({ callbackUrl: "/login" });
          
          // Reload page to ensure clean state
          window.location.href = "/login";
        }
      }
    } catch (error) {
      // If JSON parsing fails, continue with normal error handling
      console.error("[FETCH] Failed to parse error response:", error);
    }
  }

  return response;
}

/**
 * Wrapper for GET requests
 */
export async function get(url: string, options?: RequestInit) {
  return fetchWithAuth(url, { ...options, method: "GET" });
}

/**
 * Wrapper for POST requests
 */
export async function post(url: string, body?: any, options?: RequestInit) {
  return fetchWithAuth(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Wrapper for PUT requests
 */
export async function put(url: string, body?: any, options?: RequestInit) {
  return fetchWithAuth(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Wrapper for DELETE requests
 */
export async function del(url: string, options?: RequestInit) {
  return fetchWithAuth(url, { ...options, method: "DELETE" });
}
