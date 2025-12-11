import { FriendSeparator, FriendsType } from "@/interfaces/friendType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { useFriendStore } from "@/app/(modals)/context/store/friendStore";
import { useTheme } from "../../context/themeContext";
import AppText from "@/constants/appTextDefault";

export const FriendItem = React.memo(
  ({ item, userStatus }: { item: FriendsType; userStatus: string }) => {
    const { setFriendDetails } = useFriendStore();
    const { colors: Colors, theme } = useTheme();

    return (
      <View
        style={{
          margin: 10,
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: 7,
          borderRadius: 5,
          backgroundColor: Colors.containerColor,
          shadowColor: Colors.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor:
                theme === "dark" ? Colors.primary : Colors.themeColorTextPure,
            }}
          >
            <Image source={{ uri: item.userImage }} />
          </View>
          <AppText
            style={{
              fontSize: 22,
              fontWeight: 500,
              color:
                theme === "dark" ? Colors.primary : Colors.themeColorTextPure,
            }}
          >
            {item.unique_user_ID.charAt(0).toUpperCase() +
              item.unique_user_ID.slice(1) || "PISDA"}
          </AppText>
        </View>
        <View style={{ flexDirection: "row", gap: 5 }}>
          {/* friend section */}
          {userStatus === FriendSeparator.FRIENDS && (
            <>
              <TouchableOpacity
                onPress={() => {
                  const data = {
                    unique_user_ID: item.unique_user_ID,
                    userImage: item.userImage,
                    email: item.email,
                    userNames: item.userNames,
                  };
                  setFriendDetails(data);
                  router.push(`/(modals)/user/${item.unique_user_ID}`);
                }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/(modals)/chat/${item.unique_user_ID}`);
                }}
              >
                <Ionicons name="chatbox" size={30} color={Colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  },
  (prev, next) => prev.item.unique_user_ID === next.item.unique_user_ID
);
