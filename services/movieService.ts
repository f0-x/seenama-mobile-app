import { queryOptions, useQuery } from "@tanstack/react-query";
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

// --- Service-Level Functions (getPopularMovies remains the same) ---

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
    },
    headers: {
      accept: "application/json",
    },
  });
};

// --- Query Factory for Movies ---
export const movieQueries = {
  all: () => ["movies"] as const, // Base key for all movie-related queries
  popularLists: () => [...movieQueries.all(), "popular"] as const,
  popularList: (page: number = 1) =>
    queryOptions({
      queryKey: [...movieQueries.popularLists(), page] as const,
      queryFn: () => getPopularMovies(page),
      staleTime: 1000 * 60 * 5, // 5 minutes stale time example
    }),
  // Add other movie queries here, e.g., details, search, latest
  // Example for movie details:
  // details: () => [...movieQueries.all(), 'detail'] as const,
  // detail: (id: number) =>
  //   queryOptions({
  //     queryKey: [...movieQueries.details(), id] as const,
  //     queryFn: () => getMovieDetails(id), // Assuming getMovieDetails exists
  //     staleTime: 1000 * 60 * 5,
  //   }),
};

// --- Custom Hooks using Query Factory ---

/**
 * Custom hook to fetch popular movies using Tanstack Query with queryOptions.
 * @param page - The page number to fetch.
 * @returns The result of the useQuery hook.
 */
export const usePopularMovies = (page: number = 1) => {
  // The `options` parameter from the old hook can be spread into queryOptions if needed,
  // or specific options like staleTime can be defined directly in the factory.
  return useQuery(movieQueries.popularList(page));
};

// Helper function to construct full image URLs
export const getImageUrl = (
  path: string | null | undefined,
  size: string = "w500"
): string | undefined => {
  if (!path) return undefined;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};
