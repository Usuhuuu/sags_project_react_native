import {
  Friend_Status,
  FriendSeparator,
  FriendsType,
} from "@/interfaces/friendType";
import React, { useCallback } from "react";
import { View, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FriendItem } from "@/src/utils/friend/util/friend_functions";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Socket } from "socket.io-client";

interface Friend_Separator_props {
  data: Friend_Status;
  screen_type: FriendSeparator;
  loading: boolean;
  fetchMore: () => void;
  onRemove: ({ id, type }: { id: string; type: FriendSeparator }) => void;
  page: Record<FriendSeparator, number>;
  socketRef: React.MutableRefObject<Socket | null>;
}
const Friend_Separator = ({
  data,
  screen_type,
  loading,
  fetchMore,
  onRemove,
  page,
  socketRef,
}: Friend_Separator_props) => {
  let list: FriendsType[] = [];

  const { colors } = useTheme();
  switch (screen_type) {
    case FriendSeparator.FRIENDS:
      list = data?.friends as unknown as FriendsType[];
      break;
    case FriendSeparator.REQUESTS:
      list = data?.recieved_requests as unknown as FriendsType[];
      break;
    case FriendSeparator.SENDED:
      list = data?.sended_requests as unknown as FriendsType[];
      break;
    default:
      list = [];
  }

  const renderItem = useCallback(
    ({ item }: { item: FriendsType }) => (
      <FriendItem
        item={item}
        userStatus={screen_type}
        onRemove={onRemove}
        page={page}
        socketRef={socketRef}
      />
    ),
    [screen_type],
  );
  const { height } = Dimensions.get("window");
  const noDataMap = {
    [FriendSeparator.FRIENDS]: {
      title: "No Friends Yet",
      description: "Start building your game squad",
      icon: (
        <MaterialCommunityIcons
          name="account-heart-outline"
          size={100}
          color={colors.themeColorTextPure}
        />
      ),
    },
    [FriendSeparator.REQUESTS]: {
      title: "No Pending Requests",
      description: "Your gaming circle is waiting to grow",
      icon: (
        <MaterialCommunityIcons
          name="account-group"
          size={100}
          color={colors.themeColorTextPure}
        />
      ),
    },
    [FriendSeparator.SENDED]: {
      title: "No Sent Requests",
      description: "You Haven't sent any invitations lately",
      icon: (
        <FontAwesome name="send" size={100} color={colors.themeColorTextPure} />
      ),
    },
  } as const;

  return (
    <View style={{ height: "100%" }}>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.unique_user_ID}
        ListEmptyComponent={
          loading ? (
            <></>
          ) : (
            <SafeAreaView style={{ height: height * 0.65 }}>
              <View
                style={{
                  margin: 10,
                  padding: 15,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 7,
                  borderRadius: 5,
                  shadowColor: colors.containerColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                  backgroundColor: colors.containerColor,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  {noDataMap[screen_type].icon}
                  <AppText
                    style={{ color: colors.themeColorTextPure, fontSize: 24 }}
                  >
                    {noDataMap[screen_type].title}
                  </AppText>
                  <AppText style={{ color: colors.darkGrey }}>
                    {noDataMap[screen_type].description}
                  </AppText>
                </View>
              </View>
            </SafeAreaView>
          )
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.2}
      />
    </View>
  );
};

export default Friend_Separator;
