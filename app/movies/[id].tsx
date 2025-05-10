import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function MovieDetailsPage() {
    const { id } = useLocalSearchParams();

    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Stack.Screen options={{ title: `Movie ${id}` }} />
            <Text className="text-2xl font-bold text-gray-800">Movie Details</Text>
            <Text className="text-lg text-gray-600 mt-2">Showing details for Movie ID: {id}</Text>
        </View>
    );
}