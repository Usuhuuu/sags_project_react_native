import {
  Return_Type,
  OrderScreenSeparator,
  OrderDataTypes,
} from "@/interfaces/order&book_type";
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import OwnActivaterIndicator from "@/constants/loaderAnimation";

export type Booking_Time_Validation_payload = {
  time_slots: string;
  date: Date;
  token: string;
  sport_hall_id: string;
  expireAt: string | Date;
  createdAt: string | Date;
  type: "sport" | "esport";
  startTime?: Date | string;
  timePackage?: number;
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
}: Order_Separator_props) => {
  const { colors: Colors } = useTheme();
  const [orderList, setOrderList] = useState<Return_Type[]>();
  const [uniqueList, setUniqueList] = useState<Return_Type[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const sessionCacheRef = useRef<{
    tokens: string[];
    lastIndex: number | null;
  }>({
    tokens: [],
    lastIndex: null,
  });
  const { height } = Dimensions.get("screen");
  const { height: windowHeight } = Dimensions.get("window");

  useEffect(() => {
    setUniqueList([]);
    if (screen_type === OrderScreenSeparator.TODAY_UPCOMING) {
      setOrderList(data?.today_upcoming);
    } else if (screen_type === OrderScreenSeparator.HISTORY) {
      setOrderList(data?.history);
    }
  }, [screen_type, data]);

  const loadValidSessions = async (): Promise<string[]> => {
    try {
      const indexStr = await SecureStorage.getItemAsync("paymentSessionIndex");
      const index = indexStr ? parseInt(indexStr, 10) : 0;
      if (
        sessionCacheRef.current.lastIndex === index &&
        sessionCacheRef.current.tokens.length
      ) {
        return sessionCacheRef.current.tokens;
      }

      const now = Date.now();
      const valid: string[] = [];
      for (let i = 1; i <= index; i++) {
        const dataStr = await SecureStorage.getItemAsync(`paymentSession_${i}`);
        if (!dataStr) continue;
        const { token, expireAt } = JSON.parse(dataStr);
        if (expireAt > now) valid.push(token);
        else {
          await SecureStorage.deleteItemAsync(`paymentSession_${i}`);
        }
      }
      sessionCacheRef.current = { tokens: valid, lastIndex: index };
      return valid;
    } catch (err) {
      console.warn("session load failed", err);
      return [];
    }
  };
  const getUniqueListWithSessions = async (
    orderList: Return_Type[]
  ): Promise<Return_Type[]> => {
    if (!orderList || orderList.length === 0) return [];
    let updatedList = [...orderList];
    try {
      const validSessions = await loadValidSessions();
      validSessions.forEach((session) => {
        try {
          const decoded = atob(session);
          const parsed = JSON.parse(decoded) as Booking_Time_Validation_payload;
          updatedList = updatedList.map((hall) => {
            let parsed_start_time = "",
              parsed_end_time = "";
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (parsed.type === "esport" && parsed.startTime !== undefined) {
              [parsed_start_time] = new Date(parsed.startTime)
                .toLocaleTimeString("en-US", {
                  timeZone: tz,
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .split(" - ");
              [parsed_end_time] = new Date(
                new Date(parsed.startTime).getTime() +
                  (parsed.timePackage ?? 0) * 60000
              )
                .toLocaleTimeString("en-US", {
                  timeZone: tz,
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .split(" - ");
            } else if (parsed.type === "sport") {
              [parsed_start_time, parsed_end_time] =
                parsed.time_slots.split("~");
            }
            console.log("endTime work needed");

            console.log(parsed_start_time, parsed_end_time);

            const sameSportHall =
              hall.zaal_ID.toString() === parsed.sport_hall_id.toString();
            const sameDay =
              new Date(hall.day).getTime() === new Date(parsed.date).getTime();

            let sameTimeSlots =
              parsed.type === "esport"
                ? true
                : hall.blocks.some(
                    (block) =>
                      new Date(block.start_time).getTime() ===
                        new Date(parsed_start_time).getTime() &&
                      new Date(block.end_time).getTime() ===
                        new Date(parsed_end_time).getTime()
                  );

            if (sameSportHall && sameDay && sameTimeSlots) {
              return {
                ...hall,
                session_obj: {
                  time_slots: parsed.time_slots,
                  date: parsed.date,
                  token: parsed.token,
                  sport_hall_id: parsed.sport_hall_id,
                  expireAt: parsed.expireAt,
                  createdAt: parsed.createdAt,
                  type: parsed.type,
                },
              };
            }
            return hall;
          });
        } catch (err) {
          console.log("Error on validation session", err);
        }
      });
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
        setListLoading(true);
        if (!orderList || orderList.length === 0) {
          setUniqueList([]);
          setListLoading(false);
          return;
        }
        const list = await getUniqueListWithSessions(orderList);
        if (isActive) {
          setUniqueList(list);
          setListLoading(false);
        }
      };
      load();
      return () => {
        isActive = false;
      };
    }, [orderList])
  );
  const renderItem = useCallback(
    ({ item }: { item: Return_Type }) => <OrderItem item={item} />,
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.backgroundColor,
          }}
        >
          <OwnActivaterIndicator />
        </View>
      ) : (
        <FlatList<Return_Type>
          data={uniqueList}
          keyExtractor={(item) => item._id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          initialNumToRender={5}
          windowSize={5}
          removeClippedSubviews={false}
          style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
          renderItem={renderItem}
          ListEmptyComponent={
            listLoading ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: windowHeight - 250,
                  backgroundColor: Colors.backgroundColor,
                }}
              >
                <OwnActivaterIndicator />
              </View>
            ) : (
              <View
                style={{
                  height: height - 300,
                  backgroundColor: Colors.containerColor,
                  shadowColor: Colors.shadowColor,
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
          ListFooterComponent={
            listLoading ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: windowHeight - 250,
                  backgroundColor: Colors.backgroundColor,
                }}
              >
                <OwnActivaterIndicator />
              </View>
            ) : (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: Colors.littleDarkGrey }}>
                  No more booking data
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default Order_Separator;
