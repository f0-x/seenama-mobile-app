import { icons } from "@/constants/icons";
import { images } from "@/constants/images"; // Assuming images.rankingGradient is here
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PopularMovieItem {
  id: string;
  title: string;
  genre: string;
  image: any; // Adjust type as per your images
  rating: number;
  rank: number;
}

interface PopularMovieCardProps {
  item: PopularMovieItem;
  onPress?: () => void;
}

const PopularMovieCard: React.FC<PopularMovieCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} className="mr-4 relative w-40">
      <Image
        source={item.image}
        className="w-full h-56 rounded-lg"
        resizeMode="cover"
      />
      <Image
        source={images.rankingGradient}
        className="absolute bottom-0 left-[-10px] w-16 h-32"
        resizeMode="contain"
      />
      <Text
        className="absolute bottom-3 left-[-2px] text-white text-6xl font-extrabold"
        style={styles.textShadow}
      >
        {item.rank}
      </Text>

      <View className="absolute bottom-1 right-1 bg-black/60 p-1 rounded-md">
        <View className="flex-row items-center">
          <Image
            source={icons.star}
            className="w-3 h-3 mr-1"
            style={{ tintColor: "#FFD700" }}
          />
          <Text className="text-white text-xs font-semibold">
            {item.rating}
          </Text>
        </View>
      </View>
      <Text className="text-white text-sm font-semibold mt-2" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-gray-400 text-xs" numberOfLines={1}>
        {item.genre}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});

export default PopularMovieCard;
