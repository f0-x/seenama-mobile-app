import { Client, Databases, ID, Query } from 'react-native-appwrite'; // Added Query

const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
// Assuming the collection for metrics is specifically named, let's use a more specific var
const METRICS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID; // Ensure this env var is set
const API_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_API_ENDPOINT ?? "https://cloud.appwrite.io/v1"; // Default to general cloud endpoint

if (!PROJECT_ID || !DATABASE_ID || !METRICS_COLLECTION_ID) {
  console.error("Appwrite environment variables are not fully configured for metrics logging.");
}

const client = new Client();

if (API_ENDPOINT && PROJECT_ID) {
    client
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID);
} else {
    console.error("Appwrite client could not be configured. API_ENDPOINT or PROJECT_ID is missing.");
}

const databases = new Databases(client);

export interface MetricData {
  search_term: string;
  search_word_count?: number;
  cover_img_url: string;
  movie_id: number;
  movie_title: string;
}

export const logSearchMetric = async (metricDataInput: Omit<MetricData, 'search_word_count'>): Promise<void> => {
  if (!databases || !DATABASE_ID || !METRICS_COLLECTION_ID) {
    console.error("Appwrite database or collection ID not configured. Cannot log metric.");
    return;
  }

  try {
    const existingDocuments = await databases.listDocuments(
      DATABASE_ID,
      METRICS_COLLECTION_ID,
      [
        Query.equal("search_term", metricDataInput.search_term),
        Query.equal("movie_id", metricDataInput.movie_id),
        Query.limit(1) // We only need to know if one exists
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
      const {$id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...payloadToUpdate} = doc;
      
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

// Export client if needed elsewhere, though for this task, only logSearchMetric is primary
export { client as appwriteClient, databases as appwriteDatabases };
