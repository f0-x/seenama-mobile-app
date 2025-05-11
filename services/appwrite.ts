import { Client, Databases, ID, Query } from "react-native-appwrite"; // Added Query

const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
// Assuming the collection for metrics is specifically named, let's use a more specific var
const METRICS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID; // Ensure this env var is set
const API_ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_API_ENDPOINT ??
  "https://cloud.appwrite.io/v1"; // Default to general cloud endpoint

if (!PROJECT_ID || !DATABASE_ID || !METRICS_COLLECTION_ID) {
  console.error(
    "Appwrite environment variables are not fully configured for metrics logging."
  );
}

const client = new Client();

if (API_ENDPOINT && PROJECT_ID) {
  client.setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
} else {
  console.error(
    "Appwrite client could not be configured. API_ENDPOINT or PROJECT_ID is missing."
  );
}

const databases = new Databases(client);

export interface MetricData {
  search_term: string;
  search_word_count?: number;
  cover_img_url: string;
  movie_id: number;
  movie_title: string;
}

export const logSearchMetric = async (
  metricDataInput: Omit<MetricData, "search_word_count">
): Promise<void> => {
  if (!databases || !DATABASE_ID || !METRICS_COLLECTION_ID) {
    console.error(
      "Appwrite database or collection ID not configured. Cannot log metric."
    );
    return;
  }

  try {
    const existingDocuments = await databases.listDocuments(
      DATABASE_ID,
      METRICS_COLLECTION_ID,
      [
        Query.equal("search_term", metricDataInput.search_term),
        Query.equal("movie_id", metricDataInput.movie_id),
        Query.limit(1), // We only need to know if one exists
      ]
    );

    if (existingDocuments.total > 0 && existingDocuments.documents.length > 0) {
      // Document exists, update it
      const doc = existingDocuments.documents[0];
      const currentCount = doc.search_word_count || 0; // Default to 0 if undefined, though it should be set
      const updatedData = {
        ...metricDataInput, // Keep other data potentially updated (e.g., cover_img_url if it can change)
        search_word_count: currentCount + 1,
        // Ensure all required fields are present even if not changing
        search_term: doc.search_term,
        movie_id: doc.movie_id,
        movie_title: doc.movie_title,
        cover_img_url: doc.cover_img_url,
      };
      // Remove any fields from updatedData that are not part of the MetricData interface or are system generated like $id, $permissions etc.
      const {
        $id,
        $collectionId,
        $databaseId,
        $createdAt,
        $updatedAt,
        $permissions,
        ...payloadToUpdate
      } = doc;

      const finalPayload = {
        ...payloadToUpdate, // existing non-system fields
        ...metricDataInput, // new data (might overwrite title, cover_img_url if they changed)
        search_word_count: currentCount + 1,
      };

      await databases.updateDocument(
        DATABASE_ID,
        METRICS_COLLECTION_ID,
        doc.$id,
        finalPayload
      );
      // console.log("Search metric updated:", finalPayload.search_term, finalPayload.movie_title, finalPayload.search_word_count);
    } else {
      // Document does not exist, create a new one
      const newMetricData: MetricData = {
        ...metricDataInput,
        search_word_count: 1,
      };
      await databases.createDocument(
        DATABASE_ID,
        METRICS_COLLECTION_ID,
        ID.unique(),
        newMetricData
      );
      // console.log("New search metric logged:", newMetricData.search_term, newMetricData.movie_title);
    }
  } catch (error) {
    console.error("Failed to log/update search metric to Appwrite:", error);
  }
};

import { queryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"; // Import Tanstack Query
// Export client if needed elsewhere, though for this task, only logSearchMetric is primary
export { client as appwriteClient, databases as appwriteDatabases };

// Interface for the movie data we want to derive from metrics for display
export interface RankedMetricMovie {
  movie_id: number;
  movie_title: string;
  cover_img_url: string;
  total_search_count: number; // Aggregated or highest search_count
  // We won't have genre_ids or TMDB rating directly from metrics
}

/**
 * Fetches and processes metrics to determine most searched movies.
 * This is a simplified version. For true aggregation, server-side functions
 * or more extensive client-side processing of all metrics would be needed.
 * This version fetches top metric entries and de-duplicates by movie_id.
 */
export const getMostSearchedMoviesFromMetrics = async (
  limit: number = 10
): Promise<RankedMetricMovie[]> => {
  if (!databases || !DATABASE_ID || !METRICS_COLLECTION_ID) {
    console.error("Appwrite database or collection ID not configured for fetching metrics."); // Keep console.error for debugging
    return [];
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      METRICS_COLLECTION_ID,
      [
        Query.orderDesc("search_word_count"), // Order by how many times this specific movie appeared in a search
        Query.limit(100), // Fetch a larger set to get variety before de-duping, e.g., 100
      ]
    );


    const uniqueMoviesMap = new Map<number, RankedMetricMovie>();

    for (const doc of response.documents) {
      const metric = doc as unknown as MetricData; // Cast to full MetricData to access fields
      if (!uniqueMoviesMap.has(metric.movie_id)) {
        if (uniqueMoviesMap.size < limit) {
          // Collect until we have 'limit' unique movies
          uniqueMoviesMap.set(metric.movie_id, {
            movie_id: metric.movie_id,
            movie_title: metric.movie_title,
            cover_img_url: metric.cover_img_url,
            total_search_count: metric.search_word_count ?? 0, // Using the count from this top metric entry
          });
        } else {
          break; // Stop if we have enough unique movies
        }
      }
      // For a more accurate total_search_count, one would need to fetch all documents
      // for a movie_id and sum them up, or do this aggregation server-side.
      // This simplified version takes the search_count of the highest individual metric entry
      // for that movie among the top 100 overall metrics.
    }

    // The map already ensures uniqueness and takes the first encountered (highest search_count due to sorting)
    // Convert map values to array
    return Array.from(uniqueMoviesMap.values());
  } catch (error) {
    console.error("Failed to fetch most searched movies from Appwrite:", error);
    return [];
  }
};

// --- Tanstack Query Integration for Appwrite Metrics ---

export const appwriteMetricsQueries = {
  all: () => ["appwriteMetrics"] as const,
  mostSearched: (limit: number = 10) =>
    queryOptions<
      RankedMetricMovie[],
      Error,
      RankedMetricMovie[],
      readonly ["appwriteMetrics", "mostSearched", number]
    >({
      queryKey: [
        ...appwriteMetricsQueries.all(),
        "mostSearched",
        limit,
      ] as const,
      queryFn: () => getMostSearchedMoviesFromMetrics(limit),
      staleTime: 1000 * 10 // Cache for 10 second
      // staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    }),
};

export const useMostSearchedMoviesFromMetrics = (
  limit: number = 10,
  // Allow overriding any option except queryKey and queryFn
  // options?: Omit<Parameters<typeof useQuery<RankedMetricMovie[]>>[0], 'queryKey' | 'queryFn'>
  options?: Omit<
    UseQueryOptions<
      RankedMetricMovie[],
      Error,
      RankedMetricMovie[],
      readonly ["appwriteMetrics", "mostSearched", number]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const factoryOptions = appwriteMetricsQueries.mostSearched(limit);
  return useQuery({
    ...factoryOptions,
    ...options,
  });
};
