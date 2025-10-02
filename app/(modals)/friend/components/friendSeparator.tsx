import {
  Friend_Status,
  FriendSeparator,
  FriendsType,
} from "@/interfaces/friendType";
import React, { useCallback } from "react";
import { View, FlatList } from "react-native";
import { FriendItem } from "../util/friend_functions";

interface Friend_Separator_props {
  data: Friend_Status;
  screen_type: FriendSeparator;
}
const Friend_Separator = ({ data, screen_type }: Friend_Separator_props) => {
  let list: FriendsType[] = [];

  switch (screen_type) {
    case FriendSeparator.FRIENDS:
      list = data.friends as unknown as FriendsType[];
      break;
    case FriendSeparator.REQUESTS:
      list = data.recieved_requests as unknown as FriendsType[];
      break;
    case FriendSeparator.SENDED:
      list = data.sended_requests as unknown as FriendsType[];
      break;
    default:
      list = [];
  }
  const renderItem = useCallback(
    ({ item }: { item: FriendsType }) => (
      <FriendItem item={item} userStatus={screen_type} />
    ),
    [screen_type]
  );

  return (
    <View style={{ height: "100%" }}>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.unique_user_ID}-${index}`}
      />
    </View>
  );
};

export default Friend_Separator;
