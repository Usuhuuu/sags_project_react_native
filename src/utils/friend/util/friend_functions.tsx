import { FriendSeparator, FriendsType } from "@/interfaces/friendType";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useFriendStore } from "@/src/context/store/friendStore";
import { useTheme } from "@/src/context/themeContext";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { queryClient } from "@/hooks/queryClient";
import ProfileAvatar from "@/components/profile_avatar";
import { Socket } from "socket.io-client";
import { useChatStore } from "@/src/context/store/chatStore";
import { ChatTypes } from "@/interfaces/chatType";

interface FriendItemProps {
  item: FriendsType;
  userStatus: string;
  onRemove: ({ id, type }: { id: string; type: FriendSeparator }) => void;
  page: Record<FriendSeparator, number>;
  socketRef: React.MutableRefObject<Socket | null>;
}

const SCREEN_W = Dimensions.get("screen").width;

// ── Online status ──────────────────────────────────────────────────────────
type ActiveStatus = "online" | "away" | "offline";

// Dot appearance per status
const STATUS_DOT: Record<ActiveStatus, { color: string; label: string }> = {
  online: { color: "#22C55E", label: "Online" },
  away: { color: "#FBBF24", label: "Away" },
  offline: { color: "#6B7280", label: "Offline" },
};

// ── FriendItem ─────────────────────────────────────────────────────────────
export const FriendItem = React.memo(
  ({ item, userStatus, onRemove, page, socketRef }: FriendItemProps) => {
    const { setFriendDetails } = useFriendStore();
    const { colors: Colors } = useTheme();
    const { addChatInfo } = useChatStore();

    const isFriend = userStatus === FriendSeparator.FRIENDS;
    const isRequest = userStatus === FriendSeparator.REQUESTS;

    // ── Active status state ────────────────────────────────────────────────
    // Seed from item if the server already provides it, otherwise start offline
    const [activeStatus, setActiveStatus] = useState<ActiveStatus>(
      (item as any).isOnline ? "online" : "offline",
    );

    useEffect(() => {
      const socket = socketRef.current;
      if (!socket) return;

      // Ask server for this user's current status on mount
      socket.emit("get_user_status", { userId: item._id });

      // ── Socket event handlers ──
      const onOnline = (userId: string) => {
        if (userId === item._id) setActiveStatus("online");
      };
      const onAway = (userId: string) => {
        if (userId === item._id) setActiveStatus("away");
      };
      const onOffline = (userId: string) => {
        if (userId === item._id) setActiveStatus("offline");
      };
      // Server replies to get_user_status with { userId, status }
      const onStatusReply = (data: {
        userId: string;
        status: ActiveStatus;
      }) => {
        if (data.userId === item._id) setActiveStatus(data.status);
      };

      socket.on("user_online", onOnline);
      socket.on("user_away", onAway);
      socket.on("user_offline", onOffline);
      socket.on("user_status", onStatusReply);

      return () => {
        socket.off("user_online", onOnline);
        socket.off("user_away", onAway);
        socket.off("user_offline", onOffline);
        socket.off("user_status", onStatusReply);
      };
    }, [item._id]); // only re-subscribe when the user changes

    const dot = STATUS_DOT[activeStatus];

    // ── Memos ──────────────────────────────────────────────────────────────
    const avatarSize = useMemo(
      () => Math.min(Math.floor((SCREEN_W / 2) * 0.24), 52),
      [],
    );

    const displayName = useMemo(
      () =>
        item.unique_user_ID
          ? item.unique_user_ID.charAt(0).toUpperCase() +
            item.unique_user_ID.slice(1)
          : "Unknown",
      [item.unique_user_ID],
    );

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleChat = () => {
      const chatInfo: ChatTypes = {
        chatId: item.chatId,
        members: item._id,
        userInfo: [{ _id: item._id, unique_user_ID: item.unique_user_ID }],
        chat_image: undefined,
        unseenCount: 0,
      };
      addChatInfo(`${item._id}`, chatInfo);
      router.push(`/(modals)/chat/${item._id}`);
    };

    const handleProfile = () => {
      setFriendDetails({
        _id: item._id,
        unique_user_ID: item.unique_user_ID,
        userImage: item.userImage,
        email: item.email,
        userNames: item.userNames,
        chatId: item.chatId,
        chatKey: item.chatKey,
      });
      router.push(`/(modals)/user/${item.unique_user_ID}`);
    };

    const handleAccept = async (user: FriendsType) => {
      try {
        const response = await axiosInstance.post("/auth/friend_accept", {
          friend_unique_ID: user.unique_user_ID,
        });
        if (response.data.success && response.status === 200) {
          Notifier.showNotification({
            title: "Friend Request Accepted",
            description: "Accepted",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
          queryClient.invalidateQueries({
            queryKey: [
              "auth_friend",
              FriendSeparator.REQUESTS,
              page[FriendSeparator.REQUESTS],
            ],
          });
          onRemove({ id: item.unique_user_ID, type: FriendSeparator.REQUESTS });
        } else {
          Notifier.showNotification({
            title: "Request Failed",
            description: response.data.message || "Try again later",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <View
        style={[
          S.card,
          {
            backgroundColor: Colors.surface,
            borderColor: Colors.border,
            shadowColor: Colors.shadowColor,
          },
        ]}
      >
        {/* ── Avatar · Name · Actions ── */}
        <View style={S.topRow}>
          {/* Avatar + status dot */}
          <View style={S.avatarWrap}>
            <ProfileAvatar
              width={avatarSize}
              imageUrl={item.userImage}
              userName={item.unique_user_ID}
            />
            {/* Dot: color + border adapt to status and card background */}
            <View
              style={[
                S.onlineDot,
                {
                  backgroundColor: dot.color,
                  borderColor: Colors.surface,
                  // Offline dot is smaller and more muted
                  width: activeStatus === "offline" ? 9 : 11,
                  height: activeStatus === "offline" ? 9 : 11,
                  borderRadius: activeStatus === "offline" ? 4.5 : 5.5,
                  opacity: activeStatus === "offline" ? 0.5 : 1,
                },
              ]}
            />
          </View>

          {/* Name + status subtitle */}
          <View style={S.nameBlock}>
            <Text
              style={[S.username, { color: Colors.onSurface }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {/* Shows status text for friends, email/handle for requests */}
            <Text style={[S.subtitle, { color: dot.color }]} numberOfLines={1}>
              {isFriend
                ? dot.label // "Online" / "Away" / "Offline"
                : (item.email ?? `@${item.unique_user_ID}`)}
            </Text>
          </View>

          {/* Icon buttons — FRIENDS only */}
          {isFriend && (
            <View style={S.friendActions}>
              <TouchableOpacity
                style={[S.iconBtn, { backgroundColor: Colors.surfaceHigh }]}
                onPress={handleProfile}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={15} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.iconBtn, { backgroundColor: Colors.primary }]}
                onPress={handleChat}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble" size={15} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Accept / Decline — REQUESTS only ── */}
        {isRequest && (
          <View style={S.requestRow}>
            <TouchableOpacity
              style={[S.acceptBtn, { backgroundColor: Colors.primary }]}
              onPress={() => handleAccept(item)}
              activeOpacity={0.8}
            >
              <Feather name="check" size={15} color={Colors.white} />
              <Text style={S.acceptText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.declineBtn, { borderColor: Colors.border }]}
              activeOpacity={0.8}
            >
              <Feather name="x" size={15} color={Colors.outline} />
              <Text style={[S.declineText, { color: Colors.outline }]}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  },
  (prev, next) =>
    prev.item.unique_user_ID === next.item.unique_user_ID &&
    prev.userStatus === next.userStatus,
);

// ── Styles ─────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    borderWidth: 2,
  },
  nameBlock: {
    flex: 1,
    gap: 3,
  },
  username: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500", // slightly bolder — status label reads as a badge
  },
  friendActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  requestRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  declineText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
