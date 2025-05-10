import { Text, View } from "react-native";

export default function Onboarding() {
    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Text className="text-3xl font-bold text-center text-blue-600 mb-8">
                Welcome to Seenama!
            </Text>
            <Text className="text-lg text-center text-gray-700 mb-4">
                Discover amazing content and connect with others.
            </Text>
            <Text className="text-lg text-center text-gray-700">
                Let's get you started.
            </Text>
        </View>
    );
}