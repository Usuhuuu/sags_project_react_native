import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Socket } from "socket.io-client";
import * as Sentry from "@sentry/react-native";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuth } from "../(modals)/context/authContext";
import { auth_swr, regular_swr } from "../../hooks/useswr";
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
import { generatedId } from "../(modals)/chat/util/objectID";
import {
  MemoizedChatItem,
  newMessagePrepareFunction,
  prepareMessages,
  saveMessageToMap,
} from "@/app/(modals)/chat/util/message_function";
import { useChatStore } from "../(modals)/context/store/chatStore";
import PersonalChat from "../(modals)/chat/components/personal_chat";
import GroupChatComponent from "../(modals)/chat/components/group_chat";
import FilterModal from "../(modals)/chat/components/filter_modal";

const ChatComponent: React.FC = () => {
  const [chatGroups, setChatGroups] = useState<{ [key: string]: GroupChat }>(
    {}
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
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [chatSeparator, setChatSeparator] = useState<ChatSeparator>(
    ChatSeparator.PERSONAL
  );
  const [chatSearchValue, setChatSearchValue] = useState<string>("");
  const [showFilterVisible, setShowFilterVisible] = useState<boolean>(false);

  const { t } = useTranslation();
  const { LoginStatus } = useAuth();

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = auth_swr(
    {
      item: {
        pathname: "main",
        cacheKey: "RoleAndProfile_main",
        loginStatus: LoginStatus,
      },
    },
    {
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );
  const {
    data: chatData,
    error: chatError,
    isLoading: chatLoading,
  } = regular_swr(
    {
      item: {
        pathname: "/auth/chatcheck",
        cacheKey: "group_chat",
        loginStatus: LoginStatus,
      },
    },
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  const storeChatId = useChatStore((state) => state.chatID);
  const storeMessage = useChatStore((state) => state.receivedMessages);

  // chat data process
  useEffect(() => {
    if (chatLoading) {
      setLoading(true);
    } else if (chatData && chatData.success) {
      const allGroups = [
        ...(chatData.chatGroupIDs.chat || []),
        ...(chatData.chatGroupIDs.directChat || []),
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
            (member: string) => member !== userDatas.unique_user_ID
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
    if (!storeChatId || storeMessage.length === 0) return;

    setChatGroups((prev) => {
      const latestMsg = storeMessage[storeMessage.length - 1];
      return {
        ...prev,
        [storeChatId]: {
          ...prev[storeChatId],
          latestMessage: {
            sender_unique_name: latestMsg.sender_unique_name,
            message: latestMsg.message,
            timestamp: latestMsg.timestamp,
          },
          unseenCount: (prev[storeChatId]?.unseenCount || 0) + 1,
        },
      };
    });
  }, [storeChatId, storeMessage]);

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
        Alert.alert("You are not allow to join this chat");
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
            message.no_more_message
          );
          saveMessageToMap({
            chat_ID: currentChatId.current,
            messages: formattedMessages,
            newSendedMsj: false,
            setMessagesMap: setMessagesMap,
            setRefreshFlag: setRefreshFlag,
          });
          if (message.no_more_message) {
            setLoading(false);
            setIsitReady(false);
          }
          setCursor(message.nextCursor);
          setIsitReady(false);
        }
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
          currentChatId
        );

        saveMessageToMap({
          chat_ID: currentChatId.current,
          messages: preparedMsj,
          newSendedMsj: true,
          setMessagesMap: setMessagesMap,
          setRefreshFlag: setRefreshFlag,
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
        socketRef.current?.off("receiveMessage");
        socketRef.current?.emit("leave_group", currentChatId.current);
      };
    }, [])
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
          }))
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
    const prevMsj = messagesMap.get(currentChatId.current)?.[0];
    const diff = differenceInDays(
      newMessage.timestamp,
      prevMsj?.timestamp || new Date(0)
    );
    if (diff > 0 || diff < 0) {
      const newMsjPrepared = {
        ...newMessage,
        showDateSeparator: true,
      };
      saveMessageToMap({
        chat_ID: currentChatId.current,
        messages: [newMsjPrepared],
        newSendedMsj: true,
        setMessagesMap: setMessagesMap,
        setRefreshFlag: setRefreshFlag,
      });
    } else {
      const newMsjPrepared = {
        ...newMessage,
        showDateSeparator: false,
      };
      saveMessageToMap({
        chat_ID: currentChatId.current,
        messages: [newMsjPrepared],
        newSendedMsj: true,
        setMessagesMap: setMessagesMap,
        setRefreshFlag: setRefreshFlag,
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
    [userDatas]
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
          message.no_more_message
        );
        saveMessageToMap({
          chat_ID: currentChatId.current,
          messages: formattedMessages,
          newSendedMsj: false,
          setMessagesMap: setMessagesMap,
          setRefreshFlag: setRefreshFlag,
        });

        setCursor(message.nextCursor);
        setLoading(false);
      }
    );
  };

  const result = Object.values(chatGroups).reduce(
    (
      acc: { individualChat: GroupChat[]; group_chat: GroupChat[] },
      item: GroupChat
    ) => {
      if (item.individualChat !== undefined) {
        acc.individualChat.push(item);
      } else if (item.group_ID !== undefined) {
        acc.group_chat.push(item);
      }
      return acc;
    },
    { individualChat: [], group_chat: [] }
  );
  const chatInitLang: any = t("chatRoom", { returnObjects: true });

  return (
    <View style={{ width: width }}>
      {noChatExist ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.white,
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
        <>
          {!fullScreenShow ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : (
            <View style={[styles.container]}>
              {userLoading ? (
                <View>
                  <ActivityIndicator color={Colors.primary} size={"large"} />
                </View>
              ) : (
                <View
                  style={{
                    width: width,
                    height: height - bottom,
                    backgroundColor: Colors.white,
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
                        width: "90%",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: Colors.lightGrey,
                          borderRadius: 20,
                          padding: 2,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setChatSeparator(ChatSeparator.GROUP);
                          }}
                          style={{
                            backgroundColor:
                              chatSeparator === ChatSeparator.GROUP
                                ? Colors.white
                                : Colors.lightGrey,
                            borderRadius: 20,
                            width: "50%",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 7,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                chatSeparator === ChatSeparator.GROUP
                                  ? Colors.dark
                                  : Colors.darkGrey,
                            }}
                          >
                            {chatInitLang.groupChats}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            setChatSeparator(ChatSeparator.PERSONAL)
                          }
                          style={{
                            backgroundColor:
                              chatSeparator === ChatSeparator.PERSONAL
                                ? Colors.white
                                : Colors.lightGrey,
                            borderRadius: 20,
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
                                  ? Colors.dark
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
                          gap: 5,
                          height: 40,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            gap: 5,
                            alignItems: "center",
                            justifyContent: "space-around",
                            backgroundColor: Colors.lightGrey,
                            width: "85%",
                            borderRadius: 10,
                            padding: 5,
                          }}
                        >
                          <FontAwesome
                            name="search"
                            size={18}
                            color={Colors.littleDarkGrey}
                          />
                          <TextInput
                            placeholder={
                              chatInitLang.search
                                ? chatInitLang.search
                                : "Search"
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
                            backgroundColor: Colors.lightGrey,
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
                            style={{ padding: 10 }}
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
              )}

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
                refreshFlag={refreshFlag}
                currentChatId={currentChatId}
              />
              <FilterModal
                showFilterVisible={showFilterVisible}
                setShowFilterVisible={setShowFilterVisible}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 28,
    marginVertical: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 12,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  groupItemContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  groupItem: {
    padding: 10,
    marginVertical: 7,
    borderRadius: 5,
    backgroundColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: "90%",
  },
  textContainer: {
    flexDirection: "row",
    gap: 1,
  },
  showHiderContainer: {
    padding: 10,
    marginVertical: 7,
    borderRadius: 5,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  groupText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  messageContainer: {
    width: "100%",
  },
  userNameText: {
    fontSize: 13,
    color: Colors.primary,
    textShadowColor: Colors.primary,
    textShadowRadius: 0.5,
  },
  messageText: {
    padding: 5,
    fontSize: 18,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  messagesList: {
    //height: Dimensions.get("window").height,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },

  msjContainer: {
    marginHorizontal: 10,
  },
  msjInside: {
    borderWidth: 1,
    paddingHorizontal: 5,
  },
  TimerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
    marginHorizontal: 5,
  },
  dateText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: Colors.primary,
    fontWeight: "400",
  },
});

export default ChatComponent;
