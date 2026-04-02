import {
  SportBookingData,
  useBookingStore,
} from "@/src/context/store/bookStore";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Feather, FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";
import axiosInstance from "@/hooks/axiosInstance";
import { AxiosResponse } from "axios";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { scheduleNotificationForEvent } from "@/utils/calendarReminder";
import { useTheme } from "@/src/context/themeContext";
import Confirm_Modal from "../../../../src/utils/book/sport/support_components/confirmation_modal";
import { addHours, format } from "date-fns";
import Step_One from "../../../../src/utils/book/sport/support_components/step_1";
import Step_Two from "../../../../src/utils/book/sport/support_components/step_2";
import Step_Three from "../../../../src/utils/book/sport/support_components/step_3";
import { useNavigation } from "@react-navigation/native";
import { TabNavTypes } from "@/interfaces/tabScreenType";
import { saveToken } from "../../../../src/utils/book/session";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { bookingNotificationSchedule } from "@/src/context/store/notificationStore";
import { queryClient } from "@/hooks/queryClient";

export type ReservationBlock = {
  start_time: string;
  end_time: string;
  num_players: number;
  current_player: number;
  time_slots: string[];
  wholeDay?: boolean;
};

const groupConnectedTimeSlots = (slots: string[]) => {
  if (slots.includes("WHOLE_DAY")) return [["WHOLE_DAY"]];

  // Sort by start time
  const sorted = [...slots].sort((a, b) => {
    const getMinutes = (time: string) => {
      const [h, m] = time.split("~")[0].split(":").map(Number);
      return h * 60 + m;
    };
    return getMinutes(a) - getMinutes(b);
  });

  const groups: string[][] = [];
  let currentGroup: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    currentGroup.push(current);

    if (next) {
      const [, endOfCurrent] = current.split("~");
      const [startOfNext] = next.split("~");

      if (endOfCurrent !== startOfNext) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else {
      groups.push(currentGroup);
    }
  }
  return groups;
};

const TransactionPage = () => {
  const { colors: Colors } = useTheme();
  const navigation = useNavigation<TabNavTypes>();
  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: Colors.primary,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: Colors.primary,
    stepStrokeUnFinishedColor: "#aaaaaa",
    separatorFinishedColor: Colors.primary,
    separatorUnFinishedColor: "#aaaaaa",
    stepIndicatorFinishedColor: Colors.primary,
    stepIndicatorUnFinishedColor: "#ffffff",
    stepIndicatorCurrentColor: "#ffffff",
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: Colors.primary,
    stepIndicatorLabelFinishedColor: Colors.themeColorTextPure,
    stepIndicatorLabelUnFinishedColor: Colors.darkGrey,
    labelColor: Colors.darkGrey,
    labelSize: 13,
    currentStepLabelColor: Colors.primary,
  };

  const [steps, setSteps] = useState<number>(0);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[][]>([]);
  const [playersNeeded, setPlayersNeeded] = useState<{ [key: number]: number }>(
    {},
  );
  const [wholeDayPeople, setWholeDayPeople] = useState<number>(0);
  const [wholeDay, setWholeDay] = useState<boolean>(false);

  const [waiting, setWaiting] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const hasScheduled = useRef<boolean>(false);
  const [reserved_times, setReserved_times] = useState<
    ReservationBlock[] | undefined
  >(undefined);

  const bookingDetails = useBookingStore(
    (state) => state.sportBookingDetails,
  ) as SportBookingData;

  useEffect(() => {
    bookingDetails?.selectedTimeSlots?.includes("WHOLE_DAY")
      ? setWholeDay(true)
      : setSelectedTimeSlots(() =>
          groupConnectedTimeSlots(bookingDetails?.selectedTimeSlots ?? []),
        );
  }, []);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);

  const paymentPerPeopleArray: number[] = [];
  const totalBookerPaymentArray: number[] = [];

  const handleOrder = async () => {
    try {
      if (isOrdering) return;
      setIsOrdering(true);
      if (!bookingDetails) {
        Notifier.showNotification({
          title: "Booking Failed",
          description: "Missing booking details.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        return;
      }
      const dateOnly = bookingDetails.date;
      const timezone = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      let response: AxiosResponse;

      setWaiting(!waiting);
      let reservationBlocks;
      if (!wholeDay) {
        reservationBlocks = selectedTimeSlots.map((group, index) => {
          const [startTime] = group[0].split("~");
          const [, endTime] = group[group.length - 1].split("~");
          return {
            start_time: startTime,
            end_time: endTime,
            num_players: playersNeeded[index] ?? 0,
            current_player: 0,
            time_slots: group,
          };
        });
        response = await axiosInstance.post(
          `/auth/book/sport`,
          {
            sport_hall_id: bookingDetails.sportHallID,
            date: dateOnly,
            timezone,
            reserved_blocks: reservationBlocks,
          },
          {
            timeout: 10000,
          },
        );
      } else {
        console.log(bookingDetails.workTime);
        response = await axiosInstance.post(
          `/auth/book/sport`,
          {
            sport_hall_id: bookingDetails.sportHallID,
            date: dateOnly,
            timezone,
            reserved_blocks: [
              {
                wholeDay: true,
                workTime: bookingDetails.workTime,
                num_players: wholeDayPeople,
                current_player: 1,
                time_slots: ["wholeDay"],
              },
            ],
          },
          { timeout: 10000 },
        );
      }
      setReserved_times(reservationBlocks);
      if (response.status === 200 && response.data.success) {
        const token = response.data.session;
        saveToken(token);

        if (!hasScheduled.current) {
          await bookingNotificationSchedule({
            title: `Reminder: Payment Needed for ${bookingDetails.name}`,
            body: `This is a reminder that your booking requires payment. Please complete the payment to confirm your booking.`,
            bookingToken: token,
          });
          hasScheduled.current = true;
        }
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
        });
        setWaiting(!waiting);
        setConfirmModal(true);
      } else if (response.status === 400 && !response.data.success) {
        Notifier.showNotification({
          title: "Already Booked",
          description: "Already booked, Book the different time",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
    } catch (err: any) {
      setWaiting(false);
      if (
        !err.response.data.success &&
        [400, 409].includes(err.response.status)
      ) {
        Notifier.showNotification({
          title: "Failed Booked",
          description: err.response.data.message,
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
      if (err.message === "could't find Token") {
        Notifier.showNotification({
          title: "Please Login",
          description: "Please Login to process to book",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
    } finally {
      setIsOrdering(false);
    }
  };

  const confirmationDetails = [
    {
      label: "Booking Court",
      value: bookingDetails?.name,
      icon: (
        <FontAwesome
          name="building"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
    },
    {
      label: "Date",
      value: bookingDetails?.date
        ? format(new Date(bookingDetails.date), "MMMM d, yyyy")
        : undefined,
      icon: (
        <Fontisto name="date" size={24} color={Colors.themeColorTextPure} />
      ),
    },
    {
      label: "Time",
      value: bookingDetails?.baseTime_startAndEnd,
      icon: (
        <Ionicons
          name="time-outline"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
    },
    {
      label: "Player Needed",
      resolve: (item: number) => playersNeeded[item],
      icon: (
        <Ionicons name="people" size={24} color={Colors.themeColorTextPure} />
      ),
    },
  ];

  const addToCalendar = async () => {
    if (wholeDay) {
      if (!reserved_times) return;
      for (const blocks of reserved_times) {
        const endDate = new Date(
          `${bookingDetails?.date}T${blocks.end_time}:00`,
        );
        const startDate = new Date(
          `${bookingDetails?.date}T${blocks.start_time}:00`,
        );
        await scheduleNotificationForEvent({
          endDate: endDate,
          startDate: startDate,
        });
      }
    } else {
      const offsetHour = new Date().getTimezoneOffset() / -60;
      const start = reserved_times?.[0]?.start_time ?? "09:00";
      const end = reserved_times?.[0]?.end_time ?? "24:00";
      const endDate = addHours(
        new Date(`${bookingDetails?.date}T${end}`),
        offsetHour,
      );
      const startDate = addHours(
        new Date(`${bookingDetails?.date}T${start}`),
        offsetHour,
      );
      await scheduleNotificationForEvent({
        endDate: endDate,
        startDate: startDate,
      });
    }
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: Colors.backgroundColor }}>
      {waiting ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.backgroundColor,
            flex: 1,
          }}
        >
          <OwnActivaterIndicator />
        </View>
      ) : (
        <SafeAreaView style={{ backgroundColor: Colors.backgroundColor }}>
          <View style={{ height: "100%" }}>
            {/* Header */}
            <View
              style={{
                height: "10%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "100%",
                marginHorizontal: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons
                  name="arrow-back-sharp"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              {/* Step Indicator */}
              <View
                style={{
                  flex: 1,
                }}
              >
                <StepIndicator
                  customStyles={customStyles}
                  currentPosition={steps}
                  stepCount={3}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("order");
                }}
              >
                <Feather
                  name="more-vertical"
                  size={30}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
            {/* Body */}
            <ScrollView
              style={{
                backgroundColor: Colors.backgroundColor,
                width: "100%",
                height: "90%",
              }}
            >
              {steps === 0 && (
                <Step_One
                  bookingDetails={bookingDetails}
                  wholeDay={wholeDay}
                  selectedTimeSlots={selectedTimeSlots}
                  steps={steps}
                  setSteps={setSteps}
                />
              )}
              {steps === 1 && (
                <Step_Two
                  wholeDay={wholeDay}
                  steps={steps}
                  setSteps={setSteps}
                  bookingDetails={bookingDetails}
                  selectedTimeSlots={selectedTimeSlots}
                  wholeDayPeople={wholeDayPeople}
                  setWholeDayPeople={setWholeDayPeople}
                  playersNeeded={playersNeeded}
                  setPlayersNeeded={setPlayersNeeded}
                />
              )}
              {steps === 2 && (
                <Step_Three
                  bookingDetails={bookingDetails}
                  wholeDay={wholeDay}
                  selectedTimeSlots={selectedTimeSlots}
                  steps={steps}
                  setSteps={setSteps}
                  wholeDayPeople={wholeDayPeople}
                  playersNeeded={playersNeeded}
                  paymentPerPeopleArray={paymentPerPeopleArray}
                  totalBookerPaymentArray={totalBookerPaymentArray}
                  handleOrder={handleOrder}
                />
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
      <Confirm_Modal
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        confirmationDetails={confirmationDetails}
        addToCalendar={addToCalendar}
        hasScheduled={hasScheduled.current}
      />
    </SafeAreaProvider>
  );
};

export default TransactionPage;
