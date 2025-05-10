import { images } from "@/constants/images"; // For placeholder image
import {
  Genre,
  getImageUrl,
  PopularMovieItem as LatestMovieItemType, // Reusing PopularMovieItemType as structure is same
  useLatestMovies,
  useMovieGenres, // Import the new hook
} from "@/services/movieService";
import { useRouter } from "expo-router"; // Import useRouter
import React, { useMemo } from "react"; // Import useMemo
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import LatestMovieCard from "./LatestMovieCard";

// Define the type for the item prop in LatestMovieCard
// This should match the structure expected by LatestMovieCard
interface LatestMovieCardDataType {
  id: string;
  title: string;
  genre: string;
  image: any;
  rating: number;
}

const LatestMoviesSection: React.FC = () => {
  const router = useRouter(); // Initialize router
  const {
    data: latestMoviesData,
    isLoading: isLoadingMovies,
    error: moviesError,
    isError: isMoviesError,
  } = useLatestMovies(1);

  const {
    data: genresData,
    isLoading: isLoadingGenres,
    error: genresError,
    isError: isGenresError,
  } = useMovieGenres();

  const genreMap = useMemo(() => {
    if (!genresData?.genres) return new Map<number, string>();
    return new Map(
      genresData.genres.map((genre: Genre) => [genre.id, genre.name])
    );
  }, [genresData]);

  const getGenreNames = (genreIds: number[]): string => {
    if (!genreIds || genreIds.length === 0) return "Movie";
    return (
      genreIds
        .map((id) => genreMap.get(id))
        .filter(Boolean)
        .slice(0, 2)
        .join(" • ") || "Movie"
    );
  };

  const renderLatestMovieItem = ({ item }: { item: LatestMovieItemType }) => {
    const cardData: LatestMovieCardDataType = {
      id: String(item.id),
      title: item.title,
      genre: getGenreNames(item.genre_ids),
      image: getImageUrl(item.poster_path, "w500") || images.highlight,
      rating: item.vote_average,
    };
    return (
      <LatestMovieCard
        item={cardData}
        onPress={() => router.push(`/movies/${item.id}`)}
      />
    );
  };

  if (isLoadingMovies || isLoadingGenres) {
    return (
      <View className="mb-8 min-h-[300px] flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (
    isMoviesError ||
    isGenresError ||
    (!isLoadingMovies &&
      latestMoviesData &&
      latestMoviesData.results.length === 0)
  ) {
    let errorMessage = "Could not load latest movies. Please try again later.";
    let specificError = "";

    if (isMoviesError && moviesError && "message" in moviesError) {
      specificError = (moviesError as any).message;
    } else if (isGenresError && genresError && "message" in genresError) {
      specificError = (genresError as any).message;
    }

    if (
      !isLoadingMovies &&
      latestMoviesData &&
      latestMoviesData.results.length === 0 &&
      !isMoviesError &&
      !isGenresError
    ) {
      return (
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Latest movies
          </Text>
          <View className="min-h-[300px] flex justify-center items-center bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <Text className="text-gray-300 text-center">
              No latest movies found at the moment.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">Latest movies</Text>
        <View className="min-h-[300px] flex justify-center items-center bg-red-900/30 rounded-lg p-4 border border-red-700/50">
          <Text className="text-red-300 text-center font-semibold">
            Oops! Something went wrong.
          </Text>
          <Text className="text-red-400 text-center text-xs mt-2">
            {errorMessage}
          </Text>
          {specificError && (
            <Text className="text-red-500 text-center text-xs mt-1">
              Details: {specificError}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (!latestMoviesData?.results || latestMoviesData.results.length === 0) {
    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">Latest movies</Text>
        <View className="min-h-[300px] flex justify-center items-center bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <Text className="text-gray-300 text-center">
            No latest movies available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-white text-xl font-bold mb-4">Latest movies</Text>
      <FlatList
        data={latestMoviesData.results}
        renderItem={renderLatestMovieItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // As it's inside a ScrollView
        // The height of this FlatList will be determined by its content.
      />
    </View>
  );
};

export default LatestMoviesSection;
