import React, { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
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
} from "react-native";
import {
  prepareMessages,
  MemoizedChatItem,
  newMessagePrepareFunction,
  loadOlderMsj,
  saveMessageToMap,
  sendMessage,
} from "@/app/(modals)/chat/util/message_function";
import { Socket } from "socket.io-client";
import Colors from "@/constants/Colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Avatar } from "react-native-paper";
import { connectSocket, getSocket } from "@/hooks/socketConnection";
import { auth_swr } from "@/hooks/useswr";
import { useAuth } from "../context/authContext";
import { Message } from "@/interfaces/chatType";
import { generatedId } from "./util/objectID";

const DirectChatScreen: React.FC = ({}) => {
  const { item } = useLocalSearchParams();
  const [newMessage, setNewMessage] = useState<string>("");
  const [userDataParsed, setuserDataParsed] = useState<any>([]);
  const [cursor, setCursor] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isitReady, setIsitReady] = useState<boolean>(false);
  const [childModalVisible, setChildModalVisible] = useState<boolean>(false);
  const [activeUserData, setActiveUserData] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const currentChatId = useRef<string>("");
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );

  const { LoginStatus } = useAuth();
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = auth_swr({
    item: {
      pathname: "main",
      cacheKey: "RoleAndProfile_main",
      loginStatus: LoginStatus,
    },
  });
  useEffect(() => {
    if (userLoading) {
      setLoading(true);
    } else if (userData) {
      const parsedData =
        typeof userData.profileData == "string"
          ? JSON.parse(userData.profileData)
          : userData.profileData;

      setuserDataParsed(Array.isArray(parsedData) ? parsedData[0] : parsedData);
    }
  }, [userData, userError, userLoading]);

  const renderChatItem = useCallback(
    ({ item }: { item: Message }) => {
      return <MemoizedChatItem item={item} userDatas={userDataParsed} />;
    },
    [userDataParsed]
  );

  const width = Dimensions.get("window").width;
  const [menuVisible, setMenuVisible] = React.useState(false);

  useEffect(() => {
    const initIndividualChat = async () => {
      if (!socketRef.current?.connected) {
        const socket = await connectSocket();
        if (socket) socketRef.current = socket;
      }
      setIsitReady(true);
      socketRef.current?.emit(
        "directChatJoin",
        {
          initFriend: item,
        },
        (callBackData: any) => {
          currentChatId.current = callBackData.callBackData;
          if (!callBackData.success) {
            setIsitReady(false);

            return;
          }
          socketRef.current?.emit("direct-active-user");
          socketRef.current?.emit(
            "directChatHistory",
            {
              timer: new Date(),
              initFriend: item,
            },
            (message: any) => {
              setIsitReady(true);
              if (
                message.nextCursor === null &&
                message.messages.length === 0
              ) {
                setLoading(false);
                setIsitReady(false);
                return;
              }

              const formatMessages = prepareMessages(
                message.messages,
                message.nextCursor,
                message.no_more_message
              );

              saveMessageToMap({
                chat_ID: currentChatId.current,
                messages: formatMessages,
                newSendedMsj: false,
                setMessagesMap,
                setRefreshFlag,
              });

              setCursor(message.nextCursor);
              setIsitReady(false);
            }
          );
          socketRef.current?.on("directMessageReceived", async (data) => {
            if (!socketRef.current?.connected) {
              await connectSocket();
            }
            console.log("pisdas1", data);

            const newMsj: Message = {
              _id: generatedId(),
              sender_unique_name: data.sender_unique_name,
              message: data.message,
              timestamp: new Date(data.timestamp),
            };
            const preparedNewMsj = newMessagePrepareFunction(
              newMsj,
              messagesMap,
              currentChatId
            );
            saveMessageToMap({
              chat_ID: currentChatId.current,
              messages: preparedNewMsj,
              newSendedMsj: true,
              setMessagesMap,
              setRefreshFlag,
            });
            flatListRef.current?.scrollToIndex({
              index: 0,
              animated: true,
            });
          });
        }
      );
    };
    initIndividualChat();
  }, [item]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socketRef.current?.on("direct-activity-change", (data) => {
      setActiveUserData(data);
    });

    return () => {
      socketRef.current?.off("direct-activity-change");
    };
  }, []);

  const messagesMapData = messagesMap.get(currentChatId.current);
  return (
    <>
      {isitReady ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <ActivityIndicator size={40} color={Colors.primary} />
        </View>
      ) : (
        <SafeAreaProvider>
          <SafeAreaView style={{ backgroundColor: Colors.white }}>
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
                  borderBottomColor: Colors.lightGrey,
                  borderBottomWidth: 1,
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
                      socketRef.current?.emit("direct-inactive-user");
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
                    <Avatar.Image source={{ uri: userDataParsed.userImage }} />
                    <View style={{ gap: 5, alignSelf: "center" }}>
                      <Text style={{ fontSize: 20, fontWeight: "500" }}>
                        {typeof item === "string"
                          ? item.toUpperCase()[0] + item.slice(1)
                          : ""}
                      </Text>
                      <Text
                        style={{
                          color: activeUserData.includes(
                            Array.isArray(item) ? item[0] : (item as string)
                          )
                            ? "green"
                            : Colors.darkGrey,
                        }}
                      >
                        {activeUserData.includes(
                          Array.isArray(item) ? item[0] : (item as string)
                        )
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
                  <Feather
                    name="more-vertical"
                    size={30}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                ref={flatListRef}
                data={messagesMapData}
                renderItem={renderChatItem}
                keyExtractor={(item, index) =>
                  `${item.timestamp.toString()}-${index}`
                }
                inverted
                style={[
                  {
                    backgroundColor: Colors.lightGrey,
                    paddingBottom: 40,
                  },
                ]}
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                  if (!loading) {
                    setLoading(true);
                    loadOlderMsj({
                      socketRef,
                      cursor,
                      setCursor,
                      loading,
                      setLoading,
                      saveMessageToMap,
                      currentChatId,
                      setMessagesMap,
                      setRefreshFlag,
                    });
                  }
                }}
                extraData={refreshFlag}
              />
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
                      <AntDesign
                        name="plus"
                        size={24}
                        color={Colors.darkGrey}
                      />
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
                        <TouchableOpacity
                          onPress={() => console.log("Option 1")}
                        >
                          <Ionicons
                            name="camera"
                            size={24}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => console.log("Option 2")}
                        >
                          <Ionicons
                            name="camera"
                            size={24}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.input}>
                    <TextInput
                      value={newMessage}
                      onChangeText={(newMsj) => setNewMessage(newMsj)}
                      maxLength={2000}
                      style={{ flex: 1 }}
                      placeholderTextColor={Colors.darkGrey}
                      clearTextOnFocus={false}
                      multiline
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() =>
                      sendMessage({
                        messageText: newMessage,
                        socketRef: socketRef,
                        userDataParsed: userDataParsed,
                        messagesMap: messagesMap,
                        currentChatId: currentChatId,
                        setMessagesMap: setMessagesMap,
                        setRefreshFlag: setRefreshFlag,
                        setNewMessage: setNewMessage,
                        flatListRef: flatListRef,
                      })
                    }
                  >
                    <Ionicons name="send" size={32} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
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
          </SafeAreaView>
        </SafeAreaProvider>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 7,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightGrey,
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

  msjContainer: {},
  msjInside: {
    flexDirection: "column",
    borderWidth: 1,
    padding: 5,
  },
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
    marginVertical: 3,
    width: "100%",
  },
  userNameText: {
    fontSize: 12,
    color: Colors.primary,
    textShadowColor: Colors.primary,
    textShadowRadius: 0.5,
  },
  messageText: {
    padding: 5,
    fontSize: 18,
    marginRight: 0,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  messagesList: {
    //height: Dimensions.get("window").height,
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

export default DirectChatScreen;
