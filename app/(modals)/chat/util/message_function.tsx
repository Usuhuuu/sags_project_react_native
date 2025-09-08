import Colors from "@/constants/Colors";
import { Message } from "@/interfaces/chatType";
import {
  differenceInDays,
  differenceInMinutes,
  format,
  parseISO,
} from "date-fns";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";

export const prepareMessages = (
  messages: Message[],
  cursorValue: Date | null,
  no_more_message: boolean
) => {
  if (messages.length < 20 || cursorValue === null) {
    return messages.map((msg, index) => ({
      ...msg,
      showDateSeparator: index === messages.length - 1,
      showAvatar: true,
      showTimeGap: true,
      isLastMessage: index === messages.length - 1,
    }));
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

export const newMessagePrepareFunction = (
  messages: Message,
  messagesMap: Map<string, Message[]>,
  currentChatId: React.RefObject<string>
) => {
  const existingMessages = currentChatId.current
    ? messagesMap.get(currentChatId.current)
    : undefined;
  const prevMsj = existingMessages?.[0];
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

export const MemoizedChatItem = React.memo(
  ({ item, userDatas }: { item: Message; userDatas: any }) => {
    //본인
    const userSelf: boolean =
      item.sender_unique_name === userDatas.unique_user_ID;
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
