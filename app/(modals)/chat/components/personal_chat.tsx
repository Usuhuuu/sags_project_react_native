import { GroupChat } from "@/interfaces/chatType";
import { format } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Avatar, Badge } from "react-native-paper";
import { useHybridTime } from "../util/time_changing";
import { useTheme } from "../../context/themeContext";

function PersonalChat({
  chats,
  join_function,
}: {
  chats: any;
  join_function: (group_ID: string) => void;
}) {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    groupItem: {
      padding: 10,
      marginVertical: 7,
      borderRadius: 5,
      backgroundColor: Colors.containerColor,
      shadowColor: Colors.dark,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
      width: "95%",
    },
  });

  return (
    <>
      {chats.map((item: GroupChat) => {
        const timeAgo = useHybridTime(item.latestMessage?.timestamp);

        const latestMsgTime = item.latestMessage?.timestamp
          ? new Date(item.latestMessage.timestamp)
          : new Date();
        return (
          <View key={item.individualChat} style={styles.groupItem}>
            <TouchableOpacity
              onPress={() => {
                if (item.individualChat) {
                  router.push(`/(modals)/chat/${item.notUser}`);
                } else {
                  join_function(item.group_ID ?? "");
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
                  colors: { primary: Colors.containerColor },
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
                    <Text
                      style={{
                        fontWeight: 600,
                        color: Colors.themeColorTextPure,
                      }}
                    >
                      {item.sportHallName}
                    </Text>
                    <Text style={{ fontWeight: 800 }}>-</Text>
                    <Text style={{ fontWeight: 300 }}>
                      {item.date ? format(new Date(item.date), "MMMM dd") : ""}
                    </Text>
                    <Text>
                      {item.startTime} - {item.endTime}
                    </Text>
                  </>
                ) : (
                  <View
                    style={{
                      flexDirection: "column",
                      width: "95%",
                      alignItems: "center",
                      marginHorizontal: 10,
                      gap: 3,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        {item.notUser
                          ? String(item.notUser).charAt(0).toUpperCase() +
                            String(item.notUser).slice(1)
                          : ""}
                      </Text>
                      <Text
                        style={{
                          color: Colors.darkGrey,
                          fontSize: 12,
                        }}
                      >
                        {timeAgo}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: Colors.darkGrey }}>
                        {item.latestMessage?.message}
                      </Text>
                      <Badge
                        style={{
                          backgroundColor: Colors.primary,
                        }}
                        size={30}
                      >
                        {item.unseenCount}
                      </Badge>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}

export default PersonalChat;
