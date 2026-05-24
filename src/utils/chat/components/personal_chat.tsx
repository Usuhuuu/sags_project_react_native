import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/src/context/themeContext";
import { useChatStore } from "@/src/context/store/chatStore";
import { ChatTypes } from "@/interfaces/chatType";
import ProfileAvatar from "@/components/profile_avatar";
import AppText from "@/constants/appTextDefault";
import dayjs from "dayjs";
import { Skeleton } from "moti/skeleton";
import { Ionicons } from "@expo/vector-icons";

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
  const AVATAR_SIZE = 52;

  return (
    <>
      {Object.entries(chats).map(([key, item]: [string, ChatTypes]) => {
        const formatedOtherUser =
          item.userInfo[0]?.unique_user_ID[0].toUpperCase() +
          item.userInfo[0]?.unique_user_ID.slice(1);
        const isYou =
          item.userInfo[0]?._id.toString() !==
          item.lastMessage?.senderId?.toString();
        const time = getSafeDate(item.lastMessage?.timestamp);
        const formattedTime = dayjs(time).isSame(dayjs(), "day")
          ? dayjs(time).format("HH:mm")
          : dayjs(time).format("MMM D");

        // Determine if the chat has unread messages
        const unread = item.unseenCount > 0;

        return loading ? (
          <ChatSkeletonItem key={key} width={width} color={Colors} />
        ) : (
          <TouchableOpacity
            key={item.chatId}
            activeOpacity={0.7}
            onPress={() => {
              addChatInfo(key, item);
              currentChatId.current = key;
              router.push(`/(modals)/chat/${key}`);
            }}
            style={[
              styles.chatCard,
              {
                backgroundColor: Colors.surface,
                borderColor: Colors.border,
                shadowColor: Colors.shadowColor,
              },
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <ProfileAvatar
                imageUrl={null}
                width={AVATAR_SIZE}
                userName={item.userInfo[0]?.unique_user_ID}
              />
              {unread && (
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: Colors.primary },
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View
              style={[
                styles.contentSection,
                { borderBottomColor: Colors.borderSubtle },
              ]}
            >
              {/* Top row: name + time */}
              <View style={styles.topRow}>
                <AppText
                  style={[
                    styles.userName,
                    unread && styles.userNameUnread,
                    { color: Colors.onSurface },
                  ]}
                  numberOfLines={1}
                >
                  {formatedOtherUser}
                </AppText>
                <AppText style={[styles.timeText, { color: Colors.outline }]}>
                  {formattedTime}
                </AppText>
              </View>

              {/* Bottom row: message preview */}
              <View style={styles.bottomRow}>
                {isYou && (
                  <AppText style={[styles.youLabel, { color: Colors.primary }]}>
                    You:{" "}
                  </AppText>
                )}
                <AppText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.messagePreview,
                    {
                      color: unread ? Colors.onSurface : Colors.outline,
                    },
                  ]}
                >
                  {item.lastMessage?.message || "No messages yet"}
                </AppText>

                {/* Unread dot indicator */}
                {unread && (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: Colors.accentPrimary },
                    ]}
                  />
                )}
              </View>
            </View>

            {/* Chevron */}
            <View style={styles.chevronSection}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.outline}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

function ChatSkeletonItem({ width, color }: { width: number; color: any }) {
  return (
    <View
      style={[
        styles.chatCard,
        {
          backgroundColor: color.surface,
          borderColor: color.border,
          shadowColor: color.shadowColor,
        },
      ]}
    >
      {/* Avatar */}
      <Skeleton
        width={52}
        height={52}
        radius="round"
        colors={[color.surfaceHigh, color.surfaceHighest]}
      />

      {/* Content */}
      <View
        style={[
          styles.contentSection,
          { borderBottomColor: color.borderSubtle },
        ]}
      >
        {/* Username + Time */}
        <View style={styles.topRow}>
          <Skeleton
            width={100}
            height={16}
            radius={4}
            colors={[color.surfaceHigh, color.surfaceHighest]}
          />
          <Skeleton
            width={40}
            height={12}
            radius={4}
            colors={[color.surfaceHigh, color.surfaceHighest]}
          />
        </View>

        {/* Message */}
        <View style={styles.bottomRow}>
          <Skeleton
            width={"80%"}
            height={14}
            radius={4}
            colors={[color.surfaceHigh, color.surfaceHighest]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 5,
    paddingVertical: 14,
    paddingRight: 12,
    paddingLeft: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSection: {
    position: "relative",
    marginRight: 12,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  contentSection: {
    flex: 1,
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  userNameUnread: {
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
    flexShrink: 0,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  youLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  messagePreview: {
    fontSize: 14,
    flexShrink: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  chevronSection: {
    marginLeft: 4,
    justifyContent: "center",
  },
});

export default PersonalChat;
