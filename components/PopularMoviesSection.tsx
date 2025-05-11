import { images } from "@/constants/images"; // For fallback image
import { RankedMetricMovie, useMostSearchedMoviesFromMetrics } from "@/services/appwrite";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import PopularMovieCard from "./PopularMovieCard";

// Define the type for the item prop in renderPopularMovie
// This should match the structure expected by PopularMovieCard
interface PopularMovieCardDataType {
  id: string;
  title: string;
  genre: string;
  image: any;
  rating: number; // TMDB style rating, might not be directly available from metrics
  rank: number;
}

const PopularMoviesSection: React.FC = () => {
  const router = useRouter();

  const {
    data: mostSearchedMoviesData,
    isLoading,
    error,
    isError,
  } = useMostSearchedMoviesFromMetrics(10, {
    refetchOnWindowFocus: true
  }); // Fetch top 10 most searched


  // Step 2: Comment out current TMDB implementation
  /*
  const {
    data: popularMoviesData,
    isLoading: isLoadingMovies,
    error: moviesError,
    isError: isMoviesError,
  } = usePopularMovies(1);

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
        .filter(Boolean) // Remove undefined if a genre ID isn't found
        .slice(0, 2) // Take up to 2 genre names
        .join(" • ") || "Movie"
    );
  };

  const renderPopularMovie = ({
    item,
    index,
  }: {
    item: PopularMovieItemType;
    index: number;
  }) => {
    const cardData: PopularMovieCardDataType = {
      id: String(item.id),
      title: item.title,
      genre: getGenreNames(item.genre_ids),
      image: getImageUrl(item.poster_path, "w500") || images.highlight,
      rating: item.vote_average, // This will be missing from Appwrite data
      rank: index + 1,
    };
    return (
      <PopularMovieCard
        item={cardData}
        onPress={() => router.push(`/movies/${item.id}`)}
      />
    );
  };

  if (isLoadingMovies || isLoadingGenres) {
    return (
      <View className="mb-8 h-72 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (
    isMoviesError ||
    isGenresError ||
    (!isLoadingMovies &&
      popularMoviesData &&
      popularMoviesData.results.length === 0)
  ) {
    let errorMessage = "Could not load popular movies. Please try again later.";
    let specificError = "";
    if (isMoviesError && moviesError && "message" in moviesError) {
      specificError = (moviesError as any).message;
    } else if (isGenresError && genresError && "message" in genresError) {
      specificError = (genresError as any).message;
    }

    if (
      !isLoadingMovies &&
      popularMoviesData &&
      popularMoviesData.results.length === 0 &&
      !isMoviesError &&
      !isGenresError
    ) {
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

  if (!popularMoviesData?.results) {
    return (
      <View className="mb-8 h-72 flex-1 justify-center items-center" />
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-4">Popular movies</Text>
      <FlatList
        data={popularMoviesData.results}
        renderItem={renderPopularMovie}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10 }}
        style={{ height: 290 }}
      />
    </View>
  );
  */

  const renderMostSearchedMovie = ({
    item,
    index,
  }: {
    item: RankedMetricMovie;
    index: number;
  }) => {
    const cardData: PopularMovieCardDataType = {
      id: String(item.movie_id),
      title: item.movie_title,
      genre: "Highly Searched", // Placeholder genre, as Appwrite metrics don't store TMDB genre IDs
      image: item.cover_img_url || images.highlight, // Use cover_img_url, fallback to placeholder
      rating: item.total_search_count, // Using search_count as a proxy for rating/prominence. Card might need adjustment.
                                      // Or set to 0 if card expects 0-10 scale and search_count is too large.
                                      // For now, let's pass it and see. Or, better, pass a fixed placeholder if it doesn't fit.
                                      // Let's use a fixed placeholder or omit if PopularMovieCard can handle it.
                                      // For PopularMovieCard, rating is expected. Let's send 0 or a mock value.
                                      // The design shows a star + number. total_search_count won't fit that UI.
                                      // Let's send a mock rating, or adapt PopularMovieCard later.
                                      // For now, to make it compile, let's send a mock rating.
                                      // The design for popular movies has a rating.
                                      // The most searched movies might not have a direct TMDB rating in metrics.
                                      // We can display total_search_count instead of rating if we modify the card,
                                      // or fetch TMDB details for each, which is too much.
                                      // Let's pass total_search_count as rating for now and see.
                                      // The card expects a number for rating.
      rank: index + 1,
    };
    return (
      <PopularMovieCard
        item={{...cardData, rating: 0 }} // Forcing rating to 0 as search_count is not a 0-10 scale.
                                        // Or we can adapt PopularMovieCard to optionally show search_count.
                                        // For now, 0 to avoid UI distortion if search_count is huge.
        onPress={() => router.push(`/movies/${item.movie_id}`)} // Assuming movie_id is TMDB compatible
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

  if (isError) {
    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">Most Searched Movies</Text>
        <View className="h-[290px] flex justify-center items-center bg-red-900/30 rounded-lg p-4 border border-red-700/50">
          <Text className="text-red-300 text-center font-semibold">Oops! Something went wrong.</Text>
          <Text className="text-red-400 text-center text-xs mt-2">
            Could not load most searched movies.
          </Text>
          {error && "message" in error && (
            <Text className="text-red-500 text-center text-xs mt-1">
              Details: {(error as any).message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (!mostSearchedMoviesData || mostSearchedMoviesData.length === 0) {
    return (
      <View className="mb-8">
        <Text className="text-white text-xl font-bold mb-4">Most Searched Movies</Text>
        <View className="h-[290px] flex justify-center items-center bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <Text className="text-gray-300">No most searched movies data available yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-4">Most Searched Movies</Text>
      <FlatList
        data={mostSearchedMoviesData}
        renderItem={renderMostSearchedMovie}
        keyExtractor={(item) => String(item.movie_id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10 }}
        style={{ height: 290 }} // Consistent height with previous TMDB popular list
      />
    </View>
  );
};

export default PopularMoviesSection;
