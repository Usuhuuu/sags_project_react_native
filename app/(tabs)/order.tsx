import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { regular_swr, SWR_regular_cache_key } from "@/hooks/useswr";
import { useAuth } from "../(modals)/context/authContext";
import { HashedSportData } from "@/utils/sport_hall_hash";
import Order_Separator from "../(modals)/book/components/order_separator";
import {
  Booking_Block_Type,
  OrderDataTypes,
  OrderScreenSeparator,
  Return_Type,
} from "@/interfaces/order&book_type";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Filter_Modals from "../(modals)/book/components/filter_modal";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../(modals)/context/themeContext";
import { differenceInMinutes } from "date-fns";

const OrderScreen = () => {
  const { colors: Colors } = useTheme();
  const style = StyleSheet.create({
    separatorContainer: {
      flexDirection: "row",
      backgroundColor: Colors.backgroundColor,
      padding: 2,
      borderRadius: 10,
    },
    separator: {
      padding: 10,
      width: "50%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
    },

    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    picker: {
      alignItems: "center",
    },
    button: {
      backgroundColor: "#eee",
      borderRadius: 8,
      marginVertical: 5,
    },
    buttonText: {
      fontSize: 20,
    },
    value: {
      fontSize: 22,
      fontWeight: "bold",
      marginVertical: 5,
    },
  });
  const [bookingData, setBookingData] = useState<OrderDataTypes>({
    today_upcoming: [],
    history: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [page, setPages] = useState<Record<OrderScreenSeparator, number>>({
    [OrderScreenSeparator.TODAY_UPCOMING]: 1,
    [OrderScreenSeparator.HISTORY]: 1,
  });
  const [hasMore, setHasMore] = useState<Record<OrderScreenSeparator, boolean>>(
    {
      [OrderScreenSeparator.TODAY_UPCOMING]: true,
      [OrderScreenSeparator.HISTORY]: true,
    }
  );
  const [screenSeparator, setScreenSeparator] = useState<OrderScreenSeparator>(
    OrderScreenSeparator.TODAY_UPCOMING
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { LoginStatus } = useAuth();
  const { t } = useTranslation();
  const orderLangInit: any = t("orderScreen", { returnObjects: true });

  const timezone = encodeURIComponent(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (!LoginStatus) {
      setBookingData({
        today_upcoming: [],
        history: [],
      });
      setPages({
        [OrderScreenSeparator.TODAY_UPCOMING]: 1,
        [OrderScreenSeparator.HISTORY]: 1,
      });
      setHasMore({
        [OrderScreenSeparator.TODAY_UPCOMING]: true,
        [OrderScreenSeparator.HISTORY]: true,
      });
      console.log(page, hasMore, bookingData);
    }
  }, [LoginStatus]);
  const dateString = new Date(date).toISOString().split("T")[0];
  const swrKey = LoginStatus
    ? ([
        "booked_order",
        screenSeparator,
        page[screenSeparator],
        dateString,
      ] as const satisfies SWR_regular_cache_key)
    : null;
  const { data, error, isLoading } = regular_swr(
    {
      item: {
        pathname: `/auth/book/${dateString}/${timezone}?page=${page[screenSeparator]}&limit=10&type=${screenSeparator}`,
        cacheKey: swrKey,
        loginStatus: LoginStatus,
      },
    },
    {
      shouldRetryOnError: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshInterval: 10000,
    }
  );

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    } else {
      setLoading(false);
    }
    if (
      data?.success &&
      Array.isArray(data.bookingData) &&
      data.bookingData.length >= 0
    ) {
      const seen = new Set();
      const unique: Return_Type[] = [];

      for (const item of data.bookingData) {
        if (!seen.has(item._id)) {
          seen.add(item._id);
          unique.push({ ...item, zaal_info: HashedSportData[item.zaal_ID] });
        }
      }
      if (unique.length === 0) return;
      const sorted = unique.reduce(
        (acc, booking, index) => {
          const historyBlocks: Booking_Block_Type[] = [];
          const upcomingBlocks: Booking_Block_Type[] = [];

          booking.blocks.forEach((block) => {
            const startTime = new Date(block.start_time);
            const blockTime = new Date();
            const diff = differenceInMinutes(startTime, blockTime);
            if (diff < 15) {
              historyBlocks.push(block);
            } else {
              upcomingBlocks.push(block);
            }
          });
          // If expired blocks exist → push history booking
          if (historyBlocks.length > 0) {
            acc.history.push({
              ...booking,
              blocks: historyBlocks,
            });
          }

          // If future blocks exist → push upcoming booking
          if (upcomingBlocks.length > 0) {
            acc.today_upcoming.push({
              ...booking,
              blocks: upcomingBlocks,
            });
          }

          return acc;
        },
        { today_upcoming: [] as Return_Type[], history: [] as Return_Type[] }
      );
      setBookingData((prev) => ({
        today_upcoming: [...prev.today_upcoming, ...sorted.today_upcoming],
        history: [...prev.history, ...sorted.history],
      }));
      const PAGE_LIMIT = 10;
      if (data.bookingData.length < PAGE_LIMIT) {
        setHasMore((prev) => ({ ...prev, [screenSeparator]: false }));
      }
    }
    if (data?.success && data.noBookingData?.length === 0) {
      setHasMore((prev) => ({
        ...prev,
        [screenSeparator]: false,
      }));
    }
    if (error) {
      const resp = (error as any)?.response;
      if (
        resp?.status === 400 &&
        resp.data?.success === false &&
        resp.data?.message === "NO MORE"
      ) {
        const typeKey = resp.data.type as OrderScreenSeparator;
        setHasMore((prev) => ({ ...prev, [typeKey]: false }));
        return;
      }
    }
  }, [data, error, isLoading]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore[screenSeparator] || !data?.length) return;
    setPages((prev) => ({
      ...prev,
      [screenSeparator]: prev[screenSeparator] + 1,
    }));
  }, [loading]);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 1000,
    }),
  }));

  const handleFade = (fadeDuration = 50, fadeLevel = 0.6) => {
    opacity.value = withTiming(fadeLevel, { duration: fadeDuration }, () => {
      opacity.value = withTiming(1, { duration: fadeDuration });
    });
  };

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ marginRight: 16 }}
        >
          <Ionicons
            name="filter-circle-outline"
            size={28}
            color={Colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, setModalVisible]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: Colors.backgroundColor,
          height: "100%",
          width: "100%",
          paddingTop: 10,
        },
        animatedStyle,
      ]}
    >
      {loading ? null : (
        <View
          style={[
            {
              backgroundColor: Colors.backgroundColor,
              height: "100%",
              width: "100%",
            },
          ]}
        >
          <View
            style={{
              height: "100%",
              marginHorizontal: 10,
            }}
          >
            <View
              style={[
                style.separatorContainer,
                { backgroundColor: Colors.containerColor },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  handleFade();
                  setLoading(true);
                  setScreenSeparator(OrderScreenSeparator.TODAY_UPCOMING);
                }}
                style={[
                  style.separator,
                  {
                    backgroundColor:
                      screenSeparator === OrderScreenSeparator.TODAY_UPCOMING
                        ? Colors.primary
                        : Colors.containerColor,
                  },
                ]}
                disabled={
                  screenSeparator === OrderScreenSeparator.TODAY_UPCOMING
                }
              >
                <Text
                  style={{
                    color:
                      screenSeparator === OrderScreenSeparator.TODAY_UPCOMING
                        ? Colors.white
                        : Colors.darkGrey,
                  }}
                >
                  {orderLangInit.todayUpcoming}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  style.separator,
                  {
                    backgroundColor:
                      screenSeparator === OrderScreenSeparator.HISTORY
                        ? Colors.primary
                        : Colors.containerColor,
                  },
                ]}
                onPress={() => {
                  handleFade();
                  setLoading(true);
                  setScreenSeparator(OrderScreenSeparator.HISTORY);
                }}
                disabled={screenSeparator === OrderScreenSeparator.HISTORY}
              >
                <Text
                  style={{
                    color:
                      screenSeparator === OrderScreenSeparator.HISTORY
                        ? Colors.white
                        : Colors.darkGrey,
                  }}
                >
                  {orderLangInit.history}
                </Text>
              </TouchableOpacity>
            </View>

            <Filter_Modals
              screenSeparator={screenSeparator}
              setScreenSeparator={setScreenSeparator}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              setDate={setDate}
            />

            <View style={{ flex: 1 }}>
              <Order_Separator
                data={bookingData}
                screen_type={screenSeparator}
                loading={loading}
                loadMore={loadMore}
                setLoading={setLoading}
                page={page}
              />
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default OrderScreen;
