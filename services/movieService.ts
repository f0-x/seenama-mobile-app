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

// Schema for a single Genre
const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Schema for the API response for movie genres list
export const MovieGenresApiResponseSchema = z.object({
  genres: z.array(GenreSchema),
});

// --- Type definitions inferred from Zod schemas ---
export type PopularMovieItem = z.infer<typeof PopularMovieItemSchema>;
export type PopularMoviesApiResponse = z.infer<
  typeof PopularMoviesApiResponseSchema
>;
export type Genre = z.infer<typeof GenreSchema>;
export type MovieGenresApiResponse = z.infer<
  typeof MovieGenresApiResponseSchema
>;

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
      language: "en-US",
      page: page,
    },
    headers: {
      accept: "application/json",
    },
  });
};

/**
 * Fetches latest movies (discover endpoint) from TMDB.
 * @param page - The page number to fetch.
 * @returns A promise that resolves to the discover movies API response.
 */
export const getLatestMovies = (
  page: number = 1
): Promise<PopularMoviesApiResponse> => {
  // Reusing PopularMoviesApiResponseSchema as structure is same
  return apiRequest({
    method: "GET",
    endpoint: "/discover/movie",
    schema: PopularMoviesApiResponseSchema, // Reusing schema
    params: {
      include_adult: false,
      include_video: false,
      language: "en-US",
      page: page,
      sort_by: "popularity.desc",
    },
    headers: {
      accept: "application/json",
    },
  });
};

// --- Query Factory for Movies (Consolidated) ---
export const movieQueries = {
  all: () => ["movies"] as const, // Base key for all movie-related queries

  popularLists: () => [...movieQueries.all(), "popular"] as const,
  popularList: (page: number = 1) =>
    queryOptions({
      queryKey: [...movieQueries.popularLists(), page] as const,
      queryFn: () => getPopularMovies(page),
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
    }),

  latestLists: () => [...movieQueries.all(), "latest"] as const,
  latestList: (page: number = 1) =>
    queryOptions({
      queryKey: [...movieQueries.latestLists(), page] as const,
      queryFn: () => getLatestMovies(page),
      staleTime: 1000 * 60 * 10, // 10 minutes stale time
    }),

  genresList: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), "genres"] as const,
      queryFn: () => getMovieGenres(),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours stale time, genres don't change often
    }),

  // Example for movie details:
  // detailsBase: () => [...movieQueries.all(), 'detail'] as const,
  // detail: (id: number) =>
  //   queryOptions({
  //     queryKey: [...movieQueries.detailsBase(), id] as const,
  //     queryFn: () => getMovieDetails(id), // Assuming getMovieDetails function exists
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
  return useQuery(movieQueries.popularList(page));
};

/**
 * Custom hook to fetch latest movies using Tanstack Query with queryOptions.
 * @param page - The page number to fetch.
 * @returns The result of the useQuery hook.
 */
export const useLatestMovies = (page: number = 1) => {
  return useQuery(movieQueries.latestList(page));
};

/**
 * Fetches the list of movie genres from TMDB.
 * @returns A promise that resolves to the movie genres API response.
 */
export const getMovieGenres = (): Promise<MovieGenresApiResponse> => {
  return apiRequest({
    method: "GET",
    endpoint: "/genre/movie/list",
    schema: MovieGenresApiResponseSchema,
    params: {
      language: "en-US",
    },
    headers: {
      accept: "application/json",
    },
  });
};

// --- Custom Hook for Movie Genres ---
/**
 * Custom hook to fetch movie genres using Tanstack Query.
 * @returns The result of the useQuery hook for movie genres.
 */
export const useMovieGenres = () => {
  return useQuery(movieQueries.genresList());
};

// Helper function to construct full image URLs
export const getImageUrl = (
  path: string | null | undefined,
  size: string = "w500"
): string | undefined => {
  if (!path) return undefined;
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};
