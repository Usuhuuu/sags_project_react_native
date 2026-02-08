import { useTheme } from "@/app/(modals)/context/themeContext";
import { PostTypes } from "@/app/(tabs)/inbox";
import AppText from "@/constants/appTextDefault";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useCallback } from "react";
import { View, FlatList, TouchableOpacity, Dimensions } from "react-native";
import dayjs from "dayjs";
import { router } from "expo-router";
import { usePostStore } from "@/app/(modals)/context/store/postStore";

interface TogetherInsideFlatListProps {
  data: PostTypes[] | undefined;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TogetherInsideFlatList = ({
  data,
  loading,
  setLoading,
}: TogetherInsideFlatListProps) => {
  const { colors, theme } = useTheme();
  const { setPostDetails, postDetails } = usePostStore();

  const renderItem = useCallback(
    ({ item }: { item: PostTypes }) => (
      <View
        style={[
          {
            backgroundColor: colors.containerColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 4, height: 2 },
            shadowOpacity: theme === "dark" ? 0.7 : 0.1,
            shadowRadius: 4,
            borderRadius: 16,
            marginBottom: 16,
            marginHorizontal: 6,
          },
        ]}
      >
        <View
          style={[
            {
              backgroundColor: colors.containerColor,
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
            },
          ]}
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

          <AppText style={{ fontSize: 14, lineHeight: 20, marginVertical: 10 }}>
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
                onPress={() => {
                  handleCommentPress(item);
                }}
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
                <Ionicons
                  name="heart-outline"
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
    ),
    [data, colors],
  );
  const handleCommentPress = (post: PostTypes) => {
    setPostDetails(post);
    router.push({
      pathname: "/listing/together/comment",
      params: {
        post_id: post.block?.post._id,
      },
    });
  };
  const { height } = Dimensions.get("window");
  return (
    <View style={{ backgroundColor: colors.backgroundColor, flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          loading ? null : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.containerColor,
                marginHorizontal: 10,
                padding: 10,
                height: height * 0.6,
                shadowColor: colors.shadowColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
                borderRadius: 12,
                margin: 20,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <FontAwesome5
                  name="comment-alt"
                  size={40}
                  color={colors.themeColorTextPure}
                />
                <AppText
                  style={{
                    fontSize: 24,
                    color: colors.themeColorTextPure,
                    fontWeight: "600",
                  }}
                >
                  No Posts Yet
                </AppText>
              </View>
              <AppText style={{ color: colors.darkGrey, fontSize: 14 }}>
                Be the first to find teammates or
              </AppText>
              <AppText style={{ color: colors.darkGrey, fontSize: 14 }}>
                create a new post!
              </AppText>
            </View>
          )
        }
        ListFooterComponent={
          loading ? (
            <View>
              <OwnActivaterIndicator />
            </View>
          ) : null
        }
      />

      {/* Floating Action */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.themeColorTextPure,
          justifyContent: "center",
          alignItems: "center",
          elevation: 6,
        }}
        onPress={() => {
          router.push({
            pathname: "/listing/together/post_create",
          });
        }}
      >
        <Ionicons name="add" size={26} color={colors.backgroundColor} />
      </TouchableOpacity>
    </View>
  );
};

export default TogetherInsideFlatList;
