import { icons } from "@/constants/icons";
import {
  Image,
  NativeSyntheticEvent,
  NativeTouchEvent,
  TextInput,
  View,
} from "react-native";

const SearchBar = ({
  searchBarPlaceholder,
  onSearchBarPress,
}: {
  searchBarPlaceholder?: string;
  onSearchBarPress?:
    | ((e: NativeSyntheticEvent<NativeTouchEvent>) => void)
    | undefined;
}) => {
  return (
    <View className="flex-row items-center bg-[#1F1D2B] rounded-xl px-4 py-3 mb-8 border border-gray-700/50">
      <Image
        source={icons.search}
        className="size-5 mr-3"
        resizeMode="contain"
        tintColor={"#9CA3AF"}
      />
      <TextInput
        placeholder={
          searchBarPlaceholder || "Search through 300+ movies online"
        }
        onPress={onSearchBarPress}
        onChangeText={() => {}}
        value=""
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-white text-base h-6 p-0 font-sans" // Ensure TextInput height is controlled and padding is reset
        style={{ fontFamily: "System" }} // Fallback font
      />
    </View>
  );
};

export default SearchBar;
