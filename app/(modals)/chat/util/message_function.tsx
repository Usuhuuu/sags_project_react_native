import {
  ChatSeparator,
  LoadOlderMsjProp,
  Message,
  MessageHistory,
  MessageMapState,
  SendMessageProp,
} from "@/interfaces/chatType";
import {
  differenceInDays,
  differenceInMinutes,
  format,
  parseISO,
} from "date-fns";
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { generatedId } from "./objectID";
import { useTheme } from "../../context/themeContext";
import ProfileAvatar from "@/components/profile_avatar";

export const prepareMessages = (
  messages: Message[],
  cursorValue: Date | null,
  no_more_message: boolean,
) => {
  if (messages.length < 20 || cursorValue === null) {
  }
  const result = [...messages];
  const dateGroups: Record<string, number[]> = {};

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
        parseISO(nextMsg.timestamp.toString()),
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

const formatDate = (date: Date | number | string) => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (typeof date === "number") return new Date(date);
  return parseISO(date);
};

export const newMessagePrepareFunction = (
  messages: Message,
  messagesMap: Map<string, MessageMapState>,
  currentChatId: string,
) => {
  const existingMessages = currentChatId
    ? messagesMap.get(currentChatId)
    : undefined;
  const prevMsj = existingMessages?.messages[0];

  const prevDate = prevMsj ? formatDate(prevMsj.timestamp) : new Date(0);
  const currDate = formatDate(messages.timestamp);

  const diff = differenceInDays(currDate, prevDate);
  console.log("TIME DIFF", diff);
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

export const MemoizedChatItem = React.memo(
  ({
    item,
    userDatas,
    otherUser,
  }: {
    item: Message;
    userDatas: any;
    otherUser: string;
  }) => {
    const { colors: Colors, theme } = useTheme();
    const styles = useMemo(() => createStyle(Colors, theme), [Colors, theme]);
    const userSelf: boolean = item.sender_unique_name === userDatas.userId;
    const width = Dimensions.get("window").width;
    const w = (width / 2.7) * 0.23;
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
              paddingVertical: 1,
            },
          ]}
        >
          <View style={{ flexDirection: "row" }}>
            {/* Show avatar only if NOT userSelf and there's a time gap */}
            <View style={{ width: 30, marginRight: 6 }}>
              {!userSelf && item.showAvatar && (
                <ProfileAvatar
                  imageUrl={null}
                  width={w}
                  userName={userDatas.unique_user_ID}
                />
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
                        //borderTopLeftRadius: item.showTimeGap ? 10 : 0,
                        backgroundColor:
                          theme === "dark"
                            ? Colors.littleDarkGrey
                            : Colors.white,
                        borderColor:
                          theme === "dark"
                            ? Colors.littleDarkGrey
                            : Colors.lightGrey,
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
                    color:
                      theme === "dark"
                        ? Colors.themeColorTextSecondary
                        : Colors.dark,
                    fontWeight: "300",
                    marginTop: 2,
                    alignSelf: userSelf ? "flex-end" : "flex-start",
                  }}
                >
                  {format(item.timestamp, "hh:mm a")}
                </Text>
              )}
              {userSelf && item.showAvatar && (
                <Text
                  style={{
                    fontSize: 11,
                    color:
                      theme === "dark"
                        ? Colors.themeColorTextSecondary
                        : Colors.dark,
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
    prev.item._id === next.item._id &&
    prev.item.message === next.item.message &&
    prev.item.timestamp === next.item.timestamp &&
    prev.item.showAvatar === next.item.showAvatar &&
    prev.item.showTimeGap === next.item.showTimeGap &&
    prev.userDatas.userId === next.userDatas.userId,
);
const createStyle = (Colors: any, theme: "dark" | "light") =>
  StyleSheet.create({
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

export const loadOlderMsj = async ({
  socketRef,
  cursor,
  setCursor,
  setLoading,
  addMessageToMap,
  currentChatId,
  chatSeparator,
}: LoadOlderMsjProp) => {
  if (!socketRef.current?.connected || !cursor) return;
  socketRef.current?.emit(
    chatSeparator === ChatSeparator.PERSONAL
      ? "directChatHistory"
      : "chatHistory",
    { timer: cursor },
    (response: MessageHistory) => {
      if (
        !response.messages ||
        response.messages.length === 0 ||
        response.nextCursor == null
      ) {
        setLoading(false);
        return;
      }

      const formattedMessages = prepareMessages(
        response.messages,
        response.nextCursor,
        response.no_more_message,
      );
      addMessageToMap({
        chatID: currentChatId ?? "",
        messages: formattedMessages,
        newSendedMsj: false,
        no_more_message: response.no_more_message,
        cursor: response.nextCursor,
      });
      setCursor(response.nextCursor);
      setLoading(false);
    },
  );
};

export const sendMessage = async ({
  socketRef,
  messageText,
  userDataParsed,
  messagesMap,
  currentChatId,
  setNewMessage,
  flatListRef,
  addMessageToMap,
  cursor,
  friendInfo,
}: SendMessageProp) => {
  if (!messageText.trim()) return;
  if (!socketRef.current?.connected) return;
  const newMessage = {
    _id: generatedId(),
    sender_unique_name: userDataParsed.userId,
    message: messageText,
    timestamp: new Date(),
  };

  const prevMsj = messagesMap.get(currentChatId)?.messages[0];

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
      chatID: currentChatId,
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
      chatID: currentChatId,
      messages: [newMsjPrepared],
      newSendedMsj: true,
      cursor: cursor,
    });
  }
  socketRef.current.emit("chat-send", {
    msgData: newMessage,
    friendInfo: friendInfo,
  });
  setNewMessage("");
  flatListRef.current?.scrollToIndex({
    index: 0,
    animated: true,
  });
};
