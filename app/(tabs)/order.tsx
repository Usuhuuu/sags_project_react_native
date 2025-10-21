import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { regular_swr } from "@/hooks/useswr";
import { useAuth } from "../(modals)/context/authContext";
import Colors from "@/constants/Colors";
import { ActivityIndicator } from "react-native-paper";
import { HashedSportData } from "@/utils/sport_hall_hash";
import Order_Separator from "../(modals)/book/components/order_separator";
import {
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

const OrderScreen = () => {
  const [bookingData, setBookingData] = useState<OrderDataTypes>({
    today_upcoming: [],
    history: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
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

  const { data, error, isLoading } = regular_swr(
    {
      item: {
        pathname: `/auth/book/${date}?page=${page[screenSeparator]}&limit=10&type=${screenSeparator}`,
        cacheKey: `booked_order_${screenSeparator}_${page[screenSeparator]}_${date}`,
        loginStatus: LoginStatus,
      },
    },
    { shouldRetryOnError: false, revalidateOnMount: true }
  );

  useEffect(() => {
    if (
      data?.success &&
      Array.isArray(data?.bookingData) &&
      data.bookingData?.length > 0
    ) {
      const seen = new Set();
      const unique: Return_Type[] = [];
      for (const item of data.bookingData) {
        if (!seen.has(item._id)) {
          seen.add(item._id);
          const zaal_info = HashedSportData[item.zaal_ID];
          unique.push({ ...item, zaal_info });
        }
      }

      const tempDate = new Date().toISOString().split("T")[0];
      const prepareData = unique.reduce<OrderDataTypes>(
        (acc, value) => {
          if (value.day[0] >= tempDate) acc.today_upcoming.push(value);
          else acc.history.push(value);
          return acc;
        },
        { today_upcoming: [], history: [] }
      );
      setBookingData((prev) => ({
        today_upcoming: [...prev.today_upcoming, ...prepareData.today_upcoming],
        history: [...prev.history, ...prepareData.history],
      }));
    } else if (error) {
      const resp = (error as any)?.response;
      if (
        resp?.status === 400 &&
        resp.data?.success === false &&
        resp.data?.message === "NO MORE"
      ) {
        const typeKey = resp.data.type as OrderScreenSeparator;
        setHasMore((prev) => ({ ...prev, [typeKey]: false }));
      }
    }
  }, [data, error, isLoading]);

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleFade = (fadeDuration = 50, fadeLevel = 0.6) => {
    opacity.value = withTiming(fadeLevel, { duration: fadeDuration }, () => {
      opacity.value = withTiming(1, { duration: fadeDuration });
    });
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore[screenSeparator]) {
      setPages((prev) => ({
        ...prev,
        [screenSeparator]: prev[screenSeparator] + 1,
      }));
    }
  }, [hasMore, screenSeparator]);
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
          backgroundColor: Colors.white,
          height: "100%",
          width: "100%",
          paddingTop: 10,
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={Colors.primary} size={"large"} />
        </View>
      ) : (
        <View
          style={[
            {
              backgroundColor: Colors.white,
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
            <View style={style.separatorContainer}>
              <TouchableOpacity
                onPress={() => {
                  handleFade();
                  setScreenSeparator(OrderScreenSeparator.TODAY_UPCOMING);
                }}
                style={[
                  style.separator,
                  {
                    backgroundColor:
                      screenSeparator === OrderScreenSeparator.TODAY_UPCOMING
                        ? Colors.white
                        : Colors.lightGrey,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      screenSeparator === OrderScreenSeparator.TODAY_UPCOMING
                        ? Colors.dark
                        : Colors.darkGrey,
                  }}
                >
                  Bookings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  style.separator,
                  {
                    backgroundColor:
                      screenSeparator === OrderScreenSeparator.HISTORY
                        ? Colors.white
                        : Colors.lightGrey,
                  },
                ]}
                onPress={() => {
                  handleFade();
                  setScreenSeparator(OrderScreenSeparator.HISTORY);
                }}
              >
                <Text
                  style={{
                    color:
                      screenSeparator === OrderScreenSeparator.HISTORY
                        ? Colors.dark
                        : Colors.darkGrey,
                  }}
                >
                  History
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
    backgroundColor: Colors.lightGrey,
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
