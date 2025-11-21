import {
  Return_Type,
  OrderScreenSeparator,
  OrderDataTypes,
} from "@/interfaces/order&book_type";
import React, { SetStateAction, useCallback, useEffect, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "../../context/themeContext";
import * as SecureStorage from "expo-secure-store";
import { differenceInMinutes } from "date-fns";

export type Booking_Time_Validation_payload = {
  time_slots: string;
  date: string;
  token: string;
  sport_hall_id: string;
  expireAt: string | Date;
  createdAt: string | Date;
};
interface Order_Separator_props {
  data: OrderDataTypes;
  screen_type: OrderScreenSeparator;
  loadMore: () => void;
  loading: boolean;
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  page: Record<OrderScreenSeparator, number>;
}
const Order_Separator = ({
  data,
  screen_type,
  loadMore,
  loading,
  setLoading,
  page,
}: Order_Separator_props) => {
  const { colors: Colors } = useTheme();
  const [orderList, setOrderList] = useState<Return_Type[]>();
  const [uniqueList, setUniqueList] = useState<Return_Type[]>([]);

  useEffect(() => {
    setLoading(true);
    setUniqueList([]);
    if (screen_type === OrderScreenSeparator.TODAY_UPCOMING) {
      setOrderList(data?.today_upcoming);
      setLoading(false);
    } else if (screen_type === OrderScreenSeparator.HISTORY) {
      setOrderList(data?.history);
      setLoading(false);
    }
  }, [screen_type, data]);

  const [loadingEffect, setLoadingEffect] = useState<boolean>(false);

  const getUniqueListWithSessions = async (
    orderList: Return_Type[]
  ): Promise<Return_Type[]> => {
    if (!orderList || orderList.length === 0) return [];

    let updatedList = [...orderList];

    try {
      const sessionStr = await SecureStorage.getItemAsync("paymentSession");
      if (sessionStr) {
        const tokens: string[] = JSON.parse(sessionStr);
        if (tokens?.length > 0) {
          // Filter valid tokens
          const validTokens = tokens.filter((t) => {
            try {
              const decoded = atob(t);
              const parsed = JSON.parse(decoded);
              return (
                differenceInMinutes(new Date(parsed?.expireAt), new Date()) > 0
              );
            } catch {
              return false;
            }
          });

          // Apply sessions
          validTokens.forEach((session) => {
            try {
              const decoded = atob(session);
              const parsed = JSON.parse(
                decoded
              ) as Booking_Time_Validation_payload;

              updatedList = updatedList.map((hall) => {
                if (
                  hall.zaal_ID.toString() === parsed.sport_hall_id &&
                  hall.day[0] === parsed.date &&
                  Array.isArray(hall.blocks) &&
                  hall.blocks
                    .flat(Infinity)
                    .some(
                      (block) =>
                        `${block.start_time}~${block.end_time}` ===
                        parsed.time_slots
                    )
                ) {
                  return {
                    ...hall,
                    session_obj: {
                      time_slots: parsed.time_slots,
                      date: parsed.date,
                      token: parsed.token,
                      sport_hall_id: parsed.sport_hall_id,
                      expireAt: parsed.expireAt,
                      createdAt: parsed.createdAt,
                    },
                  };
                }
                return hall;
              });
            } catch (err) {
              console.log(err);
            }
          });

          await SecureStorage.setItemAsync(
            "paymentSession",
            JSON.stringify(validTokens)
          );
        }
      }
    } catch (err) {
      console.warn("Failed to parse paymentSession:", err);
    }

    const seen = new Set<string>();
    const filtered = updatedList.filter((hall) => {
      if (seen.has(hall._id)) return false;
      seen.add(hall._id);
      return true;
    });

    // Sort by day
    return filtered.sort((a, b) => {
      const dayA = new Date(Array.isArray(a.day) ? a.day[0] : a.day).getTime();
      const dayB = new Date(Array.isArray(b.day) ? b.day[0] : b.day).getTime();
      return dayA - dayB;
    });
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        if (!orderList || orderList.length === 0) {
          setUniqueList([]); // clear if empty
          setLoading(false);
          return;
        }

        const list = await getUniqueListWithSessions(orderList);
        if (isActive) {
          setUniqueList(list);
          setLoading(false);
        }
      };

      load();

      return () => {
        isActive = false; // cancel update if screen unmounted
      };
    }, [orderList])
  );

  const { height } = Dimensions.get("screen");
  const { height: windowHeight } = Dimensions.get("window");

  useEffect(() => {
    if (loading) setLoadingEffect(!loadingEffect);
  }, [loading]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      <FlatList<Return_Type>
        data={uniqueList}
        renderItem={useCallback(
          ({ item }: { item: Return_Type }) => {
            return (
              <View>
                <OrderItem item={[item]} />
              </View>
            );
          },
          [screen_type]
        )}
        keyExtractor={(item) => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: windowHeight - 250,
                backgroundColor: Colors.backgroundColor,
              }}
            >
              <ActivityIndicator color={Colors.primary} size={"large"} />
            </View>
          ) : (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: Colors.littleDarkGrey }}>
                No more booking data
              </Text>
            </View>
          )
        }
        initialNumToRender={5}
        windowSize={5}
        removeClippedSubviews
        style={{ flex: 1 }}
        ListEmptyComponent={
          loading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: windowHeight - 250,
                backgroundColor: Colors.backgroundColor,
              }}
            >
              <ActivityIndicator size={"large"} color={Colors.primary} />
            </View>
          ) : (
            <View
              style={{
                height: height - 300,
                backgroundColor: Colors.containerColor,
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
                    backgroundColor: Colors.containerColor,
                  }}
                  tintColor={Colors.themeColorTextPure}
                />
              </View>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: 600,
                    color: Colors.themeColorTextPure,
                  }}
                >
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
          )
        }
      />
    </View>
  );
};

export default Order_Separator;
