import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../(modals)/context/themeContext";
import { differenceInMinutes, set } from "date-fns";
import { MonthCalendar } from "../(modals)/book/components/calendar_strip";
import dayjs from "dayjs";

const OrderScreen = () => {
  const { colors: Colors } = useTheme();
  const [bookingData, setBookingData] = useState<OrderDataTypes>({
    today_upcoming: [],
    history: [],
  });
  const [filteredBookingData, setFilteredBookingData] =
    useState<OrderDataTypes>(bookingData);
  const [loading, setLoading] = useState<boolean>(true);
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

  const { LoginStatus } = useAuth();
  const { t } = useTranslation();
  const orderLangInit: any = t("orderScreen", { returnObjects: true });
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [initDate, setInitDate] = useState(dayjs().toDate());
  const [endDateValue, setEndDateValue] = useState<string | null>(null);
  const [renderExtraData, setRenderExtraData] = useState<boolean>(false);

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
  const dateString = dayjs(initDate).toISOString().split("T")[0];
  const endDate = endDateValue
    ? dayjs(endDateValue).format("YYYY-MM-DD")
    : null;

  const normalizedEndDate = endDate ?? "none";
  const swrKey = LoginStatus
    ? ([
        "booked_order",
        screenSeparator,
        page[screenSeparator],
        dateString,
        normalizedEndDate,
      ] as const satisfies SWR_regular_cache_key)
    : null;
  const endDateParam = endDate ? `&endDate=${endDate}` : "";
  const { data, error, isLoading } = regular_swr(
    {
      item: {
        pathname: `/auth/book/${dateString}/${timezone}?page=${page[screenSeparator]}&limit=10&type=${screenSeparator}${endDateParam}`,
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

  const FILTERS = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Waiting To Play",
      value: "waiting",
    },
    {
      label: "Confirmed Payments",
      value: "confirmed",
    },
    {
      label: "Pending Payments",
      value: "pending",
    },
    {
      label: "Cancelled",
      value: "cancelled",
    },
  ];
  const [active, setActive] = useState("all");

  const handleMonthFilter = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {
    setEndDateValue(endDate ? dayjs(endDate).toISOString() : null);
    setInitDate(startDate);
  };

  const handleFilterPress = useCallback(
    (value: string) => {
      if (value === active || !value) return;
      else if (value === "all") setFilteredBookingData(bookingData);
      setActive(value);
      const temp = bookingData.today_upcoming.filter((item) =>
        item.blocks.some((block) => block.block_booking_status === value)
      );

      setFilteredBookingData((prev) => ({
        ...prev,
        today_upcoming: temp,
      }));
      setRenderExtraData((prev) => !prev);
    },
    [active, bookingData]
  );

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
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 12,
                backgroundColor: Colors.backgroundColor,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    letterSpacing: 1,
                    color: "#6B7280",
                    fontWeight: "600",
                  }}
                >
                  QUICK FILTER
                </Text>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 18,
                    backgroundColor: "#0B1220",
                  }}
                  onPress={() => {
                    setCalendarModalVisible(true);
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#4DA3FF"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4DA3FF",
                      fontWeight: "500",
                    }}
                  >
                    {initDate
                      ? dayjs(initDate).format("MMM DD, YYYY")
                      : "Select Date"}
                    {endDateValue !== null
                      ? ` - ${dayjs(endDateValue).format("MMM DD, YYYY")}`
                      : ""}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                }}
              >
                {FILTERS.map((item) => {
                  const isActive = active === item.value;

                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => handleFilterPress(item.value)}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 8,
                        borderRadius: 22,
                        backgroundColor: isActive ? "#0B1220" : "#1F2933",
                        borderWidth: isActive ? 1 : 0,
                        borderColor: isActive ? "#4DA3FF" : "transparent",
                        marginRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: isActive ? "#4DA3FF" : "#9CA3AF",
                          fontWeight: isActive ? "600" : "500",
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <MonthCalendar
              calendarModalVisible={calendarModalVisible}
              setCalendarModalVisible={setCalendarModalVisible}
              initDate={initDate}
              handleMonthFilter={handleMonthFilter}
            />

            <View style={{ flex: 1 }}>
              <Order_Separator
                data={filteredBookingData}
                screen_type={screenSeparator}
                loading={loading}
                loadMore={loadMore}
                page={page}
              />
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};
const style = StyleSheet.create({
  separatorContainer: {
    flexDirection: "row",
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

export default OrderScreen;
