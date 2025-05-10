import { images } from "@/constants/images"; // For placeholder or if needed by PopularMovieCard directly
import {
  getImageUrl,
  PopularMovieItem as PopularMovieItemType,
  usePopularMovies,
} from "@/services/movieService";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import PopularMovieCard from "./PopularMovieCard";

// Define the type for the item prop in renderPopularMovie
// This should match the structure expected by PopularMovieCard
interface PopularMovieCardDataType {
  id: string; // PopularMovieCard expects string id
  title: string;
  genre: string; // Construct this if not directly available or simplify
  image: any; // Source for Image component
  rating: number;
  rank: number; // PopularMovieCard expects rank
}

const PopularMoviesSection: React.FC = () => {
  const router = useRouter();
  const {
    data: popularMoviesData,
    isLoading,
    error,
    isError,
  } = usePopularMovies(1);
  const renderPopularMovie = ({
    item,
    index,
  }: {
    item: PopularMovieItemType;
    index: number;
  }) => {
    // Adapt data from API (PopularMovieItemType) to what PopularMovieCard expects (PopularMovieCardDataType)
    const cardData: PopularMovieCardDataType = {
      id: String(item.id), // Convert number id to string
      title: item.title,
      // TMDB API provides genre_ids, not a single genre string.
      // For simplicity, we'll pass a placeholder or you might map ids to names.
      genre: item.genre_ids.join(", ") || "Movie", // Placeholder genre
      image: getImageUrl(item.poster_path, "w500") || images.highlight, // Use placeholder if no image
      rating: item.vote_average,
      rank: index + 1, // Use index for rank as TMDB popular doesn't provide explicit rank for all items in list
    };
    return (
      <PopularMovieCard
        item={cardData}
        onPress={() => router.push(`/movies/${item.id}`)}
      />
    );
  };

  if (isLoading) {
    return (
      <View className="mb-8 h-72 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (
    isError ||
    (!isLoading && popularMoviesData && popularMoviesData.results.length === 0)
  ) {
    // Handle empty results specifically after loading
    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">
          Popular movies
        </Text>
        <View className="h-[290px] flex justify-center items-center bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <Text className="text-gray-300 text-center">
            No popular movies found at the moment.
          </Text>
        </View>
      </View>
    );
  }

  if (isError) {
    // Handle actual fetch error
    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">
          Popular movies
        </Text>
        <View className="h-[290px] flex justify-center items-center bg-red-900/30 rounded-lg p-4 border border-red-700/50">
          <Text className="text-red-300 text-center font-semibold">
            Oops! Something went wrong.
          </Text>
          <Text className="text-red-400 text-center text-xs mt-2">
            Could not load popular movies. Please try again later.
          </Text>
          {error &&
            "message" in error &&
            typeof (error as any).message === "string" && (
              <Text className="text-red-500 text-center text-xs mt-1">
                Details: {(error as any).message}
              </Text>
            )}
        </View>
      </View>
    );
  }

  // This condition handles the case where data is not yet available but it's not an error or loading state.
  // It can also catch popularMoviesData being null/undefined before results are checked.
  if (!popularMoviesData?.results) {
    // This can be a silent return or a minimal placeholder if preferred,
    // as the isLoading and isError states should cover most visible states.
    // For now, let's return a minimal view consistent with loading, but without indicator.
    return (
      <View className="mb-8 h-72 flex-1 justify-center items-center">
        {/* Placeholder for when data is not yet available but not loading/error - could be empty or minimal text */}
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-4">Popular movies</Text>
      <FlatList
        data={popularMoviesData.results}
        renderItem={renderPopularMovie}
        keyExtractor={(item) => String(item.id)} // Ensure key is a string
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10 }}
        style={{ height: 290 }} // Re-added explicit height
      />
    </View>
  );
};

export default PopularMoviesSection;
