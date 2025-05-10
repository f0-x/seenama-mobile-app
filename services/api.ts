import { z } from "zod";

// Define a base URL for your API
// Replace this with your actual API endpoint or use environment variables
export const TMDB_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY,
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
};

// --- Base API Wrapper ---

interface ApiRequestConfig<TResponseSchema extends z.ZodTypeAny> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  schema: TResponseSchema;
  params?: Record<string, string | number | boolean>; // For URL query parameters
  body?: Record<string, any> | FormData; // For request body
  headers?: Record<string, string>;
}

async function apiRequest<TResponseSchema extends z.ZodTypeAny>(
  config: ApiRequestConfig<TResponseSchema>
): Promise<z.infer<TResponseSchema>> {
  const {
    method,
    endpoint,
    schema,
    params,
    body,
    headers: customHeaders,
  } = config;

  const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (TMDB_CONFIG.API_KEY) {
    headers["Authorization"] = `Bearer ${TMDB_CONFIG.API_KEY}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      // FormData will set its own Content-Type
      delete (requestOptions.headers as Record<string, string>)["Content-Type"];
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url.toString(), requestOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `HTTP error ${response.status}: ${response.statusText}. Failed to parse error response.`,
        };
      }
      console.error(
        `API request to ${endpoint} failed with status ${response.status}:`,
        errorData
      );
      throw new Error(
        errorData?.message ||
          `HTTP error ${response.status}: ${response.statusText}`
      );
    }

    // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
    if (response.status === 204) {
      // If a schema expects a specific empty response (e.g. z.null() or z.undefined()),
      // ensure it's handled. For now, assuming 204 means successful empty response.
      // If schema expects data, this will fail validation, which is correct.
      const emptyParse = schema.safeParse(null); // Or undefined, depending on schema
      if (emptyParse.success) return emptyParse.data;
    }

    const responseData = await response.json();
    const validationResult = schema.safeParse(responseData);

    if (!validationResult.success) {
      console.error(
        `Zod validation error for ${method} ${endpoint}:`,
        validationResult.error.flatten()
      );
      throw new Error(
        `Data validation failed for ${method} ${endpoint}. Check console for details.`
      );
    }

    return validationResult.data;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    // Ensure the error is an instance of Error for consistent handling
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        String(error) || "An unknown error occurred during the API request."
      );
    }
  }
}

// Export the base apiRequest function for use in service-level functions
export { apiRequest };
