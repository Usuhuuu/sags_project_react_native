import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/src/context/themeContext";
import { useChatStore } from "@/src/context/store/chatStore";
import { ChatTypes } from "@/interfaces/chatType";
import ProfileAvatar from "@/components/profile_avatar";

function PersonalChat({
  chats,
  currentChatId,
}: {
  chats: Record<string, ChatTypes>;
  currentChatId: React.MutableRefObject<string>;
}) {
  const { colors: Colors } = useTheme();
  const { addChatInfo } = useChatStore();

  const { width } = Dimensions.get("window");
  return (
    <>
      {Object.entries(chats).map(([key, item]: [string, ChatTypes]) => {
        return (
          <View
            key={item.chatId}
            style={[
              styles.groupItem,
              {
                backgroundColor: Colors.containerColor,
                shadowColor: Colors.dark,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                addChatInfo(key, item);
                currentChatId.current = key;
                router.push(`/(modals)/chat/${key}`);
              }}
              style={{
                flexDirection: "row",
                padding: 5,
                gap: 5,
              }}
            >
              <ProfileAvatar
                imageUrl={null}
                width={width * 0.7 * 0.23}
                userName={item.userInfo[0].unique_user_ID}
              />
              <View
                style={{
                  flex: 1,
                  flexWrap: "wrap",
                  flexDirection: "row",
                  gap: 5,
                }}
              ></View>
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    width: "95%",
  },
});

export default PersonalChat;
