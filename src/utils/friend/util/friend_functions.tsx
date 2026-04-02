import { FriendSeparator, FriendsType } from "@/interfaces/friendType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useFriendStore } from "@/src/context/store/friendStore";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { queryClient } from "@/hooks/queryClient";
import ProfileAvatar from "@/components/profile_avatar";
import { Socket } from "socket.io-client";
import { useChatStore } from "@/src/context/store/chatStore";
import { ChatTypes } from "@/interfaces/chatType";

interface FriendItemProps {
  item: FriendsType;
  userStatus: string;
  onRemove: ({ id, type }: { id: string; type: FriendSeparator }) => void;
  page: Record<FriendSeparator, number>;
  socketRef: React.MutableRefObject<Socket | null>;
}
export const FriendItem = React.memo(
  ({ item, userStatus, onRemove, page, socketRef }: FriendItemProps) => {
    const { setFriendDetails } = useFriendStore();
    const { colors: Colors, theme } = useTheme();
    const { addChatInfo } = useChatStore();
    const width = Dimensions.get("screen").width;
    const handleChat = () => {
      console.log("CHECK", item);
      const chatInfo: ChatTypes = {
        chatId: item.chatId,
        members: item._id,
        userInfo: [
          {
            _id: item._id,
            unique_user_ID: item.unique_user_ID,
          },
        ],
        chat_image: undefined,
        unseenCount: 0,
      };
      console.log(chatInfo);
      addChatInfo(`${item._id}`, chatInfo);
      router.push(`/(modals)/chat/${item._id}`);
    };
    const handleAccept = async (user: FriendsType) => {
      try {
        const response = await axiosInstance.post("/auth/friend_accept", {
          friend_unique_ID: user.unique_user_ID,
        });
        if (response.data.success && response.status === 200) {
          Notifier.showNotification({
            title: "Friend Request Accepted",
            description: `Accepted`,
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
          queryClient.invalidateQueries({
            queryKey: [
              "auth_friend",
              FriendSeparator.REQUESTS,
              page[FriendSeparator.REQUESTS],
            ],
          });
          onRemove({
            id: item.unique_user_ID,
            type: FriendSeparator.REQUESTS,
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
              height: 40,
              borderRadius: 20,
            }}
          >
            <ProfileAvatar
              width={(width / 2) * 0.23}
              imageUrl={item.userImage}
              userName={item.unique_user_ID}
            />
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
              item.unique_user_ID.slice(1) || "UNKNOWN"}
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
                    _id: item._id,
                    unique_user_ID: item.unique_user_ID,
                    userImage: item.userImage,
                    email: item.email,
                    userNames: item.userNames,
                    chatId: item.chatId,
                    chatKey: item.chatKey,
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
                  handleChat();
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
