import Colors from "@/constants/Colors";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  Alert,
} from "react-native";

import { axiosInstanceRegular } from "../../hooks/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useBookingStore } from "../(modals)/context/store/bookStore";
import Calendar from "./book/modal_calendar";
import WeekCalendar from "@/app/(modals)/book/components/calendar_strip";

export type FormData = {
  sportHallID: string;
  name: string;
  date: string;
  price: {
    oneHour: string;
    wholeDay: string;
  };
  workTime?: string;
};
export type baseTimeSlotType = {
  start_time: string;
  end_time: string;
};

type TimeSlotItemProps = {
  timeSlot: {
    start_time: string;
    end_time: string;
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
};

const TimeSlotItem: React.FC<TimeSlotItemProps> = React.memo(
  ({
    timeSlot,
    unavailableTimes,
    selectedTimeSlots,
    onSelect,
    wholeDayBooked,
  }) => {
    const timeString = `${timeSlot.start_time}~${timeSlot.end_time}`;
    const isUnavailable = unavailableTimes.unavailable.includes(timeString);
    const isJoinable = unavailableTimes.joinable.includes(timeString);
    const isSelected = selectedTimeSlots.includes(timeString);
    const isDisabled = wholeDayBooked.unavailableWholeDay || isUnavailable;

    return (
      <View style={styles.timeSlotView}>
        <TouchableOpacity
          onPress={() => {
            const newSelected = selectedTimeSlots.filter(
              (t) => t !== "WHOLE_DAY"
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
                ? Colors.dark
                : isUnavailable || wholeDayBooked.unavailableWholeDay
                ? Colors.grey
                : Colors.littleDarkGrey,

              backgroundColor: isJoinable
                ? Colors.lightGreen
                : wholeDayBooked.joinableWholeDay
                ? Colors.lightGreen
                : Colors.white,
            },
          ]}
          disabled={isDisabled}
        >
          <Text style={{ color: Colors.darkGrey }}>{timeString}</Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedTimeSlots === nextProps.selectedTimeSlots &&
    prevProps.unavailableTimes === nextProps.unavailableTimes &&
    prevProps.wholeDayBooked === nextProps.wholeDayBooked
);

interface OrderScreenProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  baseTimeSlot: baseTimeSlotType[];
  sportHallID: string;
  setIsOrderScreenVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const OrderScreen: React.FC<OrderScreenProps> = ({
  formData,
  baseTimeSlot,
  sportHallID,
  setIsOrderScreenVisible,
}) => {
  const [today, setToday] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

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
    async (date: string) => {
      setSelectedTimeSlots([]);
      const odor = new Date(date).toISOString().split("T")[0];
      const key = `${sportHallID}T${odor}`;
      if (timeslotCache[key]) {
        const cached = timeslotCache[key];
        const isExpired = Date.now() - cached.timestampt > CACHE_TTL;
        console.log(cached);
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
          `/timeslots/${sportHallID}/${odor}`
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
            results = flat.reduce(
              (
                acc: any,
                item: { num_players: number; time_slots: string[] }
              ) => {
                if (item.num_players === 0) {
                  acc.unavailable.push(...item.time_slots);
                } else {
                  acc.joinable.push(...item.time_slots);
                }
                return acc;
              },
              { joinable: [], unavailable: [] }
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
    [sportHallID]
  );

  useEffect(() => {
    if (today) {
      dateSlotGiver(today);
    }
  }, [today]);
  const baseTime_start = baseTimeSlot[0].start_time;
  const baseTime_end = baseTimeSlot[baseTimeSlot.length - 1].end_time;
  const handleOrder = () => {
    const zaal_id = sportHallID;
    console.log("checking");
    setIsOrderScreenVisible(false);
    useBookingStore.getState().setBookingDetails({
      ...formData,
      sportHallID: zaal_id,
      selectedTimeSlots: selectedTimeSlots,
      date: today,
      workTime: formData.workTime,
      baseTime_startAndEnd: `${baseTime_start}~${baseTime_end}`,
    });
    router.push(`/listing/book/${zaal_id}`);
  };
  return (
    <View style={styles.zahialgaView}>
      {isLoading ? (
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ActivityIndicator size="large" color="blue" style={styles.loader} />
        </View>
      ) : (
        <SafeAreaView
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: Colors.white,
          }}
        >
          {!wholeDayModal && (
            <View
              style={{
                justifyContent: "space-between",
                height: "25%",
              }}
            >
              <TouchableOpacity
                onPress={() => setIsOrderScreenVisible(false)}
                style={{}}
              >
                <Ionicons name="close" size={20} color={Colors.darkGrey} />
              </TouchableOpacity>
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <WeekCalendar
                  containerStyle={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    paddingBottom: 10,
                  }}
                  selectedDayTextStyle={{ color: Colors.white }}
                  selectedDayNumberStyle={{ color: Colors.white }}
                  selectedContainerStyle={{ backgroundColor: Colors.primary }}
                  onDateSelect={(date) => {
                    dateSlotGiver(date);
                    setToday(date);
                  }}
                  selectedDay={today}
                  setSelectedDay={setToday}
                />
              </View>
            </View>
          )}
          {/* Header */}

          <View style={styles.LLR_style}>
            {/* Render available and unavailable time slots */}

            {/* Timeslot */}
            {wholeDayModal ? (
              <>
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <TouchableOpacity onPress={() => setWholeDayModal(false)}>
                    <Ionicons name="close" size={20} color={Colors.darkGrey} />
                  </TouchableOpacity>
                  <Calendar
                    sport_hall_id={sportHallID}
                    formData={formData}
                    setIsOrderScreenVisible={setIsOrderScreenVisible}
                  />
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    paddingVertical: 20,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      borderColor: selectedTimeSlots.includes("WHOLE_DAY")
                        ? Colors.darkGrey
                        : Colors.littleDarkGrey,
                      borderWidth: 1,
                      padding: 15,
                      borderRadius: 5,
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
                            {
                              text: "No",
                              onPress: () => {},
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: () => setWholeDayModal(!wholeDayModal),
                            },
                          ],
                          { cancelable: true }
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
                        color: Colors.littleDark,
                      }}
                    >
                      Select Whole Day
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    flexDirection: "row",
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
                    />
                  ))}
                </View>
              </>
            )}
          </View>
          {/* Order buttn */}
          <View
            style={{
              justifyContent: "center",
              width: "100%",
              alignItems: "center",
            }}
          >
            {selectedTimeSlots.length !== 0 && (
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  borderWidth: 1,
                  padding: 15,
                  width: "50%",
                  borderRadius: 5,
                  borderColor: Colors.primary,
                  backgroundColor: Colors.secondary,
                }}
                onPress={() => handleOrder()}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 400,
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
  zahialgaView: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: Colors.white,
  },
  timeSlotView: {
    flexDirection: "row",
    //backgroundColor: "black",
  },
  lalarinSdaBtn: {
    borderWidth: 1,

    borderRadius: 5,
    marginBottom: 10,
    width: "50%",
    padding: 10,
    minWidth: "50%",
    marginHorizontal: -2,
    alignItems: "center",
  },
  calendars: {
    height: "100%",
    width: "90%",
  },
  LLR_style: {
    flexDirection: "column",
    padding: 10,
  },
});
