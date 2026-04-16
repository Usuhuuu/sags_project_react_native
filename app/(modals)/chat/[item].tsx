import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import {
  prepareMessages,
  MemoizedChatItem,
  newMessagePrepareFunction,
  loadOlderMsj,
  sendMessage,
} from "@/src/utils/chat/util/message_function";
import { Socket } from "socket.io-client";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { connectSocket, getSocket } from "@/hooks/socketConnection";
import { useAuth } from "@/src/context/authContext";
import { ChatSeparator, Message } from "@/interfaces/chatType";
import { generatedId } from "@/src/utils/chat/util/objectID";
import { useChatStore } from "@/src/context/store/chatStore";
import { useTheme } from "@/src/context/themeContext";
import { useAuthQuery } from "@/hooks/useQuery";
import ProfileAvatar from "@/components/profile_avatar";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

const DirectChatScreen: React.FC = ({}) => {
  const { item } = useLocalSearchParams();
  const { colors: Colors, theme } = useTheme();
  const { width } = Dimensions.get("window");
  const { LoginStatus } = useAuth();

  const [newMessage, setNewMessage] = useState<string>("");
  const [userDataParsed, setuserDataParsed] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isitReady, setIsitReady] = useState<boolean>(true);
  const [childModalVisible, setChildModalVisible] = useState<boolean>(false);
  const [activeUserData, setActiveUserData] = useState<string[] | null>(null);
  const [cursor, setCursor] = useState<Date | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showTyping, setShowTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const cursorRef = useRef(cursor);
  const typingRef = useRef(false);
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const selfTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const { addMessageToMap } = useChatStore();

  const hashKey = useMemo(() => {
    return typeof item === "string" ? item : item.join(":");
  }, [item]);
  const chatInfoMap = useChatStore((state) => state.chatInfo);
  const chatInfos = useMemo(() => {
    return chatInfoMap.get(hashKey);
  }, [chatInfoMap, hashKey]);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const messagesMap = useChatStore((state) => state.messagesMap);
  const messagesMapData = useMemo(() => {
    if (!currentChatId) return undefined;
    return messagesMap.get(currentChatId);
  }, [messagesMap, currentChatId]);

  const currentChatIdRef = useRef(currentChatId);
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const {
    data: userData,
    error,
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

  useEffect(() => {
    if (userData) {
      const parsedData =
        typeof userData.profileData == "string"
          ? JSON.parse(userData.profileData)
          : userData.profileData;
      setuserDataParsed(Array.isArray(parsedData) ? parsedData[0] : parsedData);
    } else if (error) {
      console.log("Error fetching user data:", error);
    }
  }, [userData, error]);
  if (userLoading) {
    return <OwnActivaterIndicator />;
  }

  const initIndividualChat = async ({ initFriend, chatId }: any) => {
    let socket = socketRef.current;

    if (!socket || !socket.connected) {
      socket = await connectSocket();

      if (!socket) return;

      socketRef.current = socket;

      await new Promise<void>((resolve) => {
        if (socket?.connected) return resolve();

        socket?.once("connect", () => {
          resolve();
        });

        socket?.connect();
      });
    }
    socket?.emit(
      "chat-join",
      { initFriend: initFriend, chatId: chatId },
      (callBackData: any) => {
        callBackData.activeUser
          ? setActiveUserData((prev) => {
              if (prev?.includes(callBackData.activeUser)) return prev;
              return [...(prev || []), callBackData.activeUser];
            })
          : null;

        setCurrentChatId(callBackData.chatId);
        const serverChatId = callBackData.chatId;
        const cacheMsj = useChatStore.getState().messagesMap.get(serverChatId);
        const latestTimestamp = cacheMsj?.messages?.[0]?.timestamp ?? null;
        if (!cacheMsj) {
          socketRef.current?.emit(
            "chat-history",
            {
              timer: new Date(),
              initFriend: item,
            },
            handleHistory,
          );
        } else {
          socketRef.current?.emit(
            "chat-history",
            {
              timer: latestTimestamp,
              initFriend: item,
            },
            handleHistory,
          );
        }
        function handleHistory(message: any) {
          if (!message?.messages?.length) {
            console.log("No messages received from server");
            setLoading(false);
            setIsitReady(false);
            return;
          }
          const formatted = prepareMessages(
            message.messages,
            message.nextCursor,
            message.no_more_message,
          );

          addMessageToMap({
            chatID: message.chatId,
            messages: formatted,
            newSendedMsj: false,
            no_more_message: message.no_more_message,
            cursor: message.nextCursor,
          });

          setCursor(message.nextCursor);
          setIsitReady(false);
        }
        setIsitReady(false);
      },
    );
  };
  useFocusEffect(
    useCallback(() => {
      console.log(chatInfos);
      if (!chatInfos?.userInfo?.[0]) return;
      const socket = socketRef.current || getSocket();
      socketRef.current = socket;
      initIndividualChat({
        initFriend: chatInfos?.userInfo[0],
        chatId: chatInfos?.chatId,
      });
      return () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("chat-deactive");
          socketRef.current.emit("leaving-chat", {
            chatId: currentChatId,
            userId: userDataParsed?.userId,
          });
        }
      };
    }, [chatInfos]),
  );
  useEffect(() => {
    const socket = socketRef.current || getSocket();
    socketRef.current = socket;
    const handle = (data: any) => {
      setActiveUserData(data);
    };
    const hanleTypingChanges = (data: {
      userId: string;
      isTyping: boolean;
    }) => {
      console.log("Typing change received:", data);
      const { userId, isTyping } = data;
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
      const existingTimout = timeoutRef.current.get(userId);
      if (existingTimout) {
        clearTimeout(existingTimout);
      }
      if (isTyping) {
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          timeoutRef.current.delete(userId);
        }, 3000);
        timeoutRef.current.set(userId, timeout);
      } else {
        timeoutRef.current.delete(userId);
      }
    };
    socket?.off("chat-activity-change", handle);
    socket?.off("chat-typing-change", hanleTypingChanges);
    socket?.on("chat-activity-change", handle);
    socket?.on("chat-typing-change", hanleTypingChanges);

    return () => {
      socketRef.current?.off("chat-activity-change", handle);
      socketRef.current?.off("chat-typing-change", hanleTypingChanges);
    };
  }, []);
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);
  useEffect(() => {
    const createAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createAnim(dot1, 0);
    const anim2 = createAnim(dot2, 150);
    const anim3 = createAnim(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (data: any) => {
      console.log("Received message:", data);
      if (!currentChatId) return;
      if (data.chatID !== currentChatId) return;
      const newMsj: Message = {
        _id: data._id || generatedId(),
        sender_unique_name: data.sender_unique_name,
        message: data.message,
        timestamp: new Date(data.timestamp),
      };
      const preparedNewMsj = newMessagePrepareFunction(
        newMsj,
        useChatStore.getState().messagesMap,
        currentChatId,
      );
      addMessageToMap({
        chatID: currentChatId,
        messages: preparedNewMsj,
        newSendedMsj: true,
        cursor: cursorRef.current,
      });

      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    socket.on("chat-msj-recieve", handler);

    return () => {
      socket.off("chat-msj-recieve", handler);
    };
  }, [currentChatId]);

  const handleTyping = () => {
    if (newMessage.length === 0) {
      if (typingRef.current) {
        typingRef.current = false;
        socketRef.current?.emit("chat-stop-typing", {
          chatId: currentChatId,
        });
      }

      if (selfTimeoutRef.current) {
        clearTimeout(selfTimeoutRef.current);
        selfTimeoutRef.current = null;
      }

      return;
    }
    if (!typingRef.current) {
      typingRef.current = true;
      socketRef.current?.emit("chat-typing", {
        chatId: currentChatId,
      });
    }
    if (selfTimeoutRef.current) {
      clearTimeout(selfTimeoutRef.current);
    }

    selfTimeoutRef.current = setTimeout(() => {
      if (typingRef.current) {
        typingRef.current = false;
        socketRef.current?.emit("chat-stop-typing", {
          chatId: currentChatId,
        });
      }
    }, 1500);
  };

  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const messages = useMemo(
    () => messagesMapData?.messages ?? [],
    [messagesMapData?.messages],
  );
  const formatted = useMemo(() => {
    const name = chatInfos?.userInfo?.[0]?.unique_user_ID;
    if (!name || typeof name !== "string") return "";
    return name ? name[0].toUpperCase() + name.slice(1) : "";
  }, [chatInfos]);

  const otherUser = useMemo(() => {
    const user = chatInfos?.userInfo?.[0];
    if (!user) return null;
    return {
      _id: user._id.toString(),
      unique_user_ID: user.unique_user_ID,
    };
  }, [chatInfos?.userInfo]);
  const isOtherTyping = !!otherUser?._id && typingUsers.has(otherUser._id);

  const flatRenderFunction = useCallback(
    ({ item }: { item: Message }) => {
      return (
        <MemoizedChatItem
          item={item}
          userDatas={userDataParsed}
          otherUser={otherUser?.unique_user_ID ?? "UNKNOWN"}
        />
      );
    },
    [userDataParsed],
  );

  useEffect(() => {
    if (isOtherTyping) {
      setShowTyping(true);
      Animated.timing(typingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(typingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowTyping(false);
      });
    }
  }, [isOtherTyping]);
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((t) => clearTimeout(t));
      timeoutRef.current.clear();

      if (selfTimeoutRef.current) {
        clearTimeout(selfTimeoutRef.current);
      }
    };
  }, []);

  return isitReady ? (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <ActivityIndicator size={40} color={Colors.primary} />
    </View>
  ) : (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: Colors.backgroundColor }}>
        <View
          style={{
            height: "100%",
            width: width,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "100%",
              marginHorizontal: 10,
              height: "10%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons
                  name="arrow-back-sharp"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  paddingLeft: 10,
                }}
              >
                <ProfileAvatar
                  imageUrl={userDataParsed.userImage ?? null}
                  width={width * 0.15}
                  userName={otherUser?.unique_user_ID}
                />
                <View style={{ gap: 5, alignSelf: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "500",
                      color: Colors.themeColorTextPure,
                    }}
                  >
                    {formatted}
                  </Text>
                  <Text
                    style={{
                      color:
                        otherUser?._id &&
                        activeUserData?.includes(otherUser._id)
                          ? Colors.green
                          : Colors.darkGrey,
                    }}
                  >
                    {otherUser?._id && activeUserData?.includes(otherUser._id)
                      ? "Online"
                      : "Offline"}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setChildModalVisible(true);
              }}
            >
              <Feather name="more-vertical" size={30} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={flatRenderFunction}
            keyExtractor={(item) => {
              return item._id;
            }}
            inverted
            style={[
              {
                backgroundColor:
                  theme === "dark" ? Colors.containerColor : Colors.lightGrey,
                paddingBottom: 40,
              },
            ]}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (loading || !cursor) return;
              setLoading(true);
              loadOlderMsj({
                socketRef,
                cursor,
                setCursor,
                loading,
                setLoading,
                addMessageToMap,
                currentChatId,
                chatSeparator: ChatSeparator.PERSONAL,
              });
            }}
          />
          <View
            style={{
              width: width,
              backgroundColor: Colors.containerColor,
              paddingVertical: 10,
            }}
          >
            {showTyping && (
              <Animated.View
                style={{
                  opacity: typingOpacity,
                  transform: [
                    {
                      translateY: typingOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                    },
                  ],
                  backgroundColor:
                    theme === "dark" ? Colors.littleDarkGrey : Colors.white,
                  borderColor:
                    theme === "dark" ? Colors.littleDarkGrey : Colors.lightGrey,
                  borderRadius: 10,
                  marginLeft: 50,
                  maxWidth: width * 0.7,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  padding: 5,
                  gap: 2,
                }}
              >
                <Animated.Text style={{ opacity: dot1 }}>•</Animated.Text>
                <Animated.Text style={{ opacity: dot2 }}>•</Animated.Text>
                <Animated.Text style={{ opacity: dot3 }}>•</Animated.Text>

                <Text numberOfLines={1} ellipsizeMode="tail" style={{}}>
                  {`${otherUser?.unique_user_ID} is typing...`}
                </Text>
              </Animated.View>
            )}
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100 / 2 + 10}
          >
            <View style={[styles.inputContainer]}>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(!menuVisible);
                  }}
                  style={{
                    backgroundColor: Colors.lightGrey,
                    padding: 7,
                    borderRadius: 20,
                  }}
                >
                  <AntDesign name="plus" size={24} color={Colors.darkGrey} />
                </TouchableOpacity>
                {menuVisible && (
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: "white",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                      top: -80,
                      flex: 1,
                      left: 0,
                      right: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 5,
                      width: 40,
                      gap: 10,
                      borderRadius: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => console.log("Option 1")}>
                      <Ionicons
                        name="camera"
                        size={24}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log("Option 2")}>
                      <Ionicons
                        name="camera"
                        size={24}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors.lightGrey,
                  },
                ]}
              >
                <TextInput
                  value={newMessage}
                  onChangeText={(newMsj) => {
                    setNewMessage(newMsj);
                    handleTyping();
                  }}
                  onBlur={() => {
                    if (typingRef.current) {
                      typingRef.current = false;
                      socketRef.current?.emit("chat-stop-typing", {
                        chatId: currentChatId,
                      });
                    }
                  }}
                  maxLength={2000}
                  style={{ flex: 1 }}
                  placeholderTextColor={Colors.darkGrey}
                  clearTextOnFocus={false}
                  multiline
                  placeholder="Type a message..."
                />
              </View>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  sendMessage({
                    messageText: newMessage,
                    socketRef: socketRef,
                    userDataParsed: userDataParsed,
                    messagesMap: messagesMap,
                    currentChatId: currentChatId,
                    setNewMessage: setNewMessage,
                    flatListRef: flatListRef,
                    addMessageToMap: addMessageToMap,
                    cursor: cursorRef.current,
                    friendInfo: chatInfos?.userInfo,
                  });
                  if (typingRef.current) {
                    typingRef.current = false;
                    socketRef.current?.emit("chat-stop-typing", {
                      chatId: currentChatId,
                    });
                  }
                }}
              >
                <Ionicons name="send" size={32} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
        {childModalVisible && (
          <Modal
            animationType="fade"
            visible={childModalVisible}
            style={{ zIndex: 2 }}
          >
            <SafeAreaProvider style={{ backgroundColor: Colors.white }}>
              <SafeAreaView style={{ width: width, height: "100%" }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    borderBottomColor: "#ddd",
                    borderBottomWidth: 1,
                    height: "10%",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setChildModalVisible(false);
                    }}
                  >
                    <Ionicons
                      name="arrow-back-sharp"
                      size={24}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 24, color: Colors.primary }}>
                    Group Chat Settings
                  </Text>
                </View>
              </SafeAreaView>
            </SafeAreaProvider>
          </Modal>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const createStyles = (Colors: any) =>
  StyleSheet.create({
    input: {
      flex: 1,
      borderRadius: 20,
      padding: 7,
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      gap: 10,
    },
    sendButton: {
      padding: 12,
      borderRadius: 25,
      marginLeft: 8,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    sendButtonText: {
      fontSize: 16,
      color: "#fff",
      fontWeight: "bold",
    },
  });
export default DirectChatScreen;
