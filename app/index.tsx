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
      <Text className="text-red-500 text-2xl font-bold text-center p-4">Edit app/index.tsx to edit this screen. Okay</Text>
    </View>
  );
}
