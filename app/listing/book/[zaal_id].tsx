import { useBookingStore } from "@/app/(modals)/context/store/bookStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Colors from "@/constants/Colors";
import {
  AntDesign,
  Feather,
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
  const [steps, setSteps] = useState<number>(0);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[][]>([]);
  const [playersNeeded, setPlayersNeeded] = useState<{ [key: number]: number }>(
    {}
  );
  const [wholeDayPeople, setWholeDayPeople] = useState<number>(0);
  const [wholeDay, setWholeDay] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);

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
                current_player: 0,
                time_slots: ["wholeDay"],
              },
            ],
          },
          { timeout: 10000 }
        );
      }

      if (response.status === 200 && response.data.success) {
        Notifier.showNotification({
          title: "Successfully Booked",
          description: "Check Booking from Order Section",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
        router.replace("/");
        if (wholeDay) {
          if (!reservationBlocks) return;
          for (const blocks of reservationBlocks) {
            const endDate = new Date(`${dateOnly}T${blocks.end_time}:80`);
            const startDate = new Date(`${dateOnly}T${blocks.start_time}:80`);
            scheduleNotificationForEvent({
              endDate: endDate,
              startDate: startDate,
            });
          }
        } else {
          const [start, end] = bookingDetails?.baseTime_startAndEnd.split("~");
          const endDate = new Date(`${dateOnly}T${end}:80`);
          const startDate = new Date(`${dateOnly}T${start}:80`);
          scheduleNotificationForEvent({
            endDate: endDate,
            startDate: startDate,
          });
        }
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
        console.log(err);
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

  return (
    <SafeAreaProvider>
      {waiting ? (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={Colors.primary} />
        </View>
      ) : (
        <SafeAreaView style={{ backgroundColor: Colors.white }}>
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
                backgroundColor: Colors.white,
                width: "100%",
                height: "90%",
              }}
            >
              {steps === 0 && (
                <View style={styles.innerContainer}>
                  <Text
                    style={{ fontSize: 24, fontWeight: 400, textAlign: "left" }}
                  >
                    {bookingDetails?.name}
                  </Text>
                  {/* check section */}
                  <View
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      width: "70%",
                      borderColor: Colors.littleDark,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 20,
                        borderBottomWidth: 1,
                      }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: 300 }}>
                        Date
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: 300 }}>
                        {bookingDetails?.date
                          ? format(
                              new Date(bookingDetails.date),
                              "MMMM d, yyyy"
                            )
                          : ""}
                      </Text>
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
                          <Text style={{ fontSize: 18, fontWeight: 300 }}>
                            Time
                          </Text>
                          <Text style={{ fontSize: 18, fontWeight: 300 }}>
                            {bookingDetails?.workTime}
                          </Text>
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
                                }}
                              >
                                <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                  Time {index + 1}
                                </Text>
                                <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                  {startTime} – {endTime}
                                </Text>
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
                      borderColor: Colors.littleDark,
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
                            color="black"
                          />
                          <Text style={{ fontSize: 18, fontWeight: 300 }}>
                            1 Hour
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 300 }}>
                          ₮{bookingDetails?.price.oneHour}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 20,
                      }}
                    >
                      <Text>TOTAL</Text>
                      <Text>
                        ₮
                        {wholeDay
                          ? bookingDetails?.price?.wholeDay
                          : (bookingDetails?.selectedTimeSlots.length ?? 0) *
                            Number(bookingDetails?.price.oneHour)}
                      </Text>
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
                    <View></View>
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => setSteps(steps + 1)}
                    >
                      <Text style={{ color: Colors.white }}>Next</Text>
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
                        <Text style={{ fontSize: 18, fontWeight: 300 }}>
                          {bookingDetails?.workTime}
                        </Text>
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
                              color="black"
                            />
                            <Text>Peoples Needed</Text>
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
                              <AntDesign name="plus" size={20} color="black" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>
                              {wholeDayPeople}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                if (wholeDayPeople > 0)
                                  setWholeDayPeople(wholeDayPeople - 1);
                              }}
                            >
                              <AntDesign name="minus" size={20} color="black" />
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
                              <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                Session {index + 1}
                              </Text>
                              <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                {startTime} – {endTime}
                              </Text>
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
                                    color="black"
                                  />
                                  <Text>Peoples Needed</Text>
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
                                      color="black"
                                    />
                                  </TouchableOpacity>
                                  <Text style={{ fontSize: 20 }}>
                                    {playersNeeded[index] ?? 0}{" "}
                                  </Text>
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
                                      color="black"
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
                      <Text>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.buttons,
                        { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => setSteps(steps + 1)}
                    >
                      <Text style={{ color: Colors.white }}>Next</Text>
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
                    <Text style={{ fontSize: 24 }}>Booking Confirmation</Text>

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
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: 300 }}>
                          {bookingDetails?.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          borderWidth: 1,
                          padding: 20,
                          borderRadius: 5,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: 300 }}>
                          Date
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: 300 }}>
                          {bookingDetails?.date
                            ? format(
                                new Date(bookingDetails.date),
                                "MMMM d, yyyy"
                              )
                            : ""}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 24 }}>Times & Player Needed</Text>
                    <View style={{ gap: 10 }}>
                      {wholeDay ? (
                        <View
                          style={{
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 5,
                            borderWidth: 1,
                            borderColor: Colors.littleDark,
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
                                color="black"
                              />
                              <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                Whole Day
                              </Text>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: 300 }}>
                              ₮{bookingDetails?.price.wholeDay}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              padding: 20,
                              borderBottomWidth: 1,
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: 300 }}>
                              Peoples
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: 300,
                                }}
                              >
                                {wholeDayPeople}
                              </Text>
                              <MaterialIcons
                                name="people-alt"
                                size={24}
                                color={Colors.dark}
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
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              Booker's Total: ₮
                              {wholeDayPeople <= 0
                                ? bookingDetails?.price.wholeDay
                                : Number(bookingDetails?.price.wholeDay) /
                                  wholeDayPeople}
                            </Text>
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
                                    borderColor: Colors.littleDark,
                                    borderRadius: 5,
                                  }}
                                >
                                  <Text
                                    style={{ fontSize: 18, fontWeight: 300 }}
                                  >
                                    {startTime} – {endTime}
                                  </Text>
                                  <Text
                                    style={{ fontSize: 18, fontWeight: 300 }}
                                  >
                                    {playersNeeded[index] || 0} Person
                                  </Text>
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
                              borderColor: Colors.littleDark,
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
                                  color="black"
                                />
                                <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                  1 Hour
                                </Text>
                              </View>
                              <Text style={{ fontSize: 18, fontWeight: 300 }}>
                                ₮{bookingDetails?.price.oneHour}
                              </Text>
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
                                          <Text
                                            style={{
                                              fontSize: 16,
                                              fontWeight: "300",
                                            }}
                                          >
                                            Session {index + 1}:
                                          </Text>
                                          <View
                                            style={{
                                              flexDirection: "row",
                                              justifyContent: "space-around",
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                              }}
                                            >
                                              {durationHours} hours
                                            </Text>
                                            <Text
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                              }}
                                            >
                                              {totalPeople} players
                                            </Text>
                                            <Text
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 300,
                                              }}
                                            >
                                              ₮{paymentPerPeople.toFixed(2)} per
                                              person
                                            </Text>
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
                                      <Text
                                        style={{
                                          fontSize: 18,
                                          fontWeight: "bold",
                                          textAlign: "center",
                                        }}
                                      >
                                        Booker's Total: ₮
                                        {totalBookerPaymentArray
                                          .reduce((sum, v) => sum + v, 0)
                                          .toFixed(2)}
                                      </Text>
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
                      <Text>Preview</Text>
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
                      <Text style={{ color: Colors.white }}>Complete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    backgroundColor: Colors.white,
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

export default TransactionPage;
