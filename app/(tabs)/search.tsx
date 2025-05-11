import LatestMovieCard from "@/components/LatestMovieCard";
import SearchBar from "@/components/search_bar";
import { images } from "@/constants/images";
import {
  Genre, // For initial/empty search state
  getImageUrl,
  PopularMovieItem as MovieItemType,
  useLatestMovies,
  useMovieGenres,
  useSearchMovies,
} from "@/services/movieService";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface GenrePillProps {
  genre: Genre;
  isSelected: boolean;
  onPress: () => void;
}

const GenrePill: React.FC<GenrePillProps> = ({
  genre,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-3 py-1.5 rounded-full mr-2 mb-2 border ${
      isSelected
        ? "bg-secondary border-secondary" // Active: Secondary background
        : "bg-gray-800 border-gray-700" // Inactive
    }`}
  >
    <Text
      className={`text-sm font-medium ${
        isSelected ? "text-white" : "text-gray-300"
      }`}
    >
      {genre.name}
    </Text>
  </TouchableOpacity>
);

// Type for data passed to LatestMovieCard
interface MovieCardDataType {
  id: string;
  title: string;
  genre: string;
  image: any;
  rating: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<Set<number>>(
    new Set()
  );
  const [, startTransition] = useTransition();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: genresData, isLoading: isLoadingGenres } = useMovieGenres();

  const shouldFetchDiscover =
    !debouncedSearchQuery && selectedGenreIds.size === 0;
  const { data: discoverMoviesData, isLoading: isLoadingDiscover } =
    useLatestMovies(1, { enabled: shouldFetchDiscover });

  const {
    data: searchResultsData,
    isLoading: isLoadingSearchRaw,
    error: searchError,
    isError: isSearchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchMovies(debouncedSearchQuery);

  const isLoading =
    isLoadingGenres ||
    (shouldFetchDiscover ? isLoadingDiscover : isLoadingSearchRaw);

  const genreMap = useMemo(() => {
    if (!genresData?.genres) return new Map<number, string>();
    return new Map(genresData.genres.map((g) => [g.id, g.name]));
  }, [genresData]);

  const getGenreNames = (genreIds: number[]): string => {
    if (!genreIds || genreIds.length === 0) return "N/A";
    return (
      genreIds
        .map((id) => genreMap.get(id))
        .filter(Boolean)
        .slice(0, 2)
        .join(" • ") || "N/A"
    );
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text); // Direct update for smoother input
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    // Optionally reset genres: setSelectedGenreIds(new Set());
  };

  const toggleGenreSelection = (genreId: number) => {
    startTransition(() => {
      setSelectedGenreIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(genreId)) newSet.delete(genreId);
        else newSet.add(genreId);
        return newSet;
      });
    });
  };

  const displayMovies = useMemo(() => {
    let moviesToDisplay: MovieItemType[] = [];
    if (debouncedSearchQuery) {
      moviesToDisplay =
        searchResultsData?.pages.flatMap((page) => page.results) || [];
    } else if (shouldFetchDiscover) {
      moviesToDisplay = discoverMoviesData?.results || [];
    }

    if (selectedGenreIds.size > 0) {
      return moviesToDisplay.filter((movie) =>
        movie.genre_ids.some((id) => selectedGenreIds.has(id))
      );
    }
    return moviesToDisplay;
  }, [
    searchResultsData,
    discoverMoviesData,
    debouncedSearchQuery,
    selectedGenreIds,
    shouldFetchDiscover,
  ]);

  const renderMovieItem = ({ item }: { item: MovieItemType }) => {
    const cardData: MovieCardDataType = {
      id: String(item.id),
      title: item.title,
      genre: getGenreNames(item.genre_ids),
      image: getImageUrl(item.poster_path, "w342") || images.highlight,
      rating: item.vote_average,
    };
    return (
        <LatestMovieCard
          item={cardData}
          onPress={() => router.push(`/movies/${item.id}`)}
        />
    );
  };

  const screenTitle = debouncedSearchQuery
    ? `Results for "${debouncedSearchQuery}"`
    : selectedGenreIds.size > 0
    ? "Filtered movies"
    : "Discover movies";

  return (
    <SafeAreaView className="bg-primary flex-1 pt-5">
      <Image
        source={images.bg}
        className="w-full h-full absolute z-0"
        resizeMode="cover"
      />
      {/* Header: Logo */}
      <View className="flex-row justify-center items-center mb-6">
        <Image
          source={images.logo}
          className="w-28 h-10"
          resizeMode="contain"
        />
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        onClear={handleClearSearch}
        searchBarPlaceholder="Search movies by title..."
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {isLoadingGenres ? (
        <ActivityIndicator size="small" color="#FFF" className="my-3 mx-4" />
      ) : (
        <View className="px-4 mb-4">
          <FlatList
            data={genresData?.genres || []}
            renderItem={({ item }) => (
              <GenrePill
                genre={item}
                isSelected={selectedGenreIds.has(item.id)}
                onPress={() => toggleGenreSelection(item.id)}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <Text className="text-white text-xl font-medium mx-4 mb-4">
        {screenTitle}
      </Text>

      <SearchResultsContent
        isLoading={isLoading && !isFetchingNextPage}
        isError={isSearchError && !!debouncedSearchQuery} // Only show search error if query was made
        error={searchError}
        movies={displayMovies}
        renderMovieItem={renderMovieItem}
        debouncedSearchQuery={debouncedSearchQuery}
        selectedGenreIdsCount={selectedGenreIds.size}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={debouncedSearchQuery ? fetchNextPage : () => {}} // Pass fetchNextPage only if searching
      />
    </SafeAreaView>
  );
}

interface SearchResultsContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  movies: MovieItemType[];
  renderMovieItem: ({ item }: { item: MovieItemType }) => React.ReactElement;
  debouncedSearchQuery: string;
  selectedGenreIdsCount: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

const SearchResultsContent: React.FC<SearchResultsContentProps> = ({
  isLoading,
  isError,
  error,
  movies,
  renderMovieItem,
  debouncedSearchQuery,
  selectedGenreIdsCount,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center mx-4 p-4 bg-red-900/30 rounded-lg">
        <Text className="text-red-300 text-center font-semibold">
          Error loading search results
        </Text>
        {error && "message" in error && (
          <Text className="text-red-400 text-xs mt-1 text-center">
            {(error as any).message}
          </Text>
        )}
      </View>
    );
  }


  return (
    <FlatList
      data={movies}
      renderItem={renderMovieItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      numColumns={2}
      className="flex-1" // Added flex-1 to ensure it tries to fill available space
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 20, // This padding is for content within the list
      }}
      onEndReached={() => {
        // Only call fetchNextPage if there's a search query, there's a next page, and not already fetching
        if (debouncedSearchQuery && fetchNextPage && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage && debouncedSearchQuery ? ( // Show footer only when fetching search results
          <ActivityIndicator size="small" color="#FFF" className="my-4" />
        ) : null
      }
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-300 text-center">
            {debouncedSearchQuery || selectedGenreIdsCount > 0
              ? "No movies found matching your criteria."
              : "No movies to display. Try searching or selecting a genre."}
          </Text>
        </View>
      }
    />
  );
};
