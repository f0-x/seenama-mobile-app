import LatestMovieCard from "@/components/LatestMovieCard";
import PopularMoviesSection from "@/components/PopularMoviesSection"; // Import the new component
import SearchBar from "@/components/search_bar";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  // Remove popularMoviesData, it will be fetched by PopularMoviesSection
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

  // Remove renderPopularMovie function, it's handled by PopularMoviesSection

  const renderLatestMovie = ({
    item,
  }: {
    item: (typeof latestMoviesData)[0];
  }) => (
    // <TouchableOpacity className="w-[48%] mb-5">
    //   <Image
    //     source={item.image}
    //     className="w-full h-60 rounded-lg"
    //     resizeMode="cover"
    //   />
    //   <View className="absolute top-2 right-2 bg-black/60 p-1 rounded-full">
    //     <View className="flex-row items-center px-1">
    //       <Image
    //         source={icons.star}
    //         className="w-3 h-3 mr-1"
    //         style={{ tintColor: "#FFD700" }}
    //       />
    //       <Text className="text-white text-xs font-semibold">
    //         {item.rating}
    //       </Text>
    //     </View>
    //   </View>
    //   <Text className="text-white text-base font-medium mt-2" numberOfLines={1}>
    //     {item.title}
    //   </Text>
    //   <Text className="text-gray-400 text-sm" numberOfLines={1}>
    //     {item.genre}
    //   </Text>
    // </TouchableOpacity>
    <LatestMovieCard
      item={item}
      onPress={() => router.push(`/movies/${item.id}`)}
    />
  );

  const router = useRouter();

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
          onSearchBarPress={() => {
            router.push("/search");
          }}
        />

        {/* Popular Movies Section */}
        <PopularMoviesSection />

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

// Remove StyleSheet if no longer used by this component
export default Home;
