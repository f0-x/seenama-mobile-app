import { icons } from "@/constants/icons";
import {
  Image,
  NativeSyntheticEvent,
  NativeTouchEvent, // Added import
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  searchBarPlaceholder?: string;
  onSearchBarPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void; // For cases where the whole bar is pressable
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void; // For handling search submission
  onClear?: () => void; // For clearing the input
  // Add other TextInput props as needed, e.g., autoFocus, returnKeyType
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchBarPlaceholder,
  onSearchBarPress, // This prop is mainly for the home screen's SearchBar behavior
  value,
  onChangeText,
  onSubmitEditing,
  onClear,
}) => {
  // The SearchBar on the search screen itself should not navigate via onSearchBarPress.
  // It acts as a direct input field.
  const isSearchScreenBehavior = !!onChangeText; // Heuristic: if onChangeText is provided, it's for active input

  if (onSearchBarPress && !isSearchScreenBehavior) {
    // Behavior for home screen: whole bar is pressable
    return (
      <TouchableOpacity
        onPress={onSearchBarPress}
        className="flex-row items-center bg-[#1F1D2B] rounded-xl px-4 py-3 mb-8 border border-gray-700/50 mx-4"
        activeOpacity={0.7}
      >
        <Image
          source={icons.search}
          className="size-5 mr-3"
          resizeMode="contain"
          tintColor={"#9CA3AF"}
        />
        <Text className="text-gray-400 text-base font-sans">
          {searchBarPlaceholder || "Search through 300+ movies online"}
        </Text>
      </TouchableOpacity>
    );
  }

  // Behavior for search screen: active input field
  return (
    <View className="flex-row items-center bg-[#1F1D2B] rounded-xl px-4 py-3 mb-8 border border-gray-700/50 mx-4">
      <Image
        source={icons.search}
        className="size-5 mr-3"
        resizeMode="contain"
        tintColor={"#9CA3AF"}
      />
      <TextInput
        placeholder={searchBarPlaceholder || "Search movies..."}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-white text-base h-6 p-0 font-sans"
        style={{ fontFamily: "System" }}
        returnKeyType="search"
        autoCapitalize="none"
      />
      {value && onClear && (
        <TouchableOpacity onPress={onClear} className="p-1 ml-2">
          <Text className="text-gray-400 text-xl">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
