import { FriendSeparator, FriendsType } from "@/interfaces/friendType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { useFriendStore } from "@/app/(modals)/context/store/friendStore";
import { useTheme } from "../../context/themeContext";
import AppText from "@/constants/appTextDefault";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { queryClient } from "@/hooks/queryClient";

export const FriendItem = React.memo(
  ({ item, userStatus }: { item: FriendsType; userStatus: string }) => {
    const { setFriendDetails } = useFriendStore();
    const { colors: Colors, theme } = useTheme();

    const handleAccept = async (user: FriendsType) => {
      try {
        const response = await axiosInstance.post("/auth/friend_accept", {
          friend_unique_ID: user.unique_user_ID,
        });
        console.log(response.data);
        if (response.data.success && response.status === 200) {
          Notifier.showNotification({
            title: "Friend Request Accepted",
            description: `Accepted`,
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
          queryClient.invalidateQueries({
            queryKey: ["auth_friend"],
          });
        } else {
          Notifier.showNotification({
            title: "Request Failed",
            description: response.data.message || "Try again later",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    return (
      <View
        style={{
          margin: 10,
          padding: 15,
          marginVertical: 7,
          borderRadius: 5,
          backgroundColor: Colors.containerColor,
          shadowColor: Colors.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          flexDirection:
            userStatus === FriendSeparator.FRIENDS ? "row" : "column",
        }}
      >
        <View
          style={{
            flexDirection: "row",
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
        <View
          style={{
            gap: 5,
            flex: 1,
            paddingVertical: 10,
            flexDirection:
              userStatus === FriendSeparator.FRIENDS ? "row" : "column",
          }}
        >
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
          {userStatus === FriendSeparator.REQUESTS && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                  width: "48%",
                  alignItems: "center",
                }}
                onPress={() => {
                  handleAccept(item);
                }}
              >
                <Text
                  style={{
                    color: Colors.white,
                    fontWeight: "700",
                  }}
                >
                  Accept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 10,
                  width: "48%",
                  alignItems: "center",
                  borderColor: Colors.darkGrey,
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: Colors.darkGrey, fontWeight: "700" }}>
                  Decline
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  },
  (prev, next) => prev.item.unique_user_ID === next.item.unique_user_ID,
);
