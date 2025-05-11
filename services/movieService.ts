import {
  queryOptions,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions, // Ensure UseQueryOptions is imported
} from "@tanstack/react-query";
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

// Schemas for Movie Details
const ProductionCompanySchema = z.object({
  id: z.number(),
  logo_path: z.string().nullable(),
  name: z.string(),
  origin_country: z.string(),
});

const ProductionCountrySchema = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
});

const SpokenLanguageSchema = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
});

export const MovieDetailSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z.object({}).nullable().or(z.any()), // Can be more specific if needed
  budget: z.number(),
  genres: z.array(GenreSchema), // Uses the existing GenreSchema
  homepage: z.string().nullable(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string().nullable(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(ProductionCompanySchema),
  production_countries: z.array(ProductionCountrySchema),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number().nullable(),
  spoken_languages: z.array(SpokenLanguageSchema),
  status: z.string(),
  tagline: z.string().nullable(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
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
export type MovieDetail = z.infer<typeof MovieDetailSchema>;

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
  all: () => ["movies"] as const,

  popularLists: () => [...movieQueries.all(), "popular"] as const,
  popularList: (page: number = 1) =>
    queryOptions<
      PopularMoviesApiResponse,
      Error,
      PopularMoviesApiResponse,
      readonly ["movies", "popular", number]
    >({
      queryKey: [...movieQueries.popularLists(), page] as const, // Matches TQueryKey
      queryFn: () => getPopularMovies(page),
      staleTime: 1000 * 60 * 5,
    }),

  latestLists: () => [...movieQueries.all(), "latest"] as const,
  latestList: (page: number = 1) =>
    queryOptions<
      PopularMoviesApiResponse,
      Error,
      PopularMoviesApiResponse,
      readonly ["movies", "latest", number]
    >({
      queryKey: [...movieQueries.latestLists(), page] as const, // Matches TQueryKey
      queryFn: () => getLatestMovies(page),
      staleTime: 1000 * 60 * 10,
    }),

  genresList: () =>
    queryOptions({
      queryKey: [...movieQueries.all(), "genres"] as const,
      queryFn: () => getMovieGenres(),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours stale time, genres don't change often
    }),

  searchLists: () => [...movieQueries.all(), "search"] as const,
  searchList: (query: string) => ({
    // Returns the full options object for useInfiniteQuery
    queryKey: [...movieQueries.searchLists(), query] as const,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      searchMovies(query, pageParam as number), // Ensure pageParam is number
    initialPageParam: 1,
    getNextPageParam: (lastPage: PopularMoviesApiResponse) => {
      return lastPage.page < lastPage.total_pages
        ? lastPage.page + 1
        : undefined;
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  }),

  detailsBase: () => [...movieQueries.all(), "detail"] as const,
  detail: (movieId: number) =>
    queryOptions<
      MovieDetail,
      Error,
      MovieDetail,
      readonly ["movies", "detail", number]
    >({
      queryKey: [...movieQueries.detailsBase(), movieId] as const,
      queryFn: () => getMovieDetails(movieId),
      staleTime: 1000 * 60 * 15, // Cache movie details for 15 minutes
    }),
};

// --- Custom Hooks using Query Factory ---

/**
 * Custom hook to fetch popular movies using Tanstack Query with queryOptions.
 * @param page - The page number to fetch.
 * @returns The result of the useQuery hook.
 */
export const usePopularMovies = (
  page: number = 1,
  options?: Omit<
    UseQueryOptions<
      PopularMoviesApiResponse,
      Error,
      PopularMoviesApiResponse,
      readonly ["movies", "popular", number]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const factoryOptions = movieQueries.popularList(page);
  return useQuery(
    // <
    //   PopularMoviesApiResponse,
    //   Error,
    //   PopularMoviesApiResponse,
    //   typeof factoryOptions.queryKey
    // >
    {
      ...factoryOptions,
      ...options,
    }
  );
};

/**
 * Custom hook to fetch latest movies using Tanstack Query with queryOptions.
 * @param page - The page number to fetch.
 * @param options - Optional query options to pass to the hook.
 * @returns The result of the useQuery hook.
 */
export const useLatestMovies = (
  page: number = 1,
  options?: Omit<
    UseQueryOptions<
      PopularMoviesApiResponse,
      Error,
      PopularMoviesApiResponse,
      readonly ["movies", "latest", number]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const factoryOptions = movieQueries.latestList(page);
  return useQuery(
    // <
    // PopularMoviesApiResponse,
    // Error,
    // PopularMoviesApiResponse,
    // typeof factoryOptions.queryKey
    // >
    {
      ...factoryOptions,
      ...options,
    }
  );
};

/**
 * Searches for movies on TMDB.
 * @param query - The search query string.
 * @param page - The page number to fetch.
 * @returns A promise that resolves to the search results API response.
 */
export const searchMovies = (
  query: string,
  page: number = 1
): Promise<PopularMoviesApiResponse> => {
  // Reusing PopularMoviesApiResponseSchema
  return apiRequest({
    method: "GET",
    endpoint: "/search/movie",
    schema: PopularMoviesApiResponseSchema, // Reusing schema
    params: {
      query: query,
      include_adult: false,
      language: "en-US",
      page: page,
    },
    headers: {
      accept: "application/json",
    },
  });
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

/**
 * Fetches details for a specific movie from TMDB.
 * @param movieId - The ID of the movie to fetch details for.
 * @returns A promise that resolves to the movie details.
 */
export const getMovieDetails = (movieId: number): Promise<MovieDetail> => {
  return apiRequest({
    method: "GET",
    endpoint: `/movie/${movieId}`,
    schema: MovieDetailSchema,
    params: {
      language: "en-US",
    },
    headers: {
      accept: "application/json",
    },
  });
};

// --- Custom Hook for Searching Movies ---
/**
 * Custom hook to search movies using Tanstack Query.
 * @param query - The search query string.
 * @returns The result of the useInfiniteQuery hook for search results.
 */
export const useSearchMovies = (query: string) => {
  const options = movieQueries.searchList(query);
  return useInfiniteQuery(options);
};

// --- Custom Hook for Movie Details ---
/**
 * Custom hook to fetch movie details using Tanstack Query.
 * @param movieId - The ID of the movie.
 * @param options - Optional query options.
 * @returns The result of the useQuery hook for movie details.
 */
export const useMovieDetails = (
  movieId: number,
  // Simplify options type to avoid deep TQueryKey conflicts, let useQuery handle merging with factoryOptions.queryKey
  options?: Omit<
    UseQueryOptions<
      MovieDetail,
      Error,
      MovieDetail,
      readonly ["movies", "detail", number]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const factoryOptions = movieQueries.detail(movieId);
  return useQuery<
    MovieDetail,
    Error,
    MovieDetail,
    readonly ["movies", "detail", number]
  >({
    ...factoryOptions,
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
