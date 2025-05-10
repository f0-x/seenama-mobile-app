import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      className="justify-center items-center"
    >
      <Text className="text-dark-200 text-2xl font-bold text-center p-4">Edit and view app/index.tsx to edit this screen. Okay</Text>
      <Link href="/(tabs)/profile" className="text-purple-500 mt-2">Go to Profile</Link>"
    </View>
  );
}
