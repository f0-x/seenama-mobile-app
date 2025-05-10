import { icons } from "@/constants/icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface LatestMovieItem {
  id: string;
  title: string;
  genre: string;
  image: any; // Adjust type as per your images
  rating: number;
}

interface LatestMovieCardProps {
  item: LatestMovieItem;
  onPress?: () => void;
}

const LatestMovieCard: React.FC<LatestMovieCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="w-[48%] mb-5">
      <Image
        source={item.image}
        className="w-full h-60 rounded-lg"
        resizeMode="cover"
      />
      <View className="absolute top-2 right-2 bg-black/60 p-1 rounded-full">
        <View className="flex-row items-center px-1">
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
      <Text className="text-white text-base font-medium mt-2" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-gray-400 text-sm" numberOfLines={1}>
        {item.genre}
      </Text>
    </TouchableOpacity>
  );
};

export default LatestMovieCard;
