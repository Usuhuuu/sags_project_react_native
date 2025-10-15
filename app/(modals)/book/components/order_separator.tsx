import {
  Booking_Data_Type,
  Return_Type,
  OrderScreenSeparator,
  OrderDataTypes,
} from "@/interfaces/order&book_type";
import React, { useCallback } from "react";
import { View, FlatList } from "react-native";
import { OrderItem } from "@/app/(modals)/book/util/order_functions";
import Colors from "@/constants/Colors";

interface Order_Separator_props {
  data: OrderDataTypes[];
  screen_type: OrderScreenSeparator;
}
const Order_Separator = ({ data, screen_type }: Order_Separator_props) => {
  let list: Return_Type[] = [];
  switch (screen_type) {
    case OrderScreenSeparator.UPCOMING:
      list = data[0]?.upcoming as unknown as Return_Type[];
      break;
    case OrderScreenSeparator.TODAY:
      list = data[0]?.today as unknown as Return_Type[];
      break;
    case OrderScreenSeparator.HISTORY:
      list = data[0]?.history as unknown as Return_Type[];
      break;
    default:
      list = [];
      break;
  }

  const renderItem = useCallback(
    ({ item }: { item: Return_Type }) => (
      <View style={{}}>
        <OrderItem item={item} />
      </View>
    ),
    [screen_type]
  );

  return (
    <View style={{ height: "100%" }}>
      <FlatList<Return_Type> data={list} renderItem={renderItem} />
    </View>
  );
};

export default Order_Separator;
