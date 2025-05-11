import { icons } from "@/constants/icons"; // For play icon, star icon
import { getImageUrl, useMovieDetails } from "@/services/movieService"; // Assuming Genre type is exported
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper to format currency
const formatCurrency = (amount: number) => {
  if (amount === 0) return "N/A";
  return `$${amount.toLocaleString()}`;
};

// Helper to format runtime (e.g., 120 -> 2h 0m)
const formatRuntime = (runtime: number | null) => {
  if (!runtime) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
};

interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <View className="mb-3">
    <Text className="text-sm text-gray-400">{label}</Text>
    <Text className="text-base text-white">{value || "N/A"}</Text>
  </View>
);

interface GenrePillProps {
  name: string;
}
const GenrePillDetails: React.FC<GenrePillProps> = ({ name }) => (
  <View className="bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2">
    <Text className="text-gray-300 text-sm">{name}</Text>
  </View>
);


export default function MovieDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const movieIdNumber = Number(id);

  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useMovieDetails(movieIdNumber, { enabled: !!movieIdNumber });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  if (isError || !movie) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center p-4">
        <Stack.Screen options={{ title: "Error" }} />
        <Text className="text-xl text-red-500">Error loading movie details.</Text>
        {error && <Text className="text-sm text-red-400 mt-2">{(error as Error).message}</Text>}
      </SafeAreaView>
    );
  }

  const backdropUrl = getImageUrl(movie.backdrop_path, "w780"); // Or w1280 for higher res
  const posterUrl = getImageUrl(movie.poster_path, "w500");

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Stack.Screen options={{ title: movie.title || "Movie Details" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header with Backdrop and Title */}
        <View className="relative w-full h-72">
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              className="absolute w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="absolute w-full h-full bg-gray-800" />
          )}
          {/* Gradient Overlay */}
          <View className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-primary via-primary/70 to-transparent" />
          
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-3xl font-bold" style={styles.textShadowLg}>
              {movie.title}
            </Text>
          </View>
          {/* Play Button */}
          <TouchableOpacity
            className="absolute top-1/2 left-1/2 -translate-x-8 -translate-y-8 bg-white/30 rounded-full p-3 backdrop-blur-sm"
            // onPress={() => console.log("Play trailer for", movie.id)} // TODO: Implement play trailer
          >
            <Image source={icons.play} className="w-10 h-10" style={{tintColor: 'white'}}/>
          </TouchableOpacity>
        </View>

        {/* Meta Info Section */}
        <View className="p-4">
          <View className="flex-row items-center space-x-3 mb-3">
            <Text className="text-gray-400">{movie.release_date?.substring(0, 4)}</Text>
            {/* PG rating - TMDB provides 'adult'. This is a placeholder. */}
            {/* <Text className="text-gray-400">PG-13</Text>  */}
            <Text className="text-gray-400">{formatRuntime(movie.runtime)}</Text>
          </View>

          <View className="flex-row items-center space-x-8 mb-4">
            <View className="flex-row items-center bg-gray-800 px-2 py-1 rounded-md">
              <Image source={icons.star} className="w-4 h-4 mr-1.5" style={{tintColor: '#FFD700'}}/>
              <Text className="text-white font-semibold">
                {movie.vote_average.toFixed(1)}/10
              </Text>
              <Text className="text-gray-400 text-xs ml-1">({(movie.vote_count / 1000).toFixed(0)}K)</Text>
            </View>
            {/* Popularity/Trending - using popularity score for now */}
            <View className="flex-row items-center bg-gray-800 px-2 mx-2 py-1 rounded-md">
              <Text className="text-white font-semibold">🔥 {movie.popularity.toFixed(0)}</Text>
            </View>
          </View>

          {/* Overview */}
          <DetailItem label="Overview" value={movie.overview} />

          {/* Details Grid */}
          <View className="mt-4">
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <DetailItem label="Release date" value={movie.release_date} />
              </View>
              <View className="w-[48%]">
                <DetailItem label="Status" value={movie.status} />
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-400 mb-1">Genres</Text>
              <View className="flex-row flex-wrap">
                {movie.genres.map((genre) => (
                  <GenrePillDetails key={genre.id} name={genre.name} />
                ))}
              </View>
            </View>
            
            <DetailItem label="Countries" value={movie.production_countries.map(c => c.name).join(' • ')} />
            
            <View className="flex-row justify-between mt-2">
              <View className="w-[48%]">
                <DetailItem label="Budget" value={formatCurrency(movie.budget)} />
              </View>
              <View className="w-[48%]">
                <DetailItem label="Revenue" value={formatCurrency(movie.revenue)} />
              </View>
            </View>
            
            {movie.tagline && <DetailItem label="Tagline" value={movie.tagline} />}

            <View className="mt-2">
                <Text className="text-sm text-gray-400 mb-1">Production Companies</Text>
                <Text className="text-base text-white">
                    {movie.production_companies.map(pc => pc.name).slice(0,3).join(' • ')}
                </Text>
            </View>
          </View>

          {/* Visit Homepage Button */}
          {movie.homepage && (
            <TouchableOpacity
              className="bg-secondary mt-6 py-3 rounded-lg items-center"
              onPress={() => Linking.openURL(movie.homepage!)}
            >
              <Text className="text-white font-semibold text-base">Visit Homepage →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textShadowLg: {
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
