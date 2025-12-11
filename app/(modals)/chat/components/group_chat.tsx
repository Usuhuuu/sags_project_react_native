import React from "react";
import { router } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Avatar, Badge } from "react-native-paper";
import { GroupChat } from "@/interfaces/chatType";
import { format } from "date-fns";
import { useTheme } from "../../context/themeContext";

function GroupChatComponent({
  chats,
  join_function,
}: {
  chats: any;
  join_function: (group_ID: string) => void;
}) {
  const { colors: Colors } = useTheme();
  const groupStyle = StyleSheet.create({
    groupItem: {
      padding: 10,
      marginVertical: 7,
      borderRadius: 5,
      backgroundColor: Colors.containerColor,
      shadowColor: Colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      width: "95%",
    },
  });
  return (
    <>
      {chats.map((item: GroupChat) => (
        <View key={item.group_ID} style={groupStyle.groupItem}>
          <TouchableOpacity
            onPress={() => {
              if (item.individualChat) {
                router.push(`/(modals)/chat/${item.group_chat_name}`);
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
                <View
                  style={{
                    flexDirection: "column",
                    width: "100%",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          fontWeight: 600,
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        {item.sportHallName}
                      </Text>
                      <Text
                        style={{
                          fontWeight: 800,
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        -
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <Text
                        style={{
                          fontWeight: 300,
                          justifyContent: "center",
                          color: Colors.themeColorTextSecondary,
                        }}
                      >
                        {item.date
                          ? format(new Date(item.date), "MMMM dd")
                          : ""}
                      </Text>
                      <Text
                        style={{
                          fontWeight: 300,
                          justifyContent: "center",
                          color: Colors.themeColorTextSecondary,
                        }}
                      >
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text>{item.group_chat_name}</Text>
              )}
              <View
                style={{
                  flexDirection: "column",
                  width: "100%",
                  alignItems: "center",
                  gap: 3,
                }}
              >
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
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

export default GroupChatComponent;
