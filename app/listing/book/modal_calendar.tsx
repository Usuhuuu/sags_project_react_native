import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Calendar as CalendarLibrary,
  CalendarProps,
} from "react-native-calendars";
import { InferProps } from "prop-types";
import { ContextProp } from "react-native-calendars/src/types";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { useBookingStore } from "@/app/(modals)/context/store/bookStore";
import { router } from "expo-router";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/app/(modals)/context/themeContext";

type FilterType = "joinable" | "unavailable" | null;

const WHOLE_DAY = "WHOLE_DAY";
const WHOLE_DAY_BACKEND = "wholeDay";

type CalendarDayProps = {
  date: { year: number; month: number; day: number };
  state: string;
  filter: "joinable" | "unavailable" | null;
  onPress?: () => void;
  sport_hall_id: string;
  passDays: {
    joinable: string[];
    unavailable: string[];
  };
  selectedDate: string;
  formData: FormData;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  state,
  filter,
  onPress,
  passDays,
  selectedDate,
}) => {
  const { colors: Colors } = useTheme();

  const today = new Date();
  const currentDate = new Date(date.year, date.month - 1, date.day);
  // Check if current date is before today (disable past)
  const isPast =
    currentDate <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check if current date is today
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate();

  let label = "";
  let labelColor = "#666";
  let bgColor = "white";
  let dayTextColor = "#000"; // default day number color

  const fullDateStr = `${date.year}-${String(date.month).padStart(
    2,
    "0"
  )}-${String(date.day).padStart(2, "0")}`;

  const isSelected = fullDateStr === selectedDate;
  if (isSelected) {
    bgColor = Colors.primary; // or any color you prefer
    dayTextColor = "#fff";
  }

  if (isPast) {
    bgColor = Colors.grey;
    dayTextColor = "#ccc";
  } else {
    if (passDays.joinable.includes(fullDateStr)) {
      label = "Joinable";
      bgColor = Colors.lightGreen;
      labelColor = "#2E7D32";
    }
    if (passDays.unavailable.includes(fullDateStr)) {
      label = "Booked";
      bgColor = Colors.grey;
      labelColor = Colors.darkGrey;
      dayTextColor = Colors.darkGrey;
    }
  }

  if (isToday) {
    dayTextColor = "#d32f2f";
  }

  return (
    <TouchableOpacity
      style={[styles.dayContainer, { backgroundColor: bgColor }]}
      onPress={onPress}
      disabled={isPast || passDays.unavailable.includes(fullDateStr)}
    >
      <Text
        style={[
          styles.dayText,
          { color: dayTextColor },
          state === "disabled" && styles.disabledText,
          isToday && { fontWeight: "bold", textDecorationLine: "underline" },
        ]}
      >
        {date.day}
      </Text>
      {label ? (
        <Text style={[styles.labelText, { color: labelColor }]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

function Calendar(
  props: React.JSX.IntrinsicAttributes &
    Pick<CalendarProps & ContextProp, any> &
    Pick<InferProps<any>, any>
) {
  const { colors: Colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>("joinable");
  const [today, setToday] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isOrdering, setIsOrdering] = useState<boolean>(false);

  const [passDays, setPassDays] = useState<{
    joinable: string[];
    unavailable: string[];
  }>({
    joinable: [],
    unavailable: [],
  });
  const [isitReady, setIsitReady] = useState<boolean>(false);

  useEffect(() => {
    const fetchTimeSlots = async (dateObj: Date) => {
      const [date] = dateObj.toISOString().split("T");
      try {
        const response = await axiosInstanceRegular.get(
          `/timeslots/${props.sport_hall_id}/${date}`
        );
        if (response.status === 200 && response.data.success) {
          const result = response.data.find.reduce(
            (acc: { joinable: string[]; unavailable: string[] }, item: any) => {
              const isJoinable = item.blocks.some(
                (block: { time_slots: string[]; num_players: number }) =>
                  block.num_players > 0 &&
                  block.time_slots.includes(WHOLE_DAY_BACKEND)
              );
              const isUnavailable = item.blocks.every(
                (block: { time_slots: string[]; num_players: number }) =>
                  block.num_players === 0 && block.time_slots.length > 0
              );

              const day = item.day[0];
              if (isJoinable && !isUnavailable) {
                acc.joinable.push(day);
              } else {
                acc.unavailable.push(day);
              }

              return acc;
            },
            { joinable: [], unavailable: [] }
          );
          setPassDays(result);
          setIsitReady(true);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsitReady(true);
      }
    };

    if (today) {
      fetchTimeSlots(today);
    }
  }, [props.sport_hall_id, today]);

  const handleOrder = ({ date }: { date: string }) => {
    if (isOrdering) return;
    setIsOrdering(true);
    if (!props.formData && !date) {
      Notifier.showNotification({
        title: "Select the day",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "info" },
      });
      return;
    }
    props.setIsOrderScreenVisible(false);
    console.log(props.sport_hall_id);
    useBookingStore.getState().setBookingDetails({
      ...props.formData,
      sportHallID: props.sport_hall_id,
      selectedTimeSlots: WHOLE_DAY,
      date: date,
      workTime: props.formData.workTime,
    });
    setIsOrdering(false);
    router.push(`/listing/book/${props.sport_hall_id}`);
  };
  const handleDaySelection = (day: any) => {
    setSelectedDate(day.dateString);
    if (passDays.joinable.includes(day.dateString)) {
      Alert.alert(
        "This day possible to join",
        "Do you want to join",
        [
          {
            text: "No",
            onPress: () => {
              console.log("canceled");
            },
          },
          {
            text: "Yes",
            onPress: () => {
              console.log("confirmed");
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } else {
      Alert.alert(
        "This day possible to booking",
        "Do you want to process booking ?",
        [
          {
            text: "No",
            onPress: () => {
              console.log("canceled");
            },
          },
          {
            text: "Yes",
            onPress: () => {
              handleOrder({ date: day.dateString });
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    }
  };

  return (
    <View>
      {!isitReady ? (
        <View
          style={{
            justifyContent: "center",
            alignSelf: "center",
            width: "100%",
            height: "90%",
          }}
        >
          <ActivityIndicator
            size={"large"}
            color={Colors.primary}
            style={{ justifyContent: "center", alignSelf: "center" }}
          />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.buttonRow,
              {
                borderRadius: 10,
                width: "100%",
              },
            ]}
          >
            <View
              style={{ backgroundColor: Colors.white, margin: 3, width: "50%" }}
            >
              <Button
                title="See Joinable Days"
                onPress={() => setFilter("joinable")}
              />
            </View>
            <View
              style={{ backgroundColor: Colors.white, margin: 3, width: "50%" }}
            >
              <Button
                title="Disable Joinable Days"
                onPress={() => setFilter("unavailable")}
              />
            </View>
          </View>

          <CalendarLibrary
            onMonthChange={(month: any) => {
              console.log("date", month);
              setToday(
                new Date(
                  `${month.year}-${String(month.month).padStart(2, "0")}-01`
                )
              );
            }}
            dayComponent={({
              date,
              state,
            }: {
              date: { year: number; month: number; day: number };
              state: string;
            }) => (
              <CalendarDay
                date={date}
                state={state}
                filter={filter}
                sport_hall_id={props.sport_hall_id}
                passDays={passDays}
                onPress={() => handleDaySelection(date)}
                selectedDate={selectedDate}
                formData={props.formData}
              />
            )}
            {...props}
          />
        </>
      )}
    </View>
  );
}

export default Calendar;

const styles = StyleSheet.create({
  dayContainer: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  disabledText: {
    color: "#ccc",
  },
  labelText: {
    fontSize: 10,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
});
