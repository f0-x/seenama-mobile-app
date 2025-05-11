import LatestMoviesSection from "@/components/LatestMoviesSection"; // Import the new component
import PopularMoviesSection from "@/components/PopularMoviesSection";
import SearchBar from "@/components/search_bar";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native"; // Removed FlatList, Text from here as they are now in sections
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
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
        <LatestMoviesSection />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
