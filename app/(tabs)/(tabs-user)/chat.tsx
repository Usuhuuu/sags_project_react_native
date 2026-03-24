import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { Socket } from "socket.io-client";
import * as Sentry from "@sentry/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/(modals)/context/authContext";
import { useFocusEffect } from "expo-router";
import { connectSocket } from "@/hooks/socketConnection";
import { FontAwesome } from "@expo/vector-icons";
import { ActiveUserType, ChatTypes } from "@/interfaces/chatType";
import PersonalChat from "@/app/(modals)/chat/components/personal_chat";
import FilterModal from "@/app/(modals)/chat/components/filter_modal";
import { useTheme } from "@/app/(modals)/context/themeContext";
import {
  RQ_regular_cache_key,
  useAuthQuery,
  useRegularQuery,
} from "@/hooks/useQuery";
import { useIsFocused } from "@react-navigation/native";

const ChatComponent: React.FC = () => {
  const { colors: Colors } = useTheme();
  const [chat, setChat] = useState<Record<string, ChatTypes>>({});
  const [userDatas, setUserDatas] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeUserData, setActiveUserData] = useState<ActiveUserType[]>([]);
  const [fullScreenShow, setFullScreenShow] = useState<boolean>(false);
  const [noChatExist, setNoChatExist] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const currentChatId = useRef<string>("");

  //setMessagesMap

  const [chatSearchValue, setChatSearchValue] = useState<string>("");
  const [showFilterVisible, setShowFilterVisible] = useState<boolean>(false);

  const { t } = useTranslation();
  const { LoginStatus } = useAuth();
  const isFocused = useIsFocused();

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  const regular_query_key = [
    "group_chat",
  ] as const satisfies RQ_regular_cache_key;

  const {
    data: chatData,
    error: chatError,
    isLoading: chatLoading,
  } = useRegularQuery(
    {
      pathname: "/auth/chatcheck",
      cacheKey: regular_query_key,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus && isFocused,
    },
  );

  // chat data process
  useEffect(() => {
    if (chatLoading) {
      setLoading(true);
    } else if (chatData && chatData.success) {
      const map: Record<string, ChatTypes> = {};
      chatData.chat.forEach((chat: any) => {
        map[chat._id] = {
          chatId: chat._id,
          members: chat.members,
          group_chat_name: "Direct Chat",
          chat_image: chat.latestMessage || undefined,
          unseenCount: chat.unseenCount || 0,
          userInfo: chat.userInfo,
        };
      });

      setChat(map);
      setFullScreenShow(true);
    } else if (chatData && !chatData.success) {
      console.log("no chat ");
      setNoChatExist(true);
      setFullScreenShow(true);
    } else if (chatError) {
      setFullScreenShow(true);
      console.log("Chat Error:", chatError);
      Sentry.captureException(chatError);
    }
  }, [chatData, chatError, userLoading]);

  useEffect(() => {
    if (userLoading) {
      setLoading(true);
    } else if (userData) {
      const parsedData =
        typeof userData.profileData == "string"
          ? JSON.parse(userData.profileData)
          : userData.profileData;
      setUserDatas(Array.isArray(parsedData) ? parsedData[0] : parsedData);
    } else if (userError) {
      Sentry.captureException(chatError);
    }
  }, [userData, userError, userLoading]);

  useFocusEffect(
    useCallback(() => {
      const initSocket = async () => {
        const socket = await connectSocket();
        if (!socket) {
          setNoChatExist(!noChatExist);
          return;
        }
        socketRef.current = socket;
      };
      initSocket();
      return () => {
        if (socketRef.current) {
          if (!currentChatId.current) {
            socketRef.current.disconnect();
          }
        }
      };
    }, []),
  );

  //User Active and recieve msj with connect to socket
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current?.on("user-active-change", (data) => {
      setActiveUserData(
        data
          .filter((user: ActiveUserType) => user.status === "active")
          .map((user: ActiveUserType) => ({
            unique_user_ID: user.unique_user_ID,
            status: user.status,
          })),
      );
    });
    socketRef.current.on("directMessageReceived", (data) => {
      setChat((prev) => {
        return {
          ...prev,
          [data.chatID]: {
            ...prev[data.chatID],
            latestMessage: {
              sender_unique_name: data.sender_unique_name,
              message: data.message,
              timestamp: data.timestamp,
            },
            unseenCount: (prev[data.chatID].unseenCount || 0) + 1,
          },
        };
      });
    });

    (async () => {
      socketRef.current = await connectSocket();
    })();

    return () => {
      socketRef.current?.off("user-active-change");
      socketRef.current?.off("directMessageReceived");
    };
  }, [socketRef.current]);

  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const { bottom } = useSafeAreaInsets();
  const chatInitLang: any = t("chatRoom", { returnObjects: true });

  return (
    <View
      style={{ width: width, backgroundColor: Colors.backgroundColor, flex: 1 }}
    >
      <View
        style={{
          width: width,
          height: height - bottom,
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              width: "95%",
              margin: 10,
            }}
          >
            <View
              style={{
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
                width: "100%",
                gap: "4%",
                shadowColor: Colors.shadowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                opacity: 4,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                  justifyContent: "space-around",
                  backgroundColor: Colors.containerColor,
                  width: "83%",
                  borderRadius: 10,
                  padding: 5,
                }}
              >
                <FontAwesome name="search" size={18} color={Colors.darkGrey} />
                <TextInput
                  placeholder={
                    chatInitLang.search ? chatInitLang.search : "Search"
                  }
                  placeholderTextColor={Colors.darkGrey}
                  value={chatSearchValue}
                  onChangeText={(text) => setChatSearchValue(text)}
                  style={{
                    width: "90%",
                    padding: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: Colors.containerColor,
                  width: "15%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  height: 40,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowFilterVisible(!showFilterVisible);
                  }}
                >
                  <Text
                    style={{
                      color: Colors.darkGrey,
                      fontWeight: "600",
                      fontSize: width > 400 ? 16 : 14,
                    }}
                  >
                    Filter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <PersonalChat chats={chat} currentChatId={currentChatId} />
        </ScrollView>
      </View>
      {noChatExist ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/profileIcons/no_chat_backgroundless.png")}
              style={{ width: 300, height: 500 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 30 }}>
              {chatInitLang.noChatYet}
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 300, color: Colors.darkGrey }}
            >
              {chatInitLang.onceYouJoin}
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 300, color: Colors.darkGrey }}
            >
              {chatInitLang.yourChatWillAppearHere}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
          {showFilterVisible && (
            <FilterModal
              showFilterVisible={showFilterVisible}
              setShowFilterVisible={setShowFilterVisible}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default ChatComponent;
