import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
  format,
  isYesterday,
} from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { EvilIcons, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { usePostStore } from "@/app/(modals)/context/store/postStore";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { SafeAreaView } from "react-native-safe-area-context";
import { RQ_simple_cache_key, useSimpleQuery } from "@/hooks/useQuery";
import { useLocalSearchParams } from "expo-router";
import axiosInstance from "@/hooks/axiosInstance";
import { Avatar } from "react-native-paper";

interface CommentTypes {
  _id: string;
  author: {
    unique_user_ID: string;
  };
  text: string;
  createdAt: string;
  replies: ReplyContext[];
  parentCommentID?: string;
}
interface ReplyContext {
  _id: string;
  author: {
    unique_user_ID: string;
  };
  text: string;
  createdAt: string;
  isReplying?: boolean | undefined;
}
export const timeAgo = (date: string | Date) => {
  const now = new Date();
  const d = new Date(date);

  const minutes = differenceInMinutes(now, d);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = differenceInHours(now, d);
  if (hours < 24) return `${hours}h`;

  if (isYesterday(d)) return "Yesterday";

  const days = differenceInDays(now, d);
  if (days < 30) return `${days}d`;

  const months = differenceInMonths(now, d);
  if (months < 12) return `${months}mo`;

  const years = differenceInYears(now, d);
  return `${years}y`;
};

const PostComment = () => {
  const { colors, theme } = useTheme();
  const item = usePostStore((state) => state.postDetails);
  const post_id = useLocalSearchParams().post_id as string;
  const [commentText, setCommentText] = useState<string>("");
  const [commentData, setCommentData] = useState<CommentTypes[]>();
  const [page, setPage] = useState<number>(1);
  const [replyTo, setReplyTo] = useState<{
    _id: string;
    author: string;
  } | null>(null);

  if (item === null) {
    return (
      <View>
        <OwnActivaterIndicator />
      </View>
    );
  }
  const queryKey = ["post_comments"] as RQ_simple_cache_key;
  const { data, error, isLoading } = useSimpleQuery(
    {
      pathname: `/post/comments/${post_id}`,
      cacheKey: queryKey,
    },
    {
      enabled: true,
    },
  );

  useEffect(() => {
    if (data?.success && Array.isArray(data.commentsData)) {
      setCommentData((prev) => {
        const seen = new Set();
        const commentsArray = Array.isArray(data?.commentsData)
          ? data.commentsData
          : [];

        const unique = commentsArray.filter((comment) => {
          if (seen.has(comment._id)) {
            return false;
          }
          seen.add(comment._id);
          return true;
        });
        const sortedUniqueComments = unique.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return sortedUniqueComments;
      });
    }
  }, [data, error, isLoading]);

  const handleSendComment = async () => {
    try {
      const response = await axiosInstance.post(`/post/comments/${post_id}`, {
        comment_text: commentText,
      });
      if (response.status === 200) {
        setCommentText("");
      }
    } catch (err) {
      console.log("Error sending comment:", err);
    }
  };
  const handleSendReply = async () => {
    try {
      const response = await axiosInstance.post(`/post/comments/${post_id}`, {
        comment_text: commentText,
        parentId: replyTo?._id,
      });
      if (response.status === 200 && response.data.success) {
        const returnData = response.data;
        setCommentData((prev) => {
          if (!Array.isArray(prev) || !replyTo) return prev;

          return prev.map((comment) => {
            if (comment._id !== replyTo._id) return comment;
            const newReply = {
              _id: returnData.data._id,
              text: returnData.data.text,
              createdAt: returnData.data.createdAt,
              author: {
                unique_user_ID: returnData.data.author.unique_user_ID,
              },
            };

            return {
              ...comment,
              replies: Array.isArray(comment.replies)
                ? [...comment.replies, newReply]
                : [newReply],
            };
          });
        });
        setCommentText("");
        setReplyTo(null);
      }
    } catch (err) {
      console.log("Error sending reply:", err);
    }
  };
  const renderItem = useCallback(
    ({ item }: { item: CommentTypes }) => {
      return (
        <CommentRenderer
          items={item}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
        />
      );
    },
    [replyTo, setReplyTo],
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor:
          theme === "light" ? colors.white : colors.backgroundColor,
        flex: 1,
        borderTopWidth: theme === "dark" ? 0 : 1,
        borderTopColor:
          theme === "dark" ? colors.darkGrey : colors.littleDarkGrey,
      }}
      edges={["left", "right", "bottom"]}
    >
      <View
        style={[
          {
            backgroundColor: colors.backgroundColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 4, height: 2 },
          },
        ]}
      >
        <View
          style={[
            {
              borderBottomColor: colors.littleDarkGrey,

              backgroundColor: colors.backgroundColor,
            },
          ]}
        >
          <View
            style={{
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
              shadowColor: colors.shadowColor,
              shadowOffset: { width: 4, height: 2 },
              shadowOpacity: theme === "dark" ? 0.7 : 0.1,
              shadowRadius: 4,
              backgroundColor: colors.containerColor,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#1c1c1c",
                  marginRight: 10,
                }}
              />
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 14, fontWeight: "500" }}>
                  {item.block?.users_info[0]?.unique_user_ID}
                </AppText>
                {/* <AppText
                style={{ color: colors.darkGrey, fontSize: 11, marginTop: 2 }}
              >
                {item.badge}
              </AppText> */}
              </View>
              <AppText style={{ color: colors.darkGrey, fontSize: 11 }}>
                {format(new Date(item?.day), "MMM dd, yyyy")}
              </AppText>
            </View>

            <AppText
              style={{
                fontSize: 14,
                lineHeight: 20,
                marginVertical: 10,
              }}
            >
              {item.block?.post.is_default_post
                ? `Looking for players to join a ${
                    item.block?.post.sport_type
                  } session at ${item.block?.hall_info?.hall_details.hall_name}.
Time: ${dayjs(item.block.start_time).format("HH:mm")} – ${dayjs(
                    item.block.end_time,
                  ).format("HH:mm")}. Feel free to join if available.`
                : item.block?.post.post_text}
            </AppText>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => {}}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={colors.darkGrey}
                  />

                  <AppText
                    style={{
                      color: colors.darkGrey,
                      fontSize: 14,
                      marginLeft: 4,
                    }}
                  >
                    {item.block?.post.comment?.length ?? 0}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <FontAwesome
                    name="heart"
                    size={20}
                    color={colors.darkGrey}
                    style={{ marginLeft: 12 }}
                  />
                  <AppText
                    style={{
                      color: colors.darkGrey,
                      fontSize: 14,
                      marginLeft: 4,
                    }}
                  >
                    {item.block?.post.likes}
                  </AppText>
                </TouchableOpacity>
              </View>

              {item.block?.post.joinable && (
                <TouchableOpacity
                  style={{
                    borderColor: colors.primary,
                    paddingHorizontal: 14,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AppText
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Join
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.backgroundColor }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 99 : 0}
      >
        <FlatList
          data={commentData}
          renderItem={(props) => renderItem(props)}
          scrollEnabled={true}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        <View
          style={{
            backgroundColor: colors.backgroundColor,
          }}
        >
          {/* Reply context */}
          {!!replyTo && (
            <View
              style={{
                backgroundColor: colors.containerColor,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name="return-up-back-outline"
                  size={16}
                  color={colors.primary}
                />
                <AppText style={{ fontSize: 12, color: colors.darkGrey }}>
                  Replying to
                  <AppText
                    style={{
                      fontWeight: "600",
                      color: colors.themeColorTextPure,
                    }}
                  >
                    {replyTo?.author}
                  </AppText>
                </AppText>
              </View>

              <TouchableOpacity onPress={() => {}}>
                <EvilIcons name="close" size={22} color={colors.darkGrey} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.containerColor,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderTopLeftRadius: replyTo ? 0 : 20,
              borderTopRightRadius: replyTo ? 0 : 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <TextInput
              placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
              value={commentText}
              onChangeText={setCommentText}
              placeholderTextColor={colors.darkGrey}
              style={{
                flex: 1,
                backgroundColor: colors.darkGrey + "12",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.themeColorTextPure,
                fontSize: 14,
              }}
              multiline
            />

            <TouchableOpacity
              onPress={() => {
                console.log(replyTo);
                if (replyTo === null || undefined) {
                  handleSendComment();
                } else {
                  handleSendReply();
                }
              }}
              disabled={!commentText.trim()}
              style={{
                marginLeft: 10,
                backgroundColor: commentText.trim()
                  ? colors.primary
                  : colors.primary + "55",
                height: 44,
                width: 44,
                borderRadius: 22,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const CommentRenderer = ({
  items,
  setReplyTo,
}: {
  items: CommentTypes;
  replyTo: {
    _id: string;
    author: string;
  } | null;
  setReplyTo: React.Dispatch<
    React.SetStateAction<{
      _id: string;
      author: string;
    } | null>
  >;
}) => {
  const { colors, theme } = useTheme();
  const { width, height } = Dimensions.get("window");

  return (
    <View style={{ marginVertical: 6 }}>
      {/* MAIN COMMENT */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          padding: 10,
          margin: 10,
          backgroundColor: colors.backgroundColor,
        }}
      >
        <Avatar.Icon icon="account" size={height * 0.03} />

        <View
          style={{
            flex: 1,
            gap: 7,
          }}
        >
          <View
            style={{
              backgroundColor: colors.containerColor,
              padding: 10,
              borderTopRightRadius: 15,
              borderBottomRightRadius: 15,
              borderBottomLeftRadius: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginBottom: 4,
              }}
            >
              <AppText style={{ fontSize: 14, fontWeight: "bold" }}>
                {items.author.unique_user_ID}
              </AppText>
              <AppText style={{ color: colors.darkGrey }}>
                {timeAgo(items.createdAt)}
              </AppText>
            </View>
            <AppText style={{ fontWeight: "300" }}>{items.text}</AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setReplyTo({
                  _id: items._id,
                  author: items.author.unique_user_ID,
                })
              }
              style={{ width: 50 }}
            >
              <AppText style={{ color: colors.primary }}>Reply</AppText>
            </TouchableOpacity>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <FontAwesome name="heart" size={16} color={colors.darkGrey} />
              <Ionicons
                name="return-up-back-outline"
                size={16}
                color={colors.darkGrey}
              />
            </View>
          </View>
        </View>
      </View>

      {/* REPLIES */}
      {Array.isArray(items.replies) &&
        items.replies.map((reply) => {
          return (
            <View
              style={{
                margin: 10,
                width: width * 0.8,
                marginLeft: width * 0.15,
                flexDirection: "row",
                borderLeftColor: colors.containerColor,
                borderLeftWidth: 2,
                gap: 10,
              }}
              key={reply._id}
            >
              <Avatar.Icon icon="account" size={height * 0.03} style={{}} />

              <View
                style={{
                  backgroundColor: colors.containerColor,
                  flex: 1,
                  padding: 10,
                  borderTopRightRadius: 15,
                  borderBottomRightRadius: 15,
                  borderBottomLeftRadius: 15,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 4,
                  }}
                >
                  <AppText style={{ fontSize: 14, fontWeight: "bold" }}>
                    {reply.author?.unique_user_ID}
                  </AppText>
                  <AppText style={{ color: colors.darkGrey }}>
                    {timeAgo(new Date(reply.createdAt))}
                  </AppText>
                </View>
                <AppText style={{ fontWeight: "300" }}>{reply.text}</AppText>
              </View>
            </View>
          );
        })}
    </View>
  );
};

export default PostComment;
