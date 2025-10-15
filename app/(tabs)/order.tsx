import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { regular_swr } from "@/hooks/useswr";
import { useAuth } from "../(modals)/context/authContext";
import Colors from "@/constants/Colors";
import { ActivityIndicator } from "react-native-paper";
import { HashedSportData } from "@/utils/sport_hall_hash";
import { SportHallDataType } from "@/interfaces/listing";
import Order_Separator from "../(modals)/book/components/order_separator";
import {
  Booking_Data_Type,
  OrderDataTypes,
  OrderScreenSeparator,
  Return_Type,
} from "@/interfaces/order&book_type";

const OrderScreen = () => {
  const [bookingData, setBookingData] = useState<OrderDataTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [screenSeparator, setScreenSeparator] = useState<OrderScreenSeparator>(
    OrderScreenSeparator.UPCOMING
  );

  const { LoginStatus } = useAuth();
  const [page, setPage] = useState<number>(1);
  const {
    data,
    error,
    isLoading,
  }: { data: Booking_Data_Type; error: any; isLoading: boolean } = regular_swr(
    {
      item: {
        pathname: `/auth/book/${date}?page=${page}&limit=${20}`,
        cacheKey: "booked_order",
        loginStatus: LoginStatus,
      },
    },
    {
      shouldRetryOnError: false,
    }
  );
  useEffect(() => {
    if (
      data?.success &&
      Array.isArray(data.bookingData) &&
      data.bookingData.length > 0
    ) {
      const seen = new Set();
      const unique: Return_Type[] = [];

      for (const item of data.bookingData) {
        if (!seen.has(item._id)) {
          seen.add(item._id);
          const zaal_info = HashedSportData[item.zaal_ID];
          unique.push({
            ...item,
            zaal_info,
          });
        }
      }
      const today = new Date().toISOString().split("T")[0];
      const prepareData = unique.reduce<OrderDataTypes>(
        (acc, value) => {
          if (value.day[0] === today) {
            acc.today.push(value);
          } else if (new Date(value.day[0]) > new Date(today)) {
            acc.upcoming.push(value);
          } else {
            acc.history.push(value);
          }

          return acc;
        },
        {
          upcoming: [],
          today: [],
          history: [],
        }
      );
      setBookingData((prev) => {
        return [...prev, prepareData];
      });
    } else if (error) {
      console.error(error);
    }

    setLoading(isLoading);
  }, [data, error, isLoading]);

  const loadMore = useCallback(() => {
    if (!loading) {
      setPage((prev) => prev + 1);
    }
  }, [loading]);

  return loading ? (
    <View>
      <ActivityIndicator color={Colors.primary} />
    </View>
  ) : (
    <View
      style={{
        backgroundColor: Colors.white,
        height: "100%",
        width: "100%",
      }}
    >
      <View
        style={{
          height: "100%",
          marginHorizontal: 10,
        }}
      >
        <View style={style.separatorContainer}>
          <TouchableOpacity
            onPress={() => setScreenSeparator(OrderScreenSeparator.UPCOMING)}
            style={[
              style.separator,
              {
                backgroundColor:
                  screenSeparator === OrderScreenSeparator.UPCOMING
                    ? Colors.white
                    : Colors.lightGrey,
              },
            ]}
          >
            <Text
              style={{
                color:
                  screenSeparator === OrderScreenSeparator.UPCOMING
                    ? Colors.dark
                    : Colors.darkGrey,
              }}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              style.separator,
              {
                backgroundColor:
                  screenSeparator === OrderScreenSeparator.TODAY
                    ? Colors.white
                    : Colors.lightGrey,
              },
            ]}
            onPress={() => setScreenSeparator(OrderScreenSeparator.TODAY)}
          >
            <Text
              style={{
                color:
                  screenSeparator === OrderScreenSeparator.TODAY
                    ? Colors.dark
                    : Colors.darkGrey,
              }}
            >
              Today
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
            onPress={() => setScreenSeparator(OrderScreenSeparator.HISTORY)}
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
        <View style={{ flex: 1 }}>
          <Order_Separator
            data={bookingData}
            screen_type={screenSeparator}
            loading={loading}
            loadMore={() => loadMore}
          />
        </View>
      </View>
    </View>
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
    width: "33.3%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
});

export default OrderScreen;
