import Colors from "@/constants/Colors";
import { GroupChat } from "@/interfaces/chatType";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Avatar, Badge } from "react-native-paper";
import { useHybridTime } from "../util/time_changing";
import { useChatStore } from "../../context/store/chatStore";

function PersonalChat({
  chats,
  join_function,
}: {
  chats: any;
  join_function: (group_ID: string) => void;
}) {
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
                      <Text style={{}}>
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

const styles = StyleSheet.create({
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
});

export default PersonalChat;
