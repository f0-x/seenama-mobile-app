import LatestMovieCard from "@/components/LatestMovieCard";
import PopularMovieCard from "@/components/PopularMovieCard";
import SearchBar from "@/components/search_bar";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const popularMoviesData = [
    {
      id: "pop1",
      title: "Gladiator II",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
      rank: 1,
    },
    {
      id: "pop2",
      title: "Mufasa: The Lion King",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
      rank: 2,
    },
    {
      id: "pop3",
      title: "Moana 2",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
      rank: 3,
    },
    {
      id: "pop4",
      title: "Another Movie",
      genre: "Drama • Movie",
      image: images.highlight,
      rating: 4.2,
      rank: 4,
    },
  ];

  const latestMoviesData = [
    {
      id: "lat1",
      title: "Moana 2",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
    },
    {
      id: "lat2",
      title: "Venom: The Last Dance",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
    },
    {
      id: "lat3",
      title: "Wicked",
      genre: "Fantasy • Musical",
      image: images.highlight,
      rating: 4.5,
    },
    {
      id: "lat4",
      title: "Werewolves",
      genre: "Horror • Thriller",
      image: images.highlight,
      rating: 4.2,
    },
    {
      id: "lat5",
      title: "Aftermath",
      genre: "Action • Thriller",
      image: images.highlight,
      rating: 4.3,
    },
    {
      id: "lat6",
      title: "Red One",
      genre: "Action • Comedy",
      image: images.highlight,
      rating: 4.1,
    },
    {
      id: "lat7",
      title: "Gladiator II (Latest)",
      genre: "Action • Movie",
      image: images.highlight,
      rating: 4.6,
    },
    {
      id: "lat8",
      title: "Kraven the Hunter",
      genre: "Action • Sci-Fi",
      image: images.highlight,
      rating: 4.4,
    },
  ];

  const router = useRouter();

  const renderPopularMovie = ({
    item,
  }: {
    item: (typeof popularMoviesData)[0];
  }) => (
    <PopularMovieCard
      item={item}
      onPress={() => router.push(`/movies/${item.id}`)}
    />
  );

  const renderLatestMovie = ({
    item,
  }: {
    item: (typeof latestMoviesData)[0];
  }) => (
    <LatestMovieCard
      item={item}
      onPress={() => router.push(`/movies/${item.id}`)}
    />
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="w-full h-full absolute z-0"
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, minHeight: "100%" }}
        className="flex-1 px-5 pt-5" // Adjusted padding
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo */}
        <View className="flex-row justify-center items-center mb-6">
          <Image
            source={images.logo}
            className="w-28 h-10"
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <SearchBar
          onSearchBarPress={(e) => {
            router.push("/search");
          }}
        />

        {/* Popular Movies Section */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Popular movies
          </Text>
          <FlatList
            data={popularMoviesData}
            renderItem={renderPopularMovie}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 10 }} // Ensure last item is not cut off
          />
        </View>

        {/* Latest Movies Section */}
        <View>
          <Text className="text-white text-xl font-bold mb-4">
            Latest movies
          </Text>
          <FlatList
            data={latestMoviesData}
            renderItem={renderLatestMovie}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable FlatList scroll if ScrollView handles it
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
