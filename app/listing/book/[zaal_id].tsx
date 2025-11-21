import { useBookingStore } from "@/app/(modals)/context/store/bookStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  Feather,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";
import { format } from "date-fns";
import axiosInstance from "@/hooks/axiosInstance";
import { AxiosResponse } from "axios";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { scheduleNotificationForEvent } from "@/utils/calendarReminder";
import { mutate } from "swr";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import Confirm_Modal from "./support_components/confirmation_modal";
import { addHours } from "date-fns";
import * as SecureStorage from "expo-secure-store";

export type ReservationBlock = {
  start_time: string;
  end_time: string;
  num_players: number;
  current_player: number;
  time_slots: string[];
  wholeDay?: boolean;
};

const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 35,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#4c9aff",
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: "#4c9aff",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#4c9aff",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#4c9aff",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "#ffffff",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#4c9aff",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 13,
  currentStepLabelColor: "#4c9aff",
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
  const styles = StyleSheet.create({
    innerContainer: {
      backgroundColor: Colors.backgroundColor,
      flex: 1,
      alignItems: "center",
      gap: 20,
    },
    buttons: {
      width: "45%",
      alignItems: "center",
      padding: 10,
      borderWidth: 1,
      gap: 10,
      borderColor: Colors.darkGrey,
      borderRadius: 5,
    },
  });
  const [steps, setSteps] = useState<number>(0);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[][]>([]);
  const [playersNeeded, setPlayersNeeded] = useState<{ [key: number]: number }>(
    {}
  );
  const [wholeDayPeople, setWholeDayPeople] = useState<number>(0);
  const [wholeDay, setWholeDay] = useState<boolean>(false);

  const [waiting, setWaiting] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [reserved_times, setReserved_times] = useState<
    ReservationBlock[] | undefined
  >(undefined);

  const bookingDetails = useBookingStore((state) => state.bookingDetails);
  useEffect(() => {
    bookingDetails?.selectedTimeSlots.includes("WHOLE_DAY")
      ? setWholeDay(true)
      : setSelectedTimeSlots(() =>
          groupConnectedTimeSlots(bookingDetails?.selectedTimeSlots ?? [])
        );
  }, []);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);

  const paymentPerPeopleArray: number[] = [];
  const totalBookerPaymentArray: number[] = [];

  const saveToken = async (token: string) => {
    try {
      const existing = await SecureStorage.getItemAsync("paymentSession");
      let tokens: string[] = [];
      if (existing && existing.trim().startsWith("[")) {
        tokens = JSON.parse(existing);
      }
      tokens.push(token);
      await SecureStorage.setItemAsync(
        "paymentSession",
        JSON.stringify(tokens)
      );
    } catch (e) {
      console.error("SecureStore error:", e);
    }
  };
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
          "/auth/book",
          {
            sport_hall_id: bookingDetails.sportHallID,
            date: dateOnly,
            reserved_blocks: reservationBlocks,
          },
          {
            timeout: 10000,
          }
        );
      } else {
        response = await axiosInstance.post(
          "/auth/book",
          {
            sport_hall_id: bookingDetails.sportHallID,
            date: dateOnly,
            reserved_blocks: [
              {
                wholeDay: true,
                num_players: wholeDayPeople,
                current_player: 1,
                time_slots: ["wholeDay"],
              },
            ],
          },
          { timeout: 10000 }
        );
      }
      setReserved_times(reservationBlocks);
      if (response.status === 200 && response.data.success) {
        const token = response.data.session;
        saveToken(token);

        Notifier.showNotification({
          title: "Successfully Booked",
          description: "Check Booking from Order Section",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
        mutate(
          `booked_order_TODAY_UPCOMING_1_${bookingDetails.date}`,
          undefined,
          { revalidate: true, throwOnError: true }
        );
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
      value: bookingDetails?.date,
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
          `${bookingDetails?.date}T${blocks.end_time}:00`
        );
        const startDate = new Date(
          `${bookingDetails?.date}T${blocks.start_time}:00`
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
        offsetHour
      );
      const startDate = addHours(
        new Date(`${bookingDetails?.date}T${start}`),
        offsetHour
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
          <ActivityIndicator size={"large"} color={Colors.primary} />
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
              <TouchableOpacity onPress={() => {}}>
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
                <View style={styles.innerContainer}>
                  <AppText
                    style={{
                      fontSize: 24,
                      fontWeight: 400,
                      textAlign: "left",
                      color: Colors.themeColorTextPure,
                    }}
                  >
                    {bookingDetails?.name}
                  </AppText>
                  {/* check section */}
                  <View
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      width: "70%",
                      borderColor: Colors.themeColorTextPure,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.themeColorTextPure,
                      }}
                    >
                      <AppText
                        style={{
                          fontSize: 18,
                          fontWeight: 300,
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        Date
                      </AppText>
                      <AppText
                        style={{
                          fontSize: 18,
                          fontWeight: 300,
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        {bookingDetails?.date
                          ? format(
                              new Date(bookingDetails.date),
                              "MMMM d, yyyy"
                            )
                          : ""}
                      </AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: "column",
                      }}
                    >
                      {wholeDay ? (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            padding: 20,
                          }}
                        >
                          <AppText
                            style={{
                              fontSize: 18,
                              fontWeight: 300,
                              color: Colors.themeColorTextPure,
                            }}
                          >
                            Time
                          </AppText>
                          <AppText
                            style={{
                              fontSize: 18,
                              fontWeight: 300,
                              color: Colors.themeColorTextPure,
                            }}
                          >
                            {bookingDetails?.workTime}
                          </AppText>
                        </View>
                      ) : (
                        <>
                          {selectedTimeSlots.map((group, index) => {
                            const startTime = group[0].split("~")[0];
                            const endTime =
                              group[group.length - 1].split("~")[1];
                            const isLast =
                              index === selectedTimeSlots.length - 1;
                            return (
                              <View
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  padding: 20,
                                  borderBottomWidth: isLast ? 0 : 1,
                                  borderColor: Colors.themeColorTextPure,
                                }}
                              >
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 300,
                                    color: Colors.themeColorTextPure,
                                  }}
                                >
                                  Time {index + 1}
                                </AppText>
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 300,
                                    color: Colors.themeColorTextPure,
                                  }}
                                >
                                  {startTime} – {endTime}
                                </AppText>
                              </View>
                            );
                          })}
                        </>
                      )}
                    </View>
                  </View>
                  {/* price section */}
                  <View
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      width: "70%",
                      borderColor: Colors.themeColorTextPure,
                    }}
                  >
                    {!wholeDay && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: 20,
                          borderBottomWidth: 1,
                          alignItems: "center",
                          borderBottomColor: Colors.themeColorTextPure,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 5,
                            alignItems: "center",
                          }}
                        >
                          <MaterialCommunityIcons
                            name="clock-time-nine-outline"
                            size={24}
                            color={Colors.themeColorTextPure}
                          />
                          <AppText
                            style={{
                              fontSize: 18,
                              fontWeight: 300,
                              color: Colors.themeColorTextPure,
                            }}
                          >
                            1 Hour
                          </AppText>
                        </View>
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: Colors.themeColorTextPure,
                          }}
                        >
                          ₮{bookingDetails?.price.oneHour}
                        </AppText>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 20,
                      }}
                    >
                      <AppText style={{ color: Colors.themeColorTextPure }}>
                        TOTAL
                      </AppText>
                      <AppText style={{ color: Colors.themeColorTextPure }}>
                        ₮
                        {wholeDay
                          ? bookingDetails?.price?.wholeDay
                          : (bookingDetails?.selectedTimeSlots.length ?? 0) *
                            Number(bookingDetails?.price.oneHour)}
                      </AppText>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "90%",
                      justifyContent: "center",
                      gap: 20,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => setSteps(steps + 1)}
                    >
                      <AppText style={{ color: Colors.white }}>Next</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {steps === 1 && (
                <View style={[styles.innerContainer, {}]}>
                  <View
                    style={{
                      width: "90%",
                      gap: 10,
                    }}
                  >
                    {wholeDay ? (
                      <View
                        style={{
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: 10,
                          gap: 5,
                          borderWidth: 1,
                          borderColor: Colors.littleDark,
                          borderRadius: 5,
                        }}
                      >
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: Colors.themeColorTextPure,
                          }}
                        >
                          {bookingDetails?.workTime}
                        </AppText>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderWidth: 1,
                            padding: 5,
                            borderColor: Colors.littleDark,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <MaterialIcons
                              name="people-alt"
                              size={24}
                              color={Colors.themeColorTextPure}
                            />
                            <AppText
                              style={{ color: Colors.themeColorTextPure }}
                            >
                              Peoples Needed
                            </AppText>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                if (wholeDayPeople < 20) {
                                  setWholeDayPeople(wholeDayPeople + 1);
                                } else {
                                  Notifier.showNotification({
                                    title: "Oops",
                                    description:
                                      "Needed people must be belov 20",
                                    Component: NotifierComponents.Alert,
                                    componentProps: { alertType: "warn" },
                                  });
                                }
                              }}
                            >
                              <AntDesign
                                name="plus"
                                size={20}
                                color={Colors.themeColorTextPure}
                              />
                            </TouchableOpacity>
                            <AppText style={{ fontSize: 20 }}>
                              {wholeDayPeople}
                            </AppText>
                            <TouchableOpacity
                              onPress={() => {
                                if (wholeDayPeople > 0)
                                  setWholeDayPeople(wholeDayPeople - 1);
                              }}
                            >
                              <AntDesign
                                name="minus"
                                size={20}
                                color={Colors.themeColorTextPure}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <>
                        {selectedTimeSlots.map((group, index) => {
                          const startTime = group[0].split("~")[0];
                          const endTime = group[group.length - 1].split("~")[1];
                          return (
                            <View
                              key={index}
                              style={{
                                flexDirection: "column",
                                justifyContent: "space-between",
                                padding: 10,
                                gap: 5,
                                borderWidth: 1,
                                borderColor: Colors.littleDark,
                                borderRadius: 5,
                              }}
                            >
                              <AppText
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                  color: Colors.themeColorTextPure,
                                }}
                              >
                                Session {index + 1}
                              </AppText>
                              <AppText
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                  color: Colors.themeColorTextPure,
                                }}
                              >
                                {startTime} – {endTime}
                              </AppText>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderWidth: 1,
                                  padding: 5,
                                  borderColor: Colors.littleDark,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                >
                                  <MaterialIcons
                                    name="people-alt"
                                    size={24}
                                    color={Colors.themeColorTextPure}
                                  />
                                  <AppText
                                    style={{ color: Colors.themeColorTextPure }}
                                  >
                                    Peoples Needed
                                  </AppText>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (
                                        playersNeeded[index] < 20 ||
                                        (playersNeeded[index] ?? 0) === 0
                                      ) {
                                        setPlayersNeeded((prev) => ({
                                          ...prev,
                                          [index]: (prev[index] || 0) + 1,
                                        }));
                                      } else {
                                        Notifier.showNotification({
                                          title: "Oops",
                                          description:
                                            "Needed people must be belov 20",
                                          Component: NotifierComponents.Alert,
                                          componentProps: { alertType: "warn" },
                                        });
                                      }
                                    }}
                                  >
                                    <AntDesign
                                      name="plus"
                                      size={20}
                                      color={Colors.themeColorTextPure}
                                    />
                                  </TouchableOpacity>
                                  <AppText
                                    style={{
                                      fontSize: 20,
                                      color: Colors.themeColorTextPure,
                                    }}
                                  >
                                    {playersNeeded[index] ?? 0}{" "}
                                  </AppText>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setPlayersNeeded((prev) => ({
                                        ...prev,
                                        [index]: Math.max(
                                          (prev[index] || 0) - 1,
                                          0
                                        ),
                                      }));
                                    }}
                                  >
                                    <AntDesign
                                      name="minus"
                                      size={20}
                                      color={Colors.themeColorTextPure}
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "90%",
                      justifyContent: "center",
                      gap: 20,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.buttons}
                      onPress={() => setSteps(steps - 1)}
                    >
                      <AppText style={{ color: Colors.themeColorTextPure }}>
                        Preview
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => setSteps(steps + 1)}
                    >
                      <AppText style={{ color: Colors.white }}>Next</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {steps === 2 && (
                <View style={[styles.innerContainer, {}]}>
                  <View
                    style={{
                      width: "90%",
                      gap: 10,
                    }}
                  >
                    <View>
                      <AppText
                        style={{
                          fontSize: 24,
                          color: Colors.themeColorTextPure,
                        }}
                      >
                        Booking Confirmation
                      </AppText>
                    </View>

                    <View
                      style={{
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          borderWidth: 1,
                          padding: 20,
                          borderRadius: 5,
                          justifyContent: "space-between",
                          borderColor: Colors.themeColorTextPure,
                        }}
                      >
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: Colors.themeColorTextPure,
                          }}
                        >
                          {bookingDetails?.name}
                        </AppText>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          borderWidth: 1,
                          padding: 20,
                          borderRadius: 5,
                          justifyContent: "space-between",
                          borderColor: Colors.themeColorTextPure,
                        }}
                      >
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: Colors.themeColorTextPure,
                          }}
                        >
                          Date
                        </AppText>
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: Colors.themeColorTextPure,
                          }}
                        >
                          {bookingDetails?.date
                            ? format(
                                new Date(bookingDetails.date),
                                "MMMM d, yyyy"
                              )
                            : ""}
                        </AppText>
                      </View>
                    </View>
                    <AppText
                      style={{ fontSize: 24, color: Colors.themeColorTextPure }}
                    >
                      Times & Player Needed
                    </AppText>
                    <View style={{ gap: 10 }}>
                      {wholeDay ? (
                        <View
                          style={{
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 5,
                            borderWidth: 1,
                            borderColor: Colors.themeColorTextPure,
                            borderRadius: 5,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              padding: 20,
                              borderBottomWidth: 1,
                              alignItems: "center",
                              borderBottomColor: Colors.themeColorTextPure,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 5,
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="clock-time-nine-outline"
                                size={24}
                                color={Colors.themeColorTextPure}
                              />
                              <AppText
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                  color: Colors.themeColorTextPure,
                                }}
                              >
                                Whole Day
                              </AppText>
                            </View>
                            <AppText
                              style={{
                                fontSize: 18,
                                fontWeight: 300,
                                color: Colors.themeColorTextPure,
                              }}
                            >
                              ₮{bookingDetails?.price.wholeDay}
                            </AppText>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              padding: 20,
                              borderBottomWidth: 1,
                              alignItems: "center",
                              borderBottomColor: Colors.themeColorTextPure,
                            }}
                          >
                            <AppText style={{ fontSize: 18, fontWeight: 300 }}>
                              Peoples
                            </AppText>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AppText
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                  color: Colors.themeColorTextPure,
                                }}
                              >
                                {wholeDayPeople}
                              </AppText>
                              <MaterialIcons
                                name="people-alt"
                                size={24}
                                color={Colors.themeColorTextPure}
                              />
                            </View>
                          </View>
                          <View
                            style={{
                              marginTop: 10,
                              padding: 10,
                              gap: 5,
                            }}
                          >
                            <AppText
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                textAlign: "center",
                                color: Colors.themeColorTextPure,
                              }}
                            >
                              Booker's Total: ₮
                              {wholeDayPeople <= 0
                                ? bookingDetails?.price.wholeDay
                                : Number(bookingDetails?.price.wholeDay) /
                                  wholeDayPeople}
                            </AppText>
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={{ gap: 10 }}>
                            {selectedTimeSlots.map((group, index) => {
                              const startTime = group[0].split("~")[0];
                              const endTime =
                                group[group.length - 1].split("~")[1];
                              const isLast =
                                index === selectedTimeSlots.length - 1;
                              return (
                                <View
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    padding: 10,
                                    gap: 5,
                                    borderWidth: 1,
                                    borderColor: Colors.themeColorTextPure,
                                    borderRadius: 5,
                                  }}
                                >
                                  <AppText
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 300,
                                      color: Colors.themeColorTextPure,
                                    }}
                                  >
                                    {startTime} – {endTime}
                                  </AppText>
                                  <AppText
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 300,
                                      color: Colors.themeColorTextPure,
                                    }}
                                  >
                                    {playersNeeded[index] || 0} Person
                                  </AppText>
                                </View>
                              );
                            })}
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 5,
                              borderWidth: 1,
                              borderColor: Colors.themeColorTextPure,
                              borderRadius: 5,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                padding: 20,
                                borderBottomWidth: 1,
                                alignItems: "center",
                                borderBottomColor: Colors.themeColorTextPure,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  gap: 5,
                                  alignItems: "center",
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="clock-time-nine-outline"
                                  size={24}
                                  color={Colors.themeColorTextPure}
                                />
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 300,
                                    color: Colors.themeColorTextPure,
                                  }}
                                >
                                  1 Hour
                                </AppText>
                              </View>
                              <AppText
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                  color: Colors.themeColorTextPure,
                                }}
                              >
                                ₮{bookingDetails?.price.oneHour}
                              </AppText>
                            </View>
                            <View>
                              {(() => {
                                return (
                                  <>
                                    {selectedTimeSlots.map((group, index) => {
                                      const startTime = group[0].split("~")[0];
                                      const endTime =
                                        group[group.length - 1].split("~")[1];

                                      const getHour = (time: string) => {
                                        const [hourStr] = time.split(":");
                                        return parseInt(hourStr, 10);
                                      };

                                      const startHour = getHour(startTime);
                                      const endHour = getHour(endTime);
                                      const durationHours = endHour - startHour;

                                      const costPerHour = 1000;
                                      const totalCost =
                                        durationHours * costPerHour;

                                      const totalPeople =
                                        (playersNeeded[index] || 0) + 1;

                                      const paymentPerPeople =
                                        totalPeople > 0
                                          ? totalCost / totalPeople
                                          : 0;

                                      // Add to booker’s total
                                      paymentPerPeopleArray.push(
                                        paymentPerPeople
                                      );
                                      totalBookerPaymentArray.push(
                                        paymentPerPeople
                                      );

                                      return (
                                        <View
                                          key={index}
                                          style={{
                                            flexDirection: "column",
                                            justifyContent: "space-evenly",
                                            padding: 10,
                                          }}
                                        >
                                          <AppText
                                            style={{
                                              fontSize: 16,
                                              fontWeight: "300",
                                              color: Colors.themeColorTextPure,
                                            }}
                                          >
                                            Session {index + 1}:
                                          </AppText>
                                          <View
                                            style={{
                                              flexDirection: "row",
                                              justifyContent: "space-around",
                                            }}
                                          >
                                            <AppText
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                                color:
                                                  Colors.themeColorTextPure,
                                              }}
                                            >
                                              {durationHours} Hours
                                            </AppText>
                                            <AppText
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                                color:
                                                  Colors.themeColorTextPure,
                                              }}
                                            >
                                              {totalPeople} Players
                                            </AppText>
                                            <AppText
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                                color:
                                                  Colors.themeColorTextPure,
                                              }}
                                            >
                                              ₮{paymentPerPeople.toFixed(2)} Per
                                              Person
                                            </AppText>
                                          </View>
                                        </View>
                                      );
                                    })}

                                    <View
                                      style={{
                                        marginTop: 10,
                                        padding: 10,
                                        borderTopWidth: 1,
                                        borderColor: Colors.littleDark,
                                      }}
                                    >
                                      <AppText
                                        style={{
                                          fontSize: 18,
                                          fontWeight: "bold",
                                          textAlign: "center",
                                          color: Colors.themeColorTextPure,
                                        }}
                                      >
                                        Booker's Total: ₮
                                        {totalBookerPaymentArray
                                          .reduce((sum, v) => sum + v, 0)
                                          .toFixed(2)}
                                      </AppText>
                                    </View>
                                  </>
                                );
                              })()}
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "90%",
                      justifyContent: "center",
                      gap: 20,
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.buttons}
                      onPress={() => setSteps(steps - 1)}
                    >
                      <AppText style={{ color: Colors.themeColorTextPure }}>
                        Preview
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => {
                        handleOrder();
                      }}
                    >
                      <AppText style={{ color: Colors.themeColorTextPure }}>
                        Book
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
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
      />
    </SafeAreaProvider>
  );
};

export default TransactionPage;
