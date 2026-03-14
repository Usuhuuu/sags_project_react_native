import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { Socket } from "socket.io-client";
import * as Sentry from "@sentry/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/(modals)/context/authContext";
import MainChatModal from "@/app/(modals)/authentication/modals/mainChatModal";
import { useFocusEffect } from "expo-router";
import { connectSocket, getSocket } from "@/hooks/socketConnection";
import { FontAwesome } from "@expo/vector-icons";
import {
  ChatSeparator,
  Message,
  GroupChat,
  MessageHistory,
  ActiveUserType,
} from "@/interfaces/chatType";
import { generatedId } from "@/app/(modals)/chat/util/objectID";
import {
  MemoizedChatItem,
  newMessagePrepareFunction,
  prepareMessages,
} from "@/app/(modals)/chat/util/message_function";
import PersonalChat from "@/app/(modals)/chat/components/personal_chat";
import GroupChatComponent from "@/app/(modals)/chat/components/group_chat";
import FilterModal from "@/app/(modals)/chat/components/filter_modal";
import { useChatStore } from "@/app/(modals)/context/store/chatStore";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/app/(modals)/context/themeContext";
import {
  RQ_regular_cache_key,
  useAuthQuery,
  useRegularQuery,
} from "@/hooks/useQuery";
import { useIsFocused } from "@react-navigation/native";

const ChatComponent: React.FC = () => {
  const { colors: Colors } = useTheme();
  const [chatGroups, setChatGroups] = useState<{ [key: string]: GroupChat }>(
    {},
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [mainModalShow, setmainModalShow] = useState<boolean>(false);
  const [userDatas, setUserDatas] = useState<any>([]);
  const [cursor, setCursor] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isitReady, setIsitReady] = useState<boolean>(false);
  const [childModalVisible, setChildModalVisible] = useState<boolean>(false);
  const [activeUserData, setActiveUserData] = useState<ActiveUserType[]>([]);
  const [fullScreenShow, setFullScreenShow] = useState<boolean>(false);
  const [noChatExist, setNoChatExist] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const currentChatId = useRef<string>("");

  //setMessagesMap
  const [chatSeparator, setChatSeparator] = useState<ChatSeparator>(
    ChatSeparator.PERSONAL,
  );
  const [chatSearchValue, setChatSearchValue] = useState<string>("");
  const [showFilterVisible, setShowFilterVisible] = useState<boolean>(false);

  const { t } = useTranslation();
  const { LoginStatus } = useAuth();

  const { addMessageToMap } = useChatStore();

  const messagesMap = useChatStore((state) => {
    return state.messagesMap;
  });
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
      const allGroups = [
        ...(chatData.chatGroupIDs?.chat || []),
        ...(chatData.chatGroupIDs?.directChat || []),
      ];
      const map = {} as { [groupId: string]: GroupChat };
      allGroups.forEach((groupID: any) => {
        const groupChatName = groupID.group_chat_name;
        const regex =
          /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+[–-]\s+(\d{2}:\d{2})/;
        if (typeof groupChatName === "string") {
          const match = groupChatName.match(regex);
          if (match) {
            const [_, date, startTime, endTime] = match;
            const indexOfDate = groupChatName.indexOf(date);
            const sportHallName = groupChatName
              .substring(0, indexOfDate)
              .replace(/-\s*$/, "")
              .trim();

            map[groupID._id] = {
              group_ID: groupID._id,
              members: groupID.members,
              group_chat_name: `${sportHallName} - ${date} ${startTime} – ${endTime}`,
              chat_image: groupID.chat_image,
              sportHallName,
              date,
              startTime,
              endTime,
            };
            return;
          }
        }
        if (groupID.individualChat && Array.isArray(groupID.members)) {
          const otherMember = groupID.members.find(
            (member: string) => member !== userDatas.unique_user_ID,
          );
          map[groupID._id] = {
            individualChat: groupID._id,
            members: groupID.members,
            group_chat_name: otherMember || "Direct Chat",
            chat_image: groupID.chat_image,
            notUser: groupID.notUser || [],
            latestMessage: groupID.latestMessage || undefined,
            unseenCount: groupID.unseenCount || 0,
          };
          return;
        }
        map[groupID._id] = {
          group_ID: groupID._id,
          members: groupID.members,
          group_chat_name: groupChatName,
          chat_image: groupID.chat_image,
        };
      });

      setChatGroups(map);
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

  const joinSpecificChat = async (groupId: string) => {
    socketRef.current = getSocket();
    if (!socketRef || !socketRef.current?.connected) {
      console.warn("Socket not ready");
      await connectSocket();
    }

    if ((socketRef as any).currentGroupId === groupId) {
      setmainModalShow(true);
      return;
    }

    if (currentChatId.current) {
      socketRef.current?.emit("leave_group", currentChatId.current);
    }
    socketRef.current?.emit("joinGroup", { item: groupId }, (data: any) => {
      if (!data.success) {
        Notifier.showNotification({
          title: "Oops",
          description: "You are not allow to join this chat",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        return;
      }
      currentChatId.current = groupId;

      socketRef.current?.emit(
        "chatHistory",
        { timer: Date.now() },
        (message: MessageHistory) => {
          setIsitReady(true);
          if (message.nextCursor === null && message.messages.length === 0) {
            setLoading(false);
            setIsitReady(false);
            return;
          }
          const formattedMessages = prepareMessages(
            message.messages,
            message.nextCursor,
            message.no_more_message,
          );
          addMessageToMap({
            chatID: currentChatId.current,
            messages: formattedMessages,
            newSendedMsj: false,
            no_more_message: message.no_more_message,
            cursor: cursor,
          });
          if (message.no_more_message) {
            setLoading(false);
            setIsitReady(false);
          }
          setCursor(message.nextCursor);
          setIsitReady(false);
        },
      );
      setmainModalShow(true);
      socketRef.current?.off("receiveMessage");
      socketRef.current?.on("receiveMessage", (data: Message) => {
        const newMsj: Message = {
          _id: data._id,
          sender_unique_name: data.sender_unique_name,
          groupId: data.groupId,
          message: data.message,
          timestamp: new Date(data.timestamp),
        };
        const preparedMsj = newMessagePrepareFunction(
          newMsj,
          messagesMap,
          currentChatId,
        );

        addMessageToMap({
          chatID: currentChatId.current,
          messages: preparedMsj,
          newSendedMsj: true,
          cursor: cursor,
        });

        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
      });
    });
  };

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
          socketRef.current.off("receiveMessage");
          if (currentChatId.current) {
            socketRef.current?.emit("leave_group", currentChatId.current);
          }
          socketRef.current.disconnect();
        }
      };
    }, []),
  );

  useEffect(() => {
    if (mainModalShow) {
      socketRef.current?.emit("chat-active");
    } else {
      socketRef.current?.emit("chat-inactive");
    }
  }, [mainModalShow]);

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
      console.log("Pisdas", data);

      setChatGroups((prev) => {
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

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    if (!socketRef.current?.connected) return;
    const newMessage = {
      _id: generatedId(),
      sender_unique_name: userDatas.unique_user_ID,
      groupId: currentChatId.current,
      message: messageText,
      timestamp: new Date(),
    };
    const prevMsj = messagesMap.get(currentChatId.current)?.messages[0];
    const diff = differenceInDays(
      newMessage.timestamp,
      prevMsj?.timestamp || new Date(0),
    );
    if (diff > 0 || diff < 0) {
      const newMsjPrepared = {
        ...newMessage,
        showDateSeparator: true,
      };
      addMessageToMap({
        chatID: currentChatId.current,
        messages: [newMsjPrepared],
        newSendedMsj: true,
        cursor: cursor,
      });
    } else {
      const newMsjPrepared = {
        ...newMessage,
        showDateSeparator: false,
      };
      addMessageToMap({
        chatID: currentChatId.current,
        messages: [newMsjPrepared],
        newSendedMsj: true,
        cursor: cursor,
      });
    }
    setNewMessage("");
    socketRef.current.emit("sendMessage", newMessage);
    flatListRef.current?.scrollToIndex({
      index: 0,
      animated: true,
    });
  };

  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const { bottom } = useSafeAreaInsets();

  const renderChatItem = useCallback(
    ({ item }: { item: Message }) => {
      return <MemoizedChatItem item={item} userDatas={userDatas} />;
    },
    [userDatas],
  );

  const loadOlderMsj = async () => {
    if (!socketRef.current?.connected || !cursor) return;
    socketRef.current?.emit(
      "chatHistory",
      { timer: cursor },
      (message: MessageHistory) => {
        if (
          !message.messages ||
          message.messages.length === 0 ||
          message.nextCursor == null
        ) {
          setLoading(false);
          return;
        }
        const formattedMessages = prepareMessages(
          message.messages,
          message.nextCursor,
          message.no_more_message,
        );
        addMessageToMap({
          chatID: currentChatId.current,
          messages: formattedMessages,
          newSendedMsj: false,
          no_more_message: message.no_more_message,
          cursor: cursor,
        });

        setCursor(message.nextCursor);
        setLoading(false);
      },
    );
  };

  const result = Object.values(chatGroups).reduce(
    (
      acc: { individualChat: GroupChat[]; group_chat: GroupChat[] },
      item: GroupChat,
    ) => {
      if (item.individualChat !== undefined) {
        acc.individualChat.push(item);
      } else if (item.group_ID !== undefined) {
        acc.group_chat.push(item);
      }
      return acc;
    },
    { individualChat: [], group_chat: [] },
  );

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
                flexDirection: "row",
                backgroundColor: Colors.containerColor,
                borderRadius: 10,
                shadowColor: Colors.shadowColor,
                shadowOffset: { width: 4, height: 2 },
                shadowOpacity: 0.4,
                opacity: 4,
                marginVertical: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setChatSeparator(ChatSeparator.GROUP);
                }}
                style={{
                  backgroundColor:
                    chatSeparator === ChatSeparator.GROUP
                      ? Colors.primary
                      : Colors.containerColor,
                  borderRadius: 10,
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color:
                      chatSeparator === ChatSeparator.GROUP
                        ? Colors.white
                        : Colors.darkGrey,
                  }}
                >
                  {chatInitLang.groupChats}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChatSeparator(ChatSeparator.PERSONAL)}
                style={{
                  backgroundColor:
                    chatSeparator === ChatSeparator.PERSONAL
                      ? Colors.primary
                      : Colors.containerColor,
                  borderRadius: 10,
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 7,
                }}
              >
                <Text
                  style={{
                    color:
                      chatSeparator === ChatSeparator.PERSONAL
                        ? Colors.white
                        : Colors.darkGrey,
                  }}
                >
                  {chatInitLang.individualChat}
                </Text>
              </TouchableOpacity>
            </View>
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
          {chatSeparator === ChatSeparator.GROUP && (
            <GroupChatComponent
              chats={result.group_chat}
              join_function={joinSpecificChat}
            />
          )}
          {chatSeparator === ChatSeparator.PERSONAL && (
            <PersonalChat
              chats={result.individualChat}
              join_function={joinSpecificChat}
            />
          )}
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
          {mainModalShow && (
            <MainChatModal
              mainModalShow={mainModalShow}
              setmainModalShow={setmainModalShow}
              isitReady={isitReady}
              setChildModalVisible={setChildModalVisible}
              childModalVisible={childModalVisible}
              message={messagesMap}
              loadOlderMsj={loadOlderMsj}
              loading={loading}
              flatListRef={flatListRef}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              renderChatItem={renderChatItem}
              groupMap={chatGroups}
              activeUserData={activeUserData}
              socketRef={socketRef}
              groupID={currentChatId.current}
              currentChatId={currentChatId}
            />
          )}
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
