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
} from "react-native";
import { Socket } from "socket.io-client";
import * as Sentry from "@sentry/react-native";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  format,
  parseISO,
  differenceInDays,
  differenceInMinutes,
} from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuth } from "../(modals)/context/authContext";
import { auth_swr, regular_swr } from "../../hooks/useswr";
import MainChatModal from "@/app/(modals)/authentication/modals/mainChatModal";
import { Avatar } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import { connectSocket, getSocket } from "@/hooks/socketConnection";

export interface Message {
  sender_unique_name: string;
  groupId?: string;
  message: string;
  timestamp: Date;
  showDateSeparator?: boolean;
  showTimeGap?: boolean;
  no_more_message?: boolean;
  isLastMessage?: boolean;
  showAvatar?: boolean;
}
export interface GroupChat {
  group_ID?: string | undefined;
  group_chat_name: string;
  members: string[];
  chat_image: string;
  sportHallName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  individualChat?: string | undefined;
}
type MessageHistory = {
  nextCursor: Date | null;
  messages: Message[];
  groupId: string;
  no_more_message: boolean;
};
export interface ActiveUserType {
  unique_user_ID: string;
  status: string;
}
export const prepareMessages = (
  messages: Message[],
  cursorValue: Date | null,
  no_more_message: boolean
) => {
  if (messages.length < 20 || cursorValue === null) {
  }
  const result = [...messages];
  const dateGroups: Record<string, number[]> = {};

  // Group messages by their date
  result.forEach((msg, index) => {
    const dateKey = format(parseISO(msg.timestamp.toString()), "yyyy-MM-dd");
    if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
    dateGroups[dateKey].push(index);
  });

  const dates = Object.keys(dateGroups);

  dates.forEach((dateKey, i) => {
    const indexes = dateGroups[dateKey];
    const isLastDate = i === dates.length - 1;
    let currentMsjIndex: number = indexes[0];
    let currentMsj: Message = result[currentMsjIndex];

    indexes.forEach((currentIndex, i) => {
      const tempMsj = result[currentIndex];
      const nextMsg = result[currentIndex + 1];

      if (!nextMsg) {
        result[currentIndex] = {
          ...tempMsj,
          showTimeGap: false,
          isLastMessage: true,
        };
        return;
      }

      const diff = differenceInMinutes(
        parseISO(currentMsj.timestamp.toString()),
        parseISO(nextMsg.timestamp.toString())
      );

      const isDifferentUser =
        currentMsj.sender_unique_name !== nextMsg.sender_unique_name;

      if (diff > 30 || isDifferentUser) {
        result[currentIndex] = {
          ...tempMsj,
          showTimeGap: true,
        };

        result[currentMsjIndex] = {
          ...result[currentMsjIndex],
          showAvatar: true,
        };

        currentMsj = nextMsg;
        currentMsjIndex = currentIndex + 1;
      } else {
        result[currentIndex] = {
          ...tempMsj,
          showTimeGap: false,
        };
      }
    });
    const lastIndex = indexes[indexes.length - 1];
    if (!isLastDate || (isLastDate && no_more_message)) {
      result[lastIndex] = {
        ...result[lastIndex],
        showDateSeparator: true,
      };
    }
  });
  return result;
};

export const MemoizedChatItem = React.memo(
  ({ item, userDatas }: { item: Message; userDatas: any }) => {
    //본인
    const userSelf: boolean =
      item.sender_unique_name === userDatas.unique_user_ID;

    console.log(item);
    return (
      <View>
        {item.showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.line} />
            <Text style={styles.dateText}>
              {format(new Date(item.timestamp), "EEEE MMMM dd")}
            </Text>
            <View style={styles.line} />
          </View>
        )}

        <View
          style={[
            styles.msjContainer,
            {
              alignItems: userSelf ? "flex-end" : "flex-start",
              paddingVertical: 3,
            },
          ]}
        >
          <View style={{ flexDirection: "row" }}>
            {/* Show avatar only if NOT userSelf and there's a time gap */}
            <View style={{ width: 30, marginRight: 6 }}>
              {!userSelf && item.showAvatar && (
                <Avatar.Icon size={30} icon={"account"} />
              )}
            </View>

            <View>
              {!userSelf && item.showTimeGap && (
                <Text style={[styles.userNameText, { marginBottom: 4 }]}>
                  {item.sender_unique_name}
                </Text>
              )}

              <View
                style={[
                  styles.msjInside,
                  userSelf
                    ? {
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopLeftRadius: 10,
                        backgroundColor: Colors.primary,
                        borderColor: Colors.primary,
                        marginLeft: 50,
                      }
                    : {
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        borderTopRightRadius: 10,
                        backgroundColor: Colors.white,
                        borderColor: Colors.white,
                        marginRight: 100,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: userSelf ? Colors.light : Colors.dark,
                    },
                  ]}
                >
                  {item.message}
                </Text>
              </View>
              {!userSelf && item.showAvatar && (
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.dark,
                    fontWeight: "300",
                    marginTop: 2,
                    alignSelf: userSelf ? "flex-end" : "flex-start",
                  }}
                >
                  {format(item.timestamp, "hh:mm a")}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.item.message === next.item.message &&
    prev.item.timestamp === next.item.timestamp
);

export const newMessagePrepareFunction = (
  messages: Message,
  messagesMap: Map<string, Message[]>,
  currentChatId: React.RefObject<string>
) => {
  const existingMessages = currentChatId.current
    ? messagesMap.get(currentChatId.current)
    : undefined;
  const prevMsj = existingMessages?.[0];
  console.log(existingMessages);
  console.log("new-msj-prepare", prevMsj);
  const diff = differenceInDays(
    parseISO(messages.timestamp.toString()),
    prevMsj ? parseISO(prevMsj.timestamp.toString()) : new Date()
  );
  console.log(diff);
  if (diff > 0 || diff < 0) {
    return [
      {
        ...messages,
        showDateSeparator: true,
      },
    ];
  }
  return [
    {
      ...messages,
      showDateSeparator: false,
    },
  ];
};

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
          };
          return;
        }

        // Fallback
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
      console.log(userDatas);
      setUserDatas(Array.isArray(parsedData) ? parsedData[0] : parsedData);
    } else if (userError) {
      Sentry.captureException(chatError);
    }
  }, [userData, userError, userLoading]);

  const saveMessageToMap = ({
    chat_ID,
    messages,
    newSendedMsj,
  }: {
    chat_ID: string;
    messages: Message[];
    newSendedMsj: boolean;
  }) => {
    setMessagesMap((prevMsj) => {
      const newMap = new Map(prevMsj);
      const prev = newMap.get(chat_ID) || [];
      let existingMessages = [...prev];

      const previewMessage = existingMessages[0];

      if (previewMessage && newSendedMsj) {
        const newMsj = messages[0];
        if (previewMessage.sender_unique_name === newMsj.sender_unique_name) {
          const updatedFirstMessage = {
            ...previewMessage,
            showAvatar: !previewMessage.showAvatar,
          };

          // Create a new array to trigger re-render
          existingMessages = [
            updatedFirstMessage,
            ...existingMessages.slice(1),
          ];

          messages = [{ ...newMsj, showAvatar: true }];
          setRefreshFlag((prev) => !prev);
        } else {
          messages = [{ ...newMsj, showAvatar: true, showTimeGap: true }];
          console.log("kakarr");
        }
      }

      const combined = !newSendedMsj
        ? [...existingMessages, ...messages]
        : [...messages, ...existingMessages];

      const seen = new Set();
      const unique = combined.filter((msj) => {
        const key = `${msj.sender_unique_name}-${msj.timestamp}-${msj.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      newMap.set(chat_ID, [...unique]);
      return newMap;
    });
  };

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
      console.log(data);
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
            console.log(message.messages.length);
            setLoading(false);
            setIsitReady(false);
            return;
          }
          console.log(message.no_more_message);
          const formattedMessages = prepareMessages(
            message.messages,
            message.nextCursor,
            message.no_more_message
          );

          saveMessageToMap({
            chat_ID: currentChatId.current,
            messages: formattedMessages,
            newSendedMsj: false,
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
      // 🧼 Clean previous listener
      socketRef.current?.off("receiveMessage");

      socketRef.current?.on("receiveMessage", (data: Message) => {
        const newMsj: Message = {
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
    return () => {
      socketRef.current?.off("user-active-change");
    };
  }, [socketRef.current]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    if (!socketRef.current?.connected) return;

    const newMessage = {
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
      console.log(currentChatId);

      saveMessageToMap({
        chat_ID: currentChatId.current,
        messages: [newMsjPrepared],
        newSendedMsj: true,
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
        });

        setCursor(message.nextCursor);
        setLoading(false);
      }
    );
  };

  return (
    <>
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
              No Chats Yet
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 300, color: Colors.darkGrey }}
            >
              Once you join a game or make a frind,
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: 300, color: Colors.darkGrey }}
            >
              your chats will appear here
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
                  }}
                >
                  <FlatList
                    data={Object.values(chatGroups)} // Convert hash map to array
                    style={styles.groupItemContainer}
                    renderItem={({ item }) => (
                      <>
                        {item.group_chat_name !== "Direct Chat" && (
                          <View style={styles.groupItem}>
                            <TouchableOpacity
                              onPress={() => {
                                if (item.individualChat) {
                                  router.push(
                                    `/(modals)/chat/${item.group_chat_name}`
                                  );
                                } else {
                                  joinSpecificChat(item.group_ID ?? "");
                                }
                              }}
                              style={{
                                flexDirection: "row",
                                padding: 5,
                                gap: 5,
                              }}
                            >
                              <Avatar.Image
                                size={40}
                                source={require("@/assets/images/sportHall_Icon_full_primary.png")}
                                theme={{
                                  colors: { primary: Colors.white },
                                }}
                              />
                              <View
                                style={{
                                  flex: 1,
                                  flexWrap: "wrap",
                                  flexDirection: "row",
                                  gap: 5,
                                }}
                              >
                                {item.sportHallName &&
                                item.date &&
                                item.startTime &&
                                item.endTime ? (
                                  <>
                                    <Text style={{ fontWeight: 600 }}>
                                      {item.sportHallName}
                                    </Text>
                                    <Text style={{ fontWeight: 800 }}>-</Text>
                                    <Text style={{ fontWeight: 300 }}>
                                      {item.date
                                        ? format(new Date(item.date), "MMMM dd")
                                        : ""}
                                    </Text>
                                    <Text>
                                      {item.startTime} - {item.endTime}
                                    </Text>
                                  </>
                                ) : (
                                  <Text>{item.group_chat_name}</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                    keyExtractor={(item) =>
                      item.group_ID ||
                      item.individualChat ||
                      Math.random().toString()
                    }
                  />
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
            </View>
          )}
        </>
      )}
    </>
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
  userImage: {},

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
