import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/auth_context";
import Order_Separator from "@/components/book/order_separator";
import {
  Booking_Block_Type,
  OrderDataTypes,
  OrderScreenSeparator,
  Return_Type,
} from "@/types/book_type";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/theme_context";
import { differenceInMinutes } from "date-fns";
import { MonthCalendar } from "@/components/book/strip_calendar";
import dayjs from "dayjs";
import {
  RQ_infinite_cache_key,
  useRegularInfiniteQuery,
} from "@/hooks/useQuery";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useHallInfo } from "@/context/hall_info_context";
import { useIsFocused } from "expo-router";

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

const OrderScreen = () => {
  const { colors: Colors, theme } = useTheme();

  const [screenSeparator, setScreenSeparator] = useState<OrderScreenSeparator>(
    OrderScreenSeparator.TODAY_UPCOMING,
  );

  const { LoginStatus } = useAuth();
  const { t } = useTranslation();
  const orderLangInit: any = t("orderScreen", { returnObjects: true });
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [initDate, setInitDate] = useState(dayjs().toDate());
  const [endDateValue, setEndDateValue] = useState<string | null>(null);
  const [active, setActive] = useState("all");

  const { getSpecificHall } = useHallInfo();
  const timezone = encodeURIComponent(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const dateString = dayjs(initDate).toISOString().split("T")[0];
  const endDate = endDateValue
    ? dayjs(endDateValue).format("YYYY-MM-DD")
    : null;

  const normalizedEndDate = endDate ?? "none";

  const swrKey = [
    "booked_order",
    screenSeparator,
    dateString,
    normalizedEndDate,
  ] as const satisfies RQ_infinite_cache_key;
  const endDateParam = endDate ? `&endDate=${endDate}` : "";

  const isFocused = useIsFocused();
  const {
    data,
    error,
    isLoading,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRegularInfiniteQuery(
    {
      cacheKey: swrKey,
      loginStatus: LoginStatus,
      pathname: (page) =>
        `/auth/book/${dateString}/${timezone}?page=${page}&limit=10&type=${screenSeparator}${endDateParam}`,
    },
    {
      enabled: LoginStatus && isFocused,
    },
  );

  const bookingData = useMemo<OrderDataTypes>(() => {
    if (!data?.success || !Array.isArray(data.bookingData)) {
      return {
        today_upcoming: [],
        history: [],
      };
    }

    const seen = new Set<string>();
    const unique: Return_Type[] = [];

    for (const item of data.bookingData) {
      if (seen.has(item._id)) continue;

      seen.add(item._id);

      unique.push({
        ...item,
        zaal_info: getSpecificHall(item.zaal_ID),
      });
    }

    return unique.reduce(
      (acc, booking) => {
        const historyBlocks: Booking_Block_Type[] = [];
        const upcomingBlocks: Booking_Block_Type[] = [];

        booking.blocks.forEach((block) => {
          const startTime = new Date(block.start_time);
          const diff = differenceInMinutes(startTime, new Date());

          if (diff < 15) {
            historyBlocks.push(block);
          } else {
            upcomingBlocks.push(block);
          }
        });

        if (historyBlocks.length) {
          acc.history.push({
            ...booking,
            blocks: historyBlocks,
          });
        }

        if (upcomingBlocks.length) {
          acc.today_upcoming.push({
            ...booking,
            blocks: upcomingBlocks,
          });
        }

        return acc;
      },
      {
        today_upcoming: [] as Return_Type[],
        history: [] as Return_Type[],
      },
    );
  }, [data, getSpecificHall]);

  const loadMore = useCallback(() => {
    if (isFetchingNextPage && !hasNextPage) return;
    fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  const handleFade = (fadeDuration = 50, fadeLevel = 0.6) => {
    opacity.set(
      withSequence(
        withTiming(fadeLevel, { duration: fadeDuration }),
        withTiming(1, { duration: fadeDuration }),
      ),
    );
  };

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
      if (!value || value === active) return;
      setActive(value);
    },
    [active],
  );
  const filteredBookingData = useMemo(() => {
    if (active === "all") return bookingData;
    const result =
      screenSeparator === OrderScreenSeparator.HISTORY
        ? {
            ...bookingData,
            history: bookingData.history.filter((item) =>
              item.blocks.some(
                (block) => block.block_booking_status === active,
              ),
            ),
          }
        : {
            ...bookingData,
            today_upcoming: bookingData.today_upcoming.filter((item) =>
              item.blocks.some(
                (block) => block.block_booking_status === active,
              ),
            ),
          };
    return result;
  }, [active, bookingData, screenSeparator]);

  if (isLoading && isFetchingNextPage) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <OwnActivaterIndicator />
      </View>
    );
  }
  if ((error && !data) || isFetchNextPageError)
    return (
      <View>
        <Text>Something went wrong</Text>
      </View>
    );

  const handleSeparatorChange = (separator: OrderScreenSeparator) => {
    if (separator === screenSeparator) return;
    setScreenSeparator(separator);
  };

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
              {
                backgroundColor: Colors.containerColor,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                handleFade();
                //setLoading(true);
                handleSeparatorChange(OrderScreenSeparator.TODAY_UPCOMING);
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
              disabled={screenSeparator === OrderScreenSeparator.TODAY_UPCOMING}
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
                //setLoading(true);
                handleSeparatorChange(OrderScreenSeparator.HISTORY);
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
                  borderRadius: 10,
                  backgroundColor: Colors.containerColor,
                  shadowColor: Colors.shadowColor,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.25,
                  elevation: 5,
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
                gap: 10,
              }}
            >
              {FILTERS.map((item) => {
                const isActive = active === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => handleFilterPress(item.value)}
                  >
                    <View
                      style={[
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          paddingHorizontal: 10,
                          height: 32,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: Colors.darkGrey,
                          backgroundColor: Colors.containerColor,
                        },
                        isActive && {
                          borderColor: Colors.primary,
                          backgroundColor:
                            theme === "dark"
                              ? Colors.containerColor
                              : "#e0f7fa",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          {
                            fontSize: 12,
                            color: Colors.darkGrey,
                          },
                          isActive && { color: Colors.primary },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={isActive ? Colors.primary : Colors.darkGrey}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {calendarModalVisible && (
            <MonthCalendar
              calendarModalVisible={calendarModalVisible}
              setCalendarModalVisible={setCalendarModalVisible}
              initDate={initDate}
              handleMonthFilter={handleMonthFilter}
            />
          )}

          <View style={{ flex: 1 }}>
            <Order_Separator
              data={filteredBookingData}
              screen_type={screenSeparator}
              loading={isLoading}
              loadMore={loadMore}
            />
          </View>
        </View>
      </View>
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
