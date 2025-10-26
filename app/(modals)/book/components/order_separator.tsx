import {
  Return_Type,
  OrderScreenSeparator,
  OrderDataTypes,
} from "@/interfaces/order&book_type";
import React, { useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { OrderItem } from "@/app/(modals)/book/components/order_inside_flatlist";
import Colors from "@/constants/Colors";
import { router } from "expo-router";

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
  const { height, width } = Dimensions.get("screen");

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
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View
            style={{
              height: height - 300,
              backgroundColor: Colors.white,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
              borderRadius: 12,
              margin: 20,
              justifyContent: "space-evenly",
              flexDirection: "column",
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Image
                source={
                  screen_type === OrderScreenSeparator.TODAY_UPCOMING
                    ? require("@/assets/images/court_image.png")
                    : require("@/assets/images/booking_image.png")
                }
                style={{
                  width: 180,
                  height: 180,
                  backgroundColor: Colors.white,
                }}
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 25, fontWeight: 600 }}>
                {screen_type === OrderScreenSeparator.TODAY_UPCOMING
                  ? "No Bookings Yet"
                  : "History is Clear"}
              </Text>
              <Text
                style={{
                  width: "70%",
                  fontSize: 16,
                  color: Colors.darkGrey,
                  lineHeight: 22,
                }}
                numberOfLines={3}
              >
                {screen_type === OrderScreenSeparator.TODAY_UPCOMING
                  ? "Your next game is waiting! Tap below to explore sports halls and book your session."
                  : "This area will store all your completed hall reservations—from last week's soccer match to last year's practice session!"}
              </Text>
            </View>
            <View style={{ alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                style={{
                  padding: 20,
                  width: "80%",
                  alignItems: "center",
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                }}
                onPress={() => {
                  router.push("/(tabs)/");
                  console.log("send to booking");
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 20 }}>
                  {screen_type === OrderScreenSeparator.TODAY_UPCOMING
                    ? "Find a Sport Hall"
                    : "Book a Hall now"}
                </Text>
              </TouchableOpacity>
              {screen_type === OrderScreenSeparator.TODAY_UPCOMING && (
                <Text style={{ color: Colors.darkGrey }}>
                  View Past Bookings in History
                </Text>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default Order_Separator;
