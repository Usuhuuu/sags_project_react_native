import Colors from "@/constants/Colors";
import { FriendSeparator, FriendsType } from "@/interfaces/friendType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { useFriendStore } from "@/app/(modals)/context/store/friendStore";

export const FriendItem = React.memo(
  ({ item, userStatus }: { item: FriendsType; userStatus: string }) => {
    const { setFriendDetails } = useFriendStore();

    return (
      <View style={friend_separator.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <View
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1 }}
          >
            <Image source={{ uri: item.userImage }} />
          </View>
          <Text style={{ color: Colors.dark, fontSize: 16, fontWeight: 500 }}>
            {item.unique_user_ID.charAt(0).toUpperCase() +
              item.unique_user_ID.slice(1)}
          </Text>
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

const friend_separator = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightGrey,
    margin: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
