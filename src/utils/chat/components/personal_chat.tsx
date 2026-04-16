import { Color, router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/src/context/themeContext";
import { useChatStore } from "@/src/context/store/chatStore";
import { ChatTypes } from "@/interfaces/chatType";
import ProfileAvatar from "@/components/profile_avatar";
import AppText from "@/constants/appTextDefault";
import dayjs from "dayjs";
import { Skeleton } from "moti/skeleton";

const getSafeDate = (value: any): Date => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};
function PersonalChat({
  chats,
  currentChatId,
  loading,
}: {
  chats: Record<string, ChatTypes>;
  currentChatId: React.MutableRefObject<string>;
  loading: boolean;
}) {
  const { colors: Colors } = useTheme();
  const { addChatInfo } = useChatStore();

  const { width } = Dimensions.get("window");
  return (
    <>
      {Object.entries(chats).map(([key, item]: [string, ChatTypes]) => {
        const formatedOtherUser =
          item.userInfo[0]?.unique_user_ID[0].toUpperCase() +
          item.userInfo[0]?.unique_user_ID.slice(1);
        const otherUser =
          item.userInfo[0]._id.toString() !==
          item.lastMessage?.senderId?.toString() ? (
            <AppText style={{ color: Colors.primary }}>You:</AppText>
          ) : null;
        const AVATAR_WIDTH = width * 0.7 * 0.23;
        const MESSAGE_WIDTH =
          width - 20 - AVATAR_WIDTH - 10 * 2 - 5 * 2 - 6 - 20;
        const time = getSafeDate(item.lastMessage?.timestamp);
        const formattedTime = dayjs(time).isSame(dayjs(), "day")
          ? dayjs(time).format("HH:mm")
          : dayjs(time).format("MMM D");
        return loading ? (
          <ChatSkeletonItem width={width} color={Colors} />
        ) : (
          <View
            key={item.chatId}
            style={[
              styles.groupItem,
              {
                backgroundColor: Colors.containerColor,
                shadowColor: Colors.dark,
                width: width - 20,
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
                width={AVATAR_WIDTH}
                userName={item.userInfo[0].unique_user_ID}
              />
              <View
                style={{
                  gap: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <AppText style={{ fontSize: 20, fontWeight: "500" }}>
                    {formatedOtherUser}
                  </AppText>
                  <AppText style={{ marginRight: 10 }}>{formattedTime}</AppText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    minWidth: 0,
                  }}
                >
                  {otherUser}
                  <AppText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      marginLeft: otherUser ? 6 : 0,
                      width: MESSAGE_WIDTH,
                    }}
                  >
                    {item.lastMessage?.message}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}

function ChatSkeletonItem({ width, color }: { width: number; color: any }) {
  const AVATAR_WIDTH = width * 0.7 * 0.23;
  return (
    <View
      style={[
        styles.groupItem,
        {
          backgroundColor: color.containerColor,
          shadowColor: color.dark,
          width: width - 20,
        },
      ]}
    >
      <View style={{ flexDirection: "row", padding: 5 }}>
        {/* Avatar */}
        <Skeleton width={AVATAR_WIDTH} height={AVATAR_WIDTH} radius="round" />

        <View style={{ marginLeft: 8, flex: 1 }}>
          {/* Username + Time */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Skeleton width={120} height={20} />
            <Skeleton width={40} height={14} />
          </View>

          {/* Message */}
          <Skeleton width={"90%"} height={16} />
        </View>
      </View>
    </View>
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
