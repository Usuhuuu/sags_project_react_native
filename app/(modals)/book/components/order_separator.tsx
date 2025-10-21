import {
  Return_Type,
  OrderScreenSeparator,
  OrderDataTypes,
} from "@/interfaces/order&book_type";
import React, { useCallback, useMemo } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { OrderItem } from "@/app/(modals)/book/components/order_inside_flatlist";
import Colors from "@/constants/Colors";

interface Order_Separator_props {
  data: OrderDataTypes;
  screen_type: OrderScreenSeparator;
  loadMore: () => void;
  loading: boolean;
}
const Order_Separator = ({
  data,
  screen_type,
  loadMore,
  loading,
}: Order_Separator_props) => {
  const list: Return_Type[] =
    screen_type === OrderScreenSeparator.TODAY_UPCOMING
      ? data?.today_upcoming || []
      : screen_type === OrderScreenSeparator.HISTORY
      ? data?.history || []
      : [];

  const uniqueList = useMemo(() => {
    const seen = new Set();
    const filtered = list.filter((item) => {
      if (seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
    return filtered.sort((a, b) => {
      const dayA = new Date(Array.isArray(a.day) ? a.day[0] : a.day).getDate();
      const dayB = new Date(Array.isArray(b.day) ? b.day[0] : b.day).getDate();
      return dayB - dayA; // descending order
    });
  }, [list]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList<Return_Type>
        data={uniqueList}
        renderItem={useCallback(
          ({ item }: { item: Return_Type }) => {
            return (
              <View>
                <OrderItem item={item} />
              </View>
            );
          },
          [screen_type]
        )}
        keyExtractor={(item) => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator color={Colors.primary} /> : null
        }
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews
      />
    </View>
  );
};

export default Order_Separator;
