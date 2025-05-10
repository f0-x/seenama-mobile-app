import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, TMDB_CONFIG } from "./api"; // Assuming api.ts is in the same directory

// --- Zod Schemas for Movie Service ---

// Schema for a single movie item in the popular movies list
const PopularMovieItemSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  genre_ids: z.array(z.number()),
  id: z.number(), // TMDB uses number IDs
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  release_date: z.string(), // Consider z.date() if you parse it
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

// Schema for the entire popular movies API response
export const PopularMoviesApiResponseSchema = z.object({
  page: z.number(),
  results: z.array(PopularMovieItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

// --- Type definitions inferred from Zod schemas ---
export type PopularMovieItem = z.infer<typeof PopularMovieItemSchema>;
export type PopularMoviesApiResponse = z.infer<
  typeof PopularMoviesApiResponseSchema
>;

// --- Query Keys ---
export const movieQueryKeys = {
  popular: (page: number) => ["popularMovies", page] as const,
  // Add other movie-related keys here, e.g., latest, details, search
};

// --- Service-Level Functions ---

/**
 * Fetches popular movies from TMDB.
 * @param page - The page number to fetch.
 * @returns A promise that resolves to the popular movies API response.
 */
export const getPopularMovies = (
  page: number = 1
): Promise<PopularMoviesApiResponse> => {
  return apiRequest({
    method: "GET",
    endpoint: "/movie/popular",
    schema: PopularMoviesApiResponseSchema,
    params: {
      language: "en-US", // As per example
      page: page,
      // api_key is handled by the Authorization header in apiRequest
    },
    headers: {
      // TMDB specific headers
      accept: "application/json",
    },
  });
};

// --- Custom Hooks for Tanstack Query ---

/**
 * Custom hook to fetch popular movies using Tanstack Query.
 * @param page - The page number to fetch.
 * @param options - Optional Tanstack Query options.
 * @returns The result of the useQuery hook.
 */
export const usePopularMovies = (page: number = 1, options?: object) => {
  return useQuery<PopularMoviesApiResponse, Error>({
    queryKey: movieQueryKeys.popular(page),
    queryFn: () => getPopularMovies(page),
    ...options,
  });
};

// Helper function to construct full image URLs
export const getImageUrl = (
  path: string | null | undefined,
  size: string = "w500"
): string | undefined => {
  if (!path) return undefined;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};
