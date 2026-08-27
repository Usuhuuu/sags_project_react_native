import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useBookingStore } from "@/context/store/book_store";
import WeekCalendar from "@/components/book/strip_calendar";
import { useTheme } from "@/context/theme_context";
import { HallTypesSeparator } from "@/types/hall_separator_type";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";

export type FormData = {
  name: string;
  date: string;
  price: {
    oneHour: string;
    wholeDay: string;
  };
  workTime?: string;
  image?: string[];
  location: {
    latitude: string;
    longitude: string;
    smart_location?: string;
  };
  reference_hall_id: string;
};
export type baseTimeSlotType = {
  start_time?: string;
  end_time?: string;
};

type TimeSlotItemProps = {
  timeSlot: {
    start_time?: string;
    end_time?: string;
  };
  unavailableTimes: {
    joinable: string[];
    unavailable: string[];
  };
  selectedTimeSlots: string[];
  onSelect: (timeString: string[]) => void;
  wholeDayBooked: {
    unavailableWholeDay: boolean;
    joinableWholeDay: boolean;
  };
  today: Date;
  slotCount: number;
  height: number;
};

const TimeSlotItem: React.FC<TimeSlotItemProps> = React.memo(
  ({
    timeSlot,
    unavailableTimes,
    selectedTimeSlots,
    onSelect,
    wholeDayBooked,
    today,
    slotCount,
    height,
  }) => {
    const { colors: Colors, theme } = useTheme();
    const now = new Date();
    const timeString = `${timeSlot.start_time}~${timeSlot.end_time}`;
    const isUnavailable = unavailableTimes.unavailable.includes(timeString);
    const isJoinable = unavailableTimes.joinable.includes(timeString);
    const isSelected = selectedTimeSlots.includes(timeString);

    // Combine booking date with timeslot start time
    const [startHour = 0, startMinute = 0] =
      timeSlot?.start_time?.split(":").map(Number) ?? [];
    const slotDate = new Date(today);
    slotDate.setHours(startHour, startMinute, 0, 0);

    // Disable only if this is today and slot time is past
    const isSameDay =
      today.getFullYear() === now.getFullYear() &&
      today.getMonth() === now.getMonth() &&
      today.getDate() === now.getDate();

    const isPast = slotDate <= now && isSameDay;
    const isDisabled =
      wholeDayBooked.unavailableWholeDay || isUnavailable || isPast;
    return (
      <View
        style={[
          styles.timeSlotView,
          { height: height / slotCount, maxHeight: height / slotCount },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            const newSelected = selectedTimeSlots.filter(
              (t) => t !== "WHOLE_DAY",
            );
            if (selectedTimeSlots.includes(timeString)) {
              onSelect(newSelected.filter((t) => t !== timeString));
            } else {
              onSelect([...newSelected, timeString]);
            }
          }}
          style={[
            styles.lalarinSdaBtn,
            {
              borderColor: isSelected
                ? Colors.primary
                : isDisabled
                  ? theme === "dark"
                    ? Colors.littleDark
                    : Colors.littleDarkGrey
                  : isJoinable
                    ? Colors.green
                    : Colors.themeColorTextSecondary,
              shadowColor: isJoinable ? Colors.green : Colors.primary,
              shadowOpacity:
                theme === "dark" && isSelected
                  ? 0.8
                  : isJoinable && theme === "dark"
                    ? 0.3
                    : 0,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              backgroundColor: isJoinable
                ? Colors.lightGreen
                : wholeDayBooked.joinableWholeDay
                  ? Colors.lightGreen
                  : isDisabled
                    ? theme === "light"
                      ? Colors.white
                      : Colors.themeContainerGrey
                    : Colors.containerColor,
              borderWidth: 2,
            },
          ]}
          disabled={isDisabled}
        >
          <Text
            style={{
              color: isJoinable
                ? Colors.darkGrey
                : isDisabled
                  ? Colors.darkGrey
                  : Colors.themeColorTextPure,

              textDecorationLine: isDisabled ? "line-through" : "none",
              textDecorationStyle: "solid",
              textDecorationColor: Colors.darkGrey,
            }}
          >
            {timeString}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedTimeSlots === nextProps.selectedTimeSlots &&
    prevProps.unavailableTimes === nextProps.unavailableTimes &&
    prevProps.wholeDayBooked === nextProps.wholeDayBooked,
);

interface OrderScreenProps {
  formData: FormData;
  baseTimeSlot: baseTimeSlotType[];
  sportHallID: string;
  setIsOrderScreenVisible: React.Dispatch<React.SetStateAction<boolean>>;
  hallType: HallTypesSeparator;
}

const OrderScreen: React.FC<OrderScreenProps> = ({
  formData,
  baseTimeSlot,
  sportHallID,
  setIsOrderScreenVisible,
}) => {
  const { colors: Colors, theme } = useTheme();
  const [today, setToday] = useState<Date>(new Date());
  console.log("TODAY", today);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unavailableTimes, setUnavailableTimes] = useState<{
    joinable: string[];
    unavailable: string[];
  }>({
    joinable: [],
    unavailable: [],
  });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [wholeDayModal, setWholeDayModal] = useState<boolean>(false);
  const [wholeDayBooked, setWholeDayBooked] = useState({
    unavailableWholeDay: false,
    joinableWholeDay: false,
  });
  const CACHE_TTL = 10 * 60 * 1000;
  const [timeslotCache] = useState<{
    [key: string]: {
      joinable: string[];
      unavailable: string[];
      wholeDay: { unavailableWholeDay: boolean; joinableWholeDay: boolean };
      timestampt: number;
    };
  }>({});

  const dateSlotGiver = useCallback(
    async (date: Date) => {
      setSelectedTimeSlots([]);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const key = `${sportHallID}T${date}`;
      if (timeslotCache[key]) {
        const cached = timeslotCache[key];
        const isExpired = Date.now() - cached.timestampt > CACHE_TTL;
        if (!isExpired) {
          setUnavailableTimes({
            joinable: cached.joinable,
            unavailable: cached.unavailable,
          });
          setWholeDayBooked(cached.wholeDay);
          return;
        }
        delete timeslotCache[key];
      }

      setIsLoading(true);

      try {
        setUnavailableTimes({ joinable: [], unavailable: [] });
        setWholeDayModal(false);
        setWholeDayBooked({
          unavailableWholeDay: false,
          joinableWholeDay: false,
        });

        const response = await axiosInstanceRegular.get(
          `/timeslots/${sportHallID}/${formData.reference_hall_id}/${date.toISOString()}/${encodeURIComponent(timezone)}`,
        );

        if (response.status === 200 && response.data.success) {
          const flat = response.data.orderedTime.flat();
          let unavailableWholeDay = false;
          let joinableWholeDay = false;
          let results = { joinable: [], unavailable: [] };

          for (const item of flat) {
            if (item.time_slots.includes("wholeDay")) {
              if (item.num_players === 0) {
                unavailableWholeDay = true;
                joinableWholeDay = false;
                break;
              } else if (item.num_players > 0) {
                joinableWholeDay = true;
              }
            }
          }

          if (unavailableWholeDay || joinableWholeDay) {
            setWholeDayBooked({ unavailableWholeDay, joinableWholeDay });
          } else {
            const now = new Date();
            results = flat.reduce(
              (
                acc: any,
                item: { num_players: number; time_slots: string[] },
              ) => {
                if (item.num_players === 0) {
                  acc.unavailable.push(...item.time_slots);
                } else {
                  acc.joinable.push(...item.time_slots);
                }
                return acc;
              },
              { joinable: [], unavailable: [] },
            );
            setUnavailableTimes(results);
          }

          timeslotCache[key] = {
            joinable: results.joinable,
            unavailable: results.unavailable,
            wholeDay: { unavailableWholeDay, joinableWholeDay },
            timestampt: Date.now(),
          };
        } else {
          timeslotCache[key] = {
            joinable: [],
            unavailable: [],
            wholeDay: { unavailableWholeDay: false, joinableWholeDay: false },
            timestampt: Date.now(),
          };
        }
      } catch (err: any) {
        if (err.response && [400, 409].includes(err.response.status)) {
          console.log("lalr", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sportHallID],
  );

  useEffect(() => {
    if (today) {
      dateSlotGiver(today);
    }
  }, [today]);
  const baseTime_start = baseTimeSlot[0]?.start_time;
  const baseTime_end = baseTimeSlot[baseTimeSlot.length - 1]?.end_time;

  const handleOrder = () => {
    const zaal_id = sportHallID;
    setIsOrderScreenVisible(false);
    const normalizedPrice = {
      oneHour: formData.price.oneHour,
      wholeDay: formData.price.wholeDay,
      regularPc: (formData as any).price?.regularPc ?? "0",
      vipPc: (formData as any).price?.vipPc ?? "0",
      stagePc: (formData as any).price?.stagePc ?? "0",
    };

    useBookingStore.getState().setSportBookingDetails({
      ...formData,
      sportHallID: zaal_id,
      selectedTimeSlots: selectedTimeSlots,
      date: today,
      workTime: formData.workTime,
      baseTime_startAndEnd: `${baseTime_start}~${baseTime_end}`,
      imageUrls: formData.image,
      price: normalizedPrice,
    });
    router.push(`/book/sport/${zaal_id}`);
  };

  const isSelected = selectedTimeSlots.includes("WHOLE_DAY");
  const { height } = Dimensions.get("screen");
  return (
    <View
      style={{
        backgroundColor: Colors.white,
        flex: 1,
      }}
    >
      {isLoading ? (
        <View style={{ flex: 1 }}>
          <OwnActivaterIndicator />
        </View>
      ) : (
        <SafeAreaView
          style={{
            backgroundColor: Colors.containerColor,
            flex: 1,
          }}
          edges={["bottom", "left", "right", "top"]}
        >
          {/* 🔹 HEADER (fixed height) */}
          {!wholeDayModal && (
            <View
              style={{
                justifyContent: "space-between",
                height: height * 0.15,
              }}
            >
              <TouchableOpacity onPress={() => setIsOrderScreenVisible(false)}>
                <Ionicons name="close" size={20} color={Colors.darkGrey} />
              </TouchableOpacity>

              <WeekCalendar
                containerStyle={{
                  flex: 1,
                  paddingBottom: 10,
                }}
                selectedDayTextStyle={{ color: Colors.white }}
                selectedDayNumberStyle={{ color: Colors.white }}
                selectedContainerStyle={{ backgroundColor: Colors.primary }}
                onDateSelect={(date: Date) => {
                  dateSlotGiver(date);
                  setToday(date);
                }}
                selectedDay={today}
                setSelectedDay={setToday}
                textWeekStyle={{
                  color:
                    theme === "dark" ? Colors.themeColorTextPure : Colors.dark,
                }}
                textDayStyle={{
                  color:
                    theme === "dark" ? Colors.themeColorTextPure : Colors.dark,
                }}
                moveIconStyle={{ color: Colors.themeColorTextPure }}
                textMonthStyle={{ color: Colors.themeColorTextPure }}
              />
            </View>
          )}

          {/* 🔹 CONTENT AREA (IMPORTANT) */}
          <View
            style={{
              padding: 10,
              height: height * 0.6,
            }}
          >
            {wholeDayModal ? (
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setWholeDayModal(false)}>
                  <Ionicons name="close" size={20} color={Colors.darkGrey} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  {/*<Calendar
                    sport_hall_id={sportHallID}
                    formData={formData}
                    setIsOrderScreenVisible={setIsOrderScreenVisible}
                  />*/}
                </View>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                }}
              >
                {/* 🔹 WHOLE DAY BUTTON */}
                <View style={{ height: height * 0.1 }}>
                  <TouchableOpacity
                    style={{
                      borderColor: isSelected
                        ? Colors.primary
                        : Colors.themeColorTextSecondary,
                      borderWidth: 2,
                      borderRadius: 5,
                      height: height * 0.07,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      if (
                        unavailableTimes.joinable.length !== 0 ||
                        unavailableTimes.unavailable.length !== 0 ||
                        wholeDayBooked.joinableWholeDay ||
                        wholeDayBooked.unavailableWholeDay
                      ) {
                        Alert.alert(
                          "Today Booking Whole Day is not possible",
                          "Do you want to see possible days?",
                          [
                            { text: "No", style: "cancel" },
                            {
                              text: "Yes",
                              onPress: () => setWholeDayModal(true),
                            },
                          ],
                        );
                      } else {
                        setSelectedTimeSlots(["WHOLE_DAY"]);
                      }
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: Colors.themeColorTextSecondary,
                      }}
                    >
                      Select Whole Day
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: height * 0.5 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    {baseTimeSlot?.map((timeSlot) => (
                      <TimeSlotItem
                        key={`${timeSlot.start_time}~${timeSlot.end_time}`}
                        timeSlot={timeSlot}
                        unavailableTimes={unavailableTimes}
                        selectedTimeSlots={selectedTimeSlots}
                        onSelect={setSelectedTimeSlots}
                        wholeDayBooked={wholeDayBooked}
                        today={today}
                        slotCount={baseTimeSlot.length}
                        height={height - 30}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 🔹 ORDER BUTTON (fixed bottom) */}
          <View
            style={{
              alignItems: "center",
              borderRadius: 5,
              justifyContent: "center",
              flex: 1,
            }}
          >
            {selectedTimeSlots.length !== 0 && (
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  width: "50%",
                  borderRadius: 5,
                  borderColor: Colors.primary,
                  backgroundColor: Colors.secondary,
                  shadowColor: Colors.primary,
                  shadowOpacity: theme === "dark" ? 1.8 : 0,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                  padding: height * 0.02,
                }}
                onPress={handleOrder}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "400",
                    color: Colors.littleDark,
                  }}
                >
                  Order
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  loader: {
    height: "100%",
  },

  timeSlotView: {
    flexDirection: "row",
  },
  lalarinSdaBtn: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 7,
    width: "50%",
    minWidth: "50%",
    marginHorizontal: -2,
    alignItems: "center",
    justifyContent: "center",
  },
  calendars: {
    height: "100%",
    width: "90%",
  },
});
