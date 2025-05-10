import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import React from "react";
import {
    Image,
    ImageBackground,
    ImageSourcePropType,
    Text,
    View,
} from "react-native";

// Example function for tab bar icons, you can replace this with actual icons
const TabBarIcon = (props: {
    name: keyof typeof icons;
    color: string;
    focused: boolean;
}) => {
    // Replace with your preferred icon library e.g., FontAwesome, MaterialIcons
    // return <Text style={{ color: props.color, fontSize: props.focused ? 24 : 20 }}>{props.name.charAt(0)}</Text>;
    if (props.focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 mt-4 justify-center items-center rounded-full overflow-hidden"
            >
                <Image
                    source={icons[props.name]}
                    tintColor={props.color}
                    className="size-5"
                />
                <Text className="text-secondary text-sm font-semibold ml-2 capitalize">
                    {props.name}
                </Text>
            </ImageBackground>
        );
    } else
        return (
            <View className="size-full justify-center items-center mt-4 rounded-full">
                <Image
                    source={icons[props.name] as ImageSourcePropType}
                    tintColor={props.color}
                    className="size-5"
                />
            </View>
        );
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarStyle: {
                    backgroundColor: "#0F0D23",
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 36,
                    height: 52,
                    position: "absolute",
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#0F0D23",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="home" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="person" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="search" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookmarks"
                options={{
                    title: "Bookmarks",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="save" color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}
