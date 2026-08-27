import { SportBookingData, useBookingStore } from "@/context/store/book_store";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { Feather, FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { openCheckoutBrowser } from "@/utils/paymentBrowser";
import { InAppBrowser } from "react-native-inappbrowser-reborn";

import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { scheduleNotificationForEvent } from "@/hooks/calendarInstance";
import { useTheme } from "@/context/theme_context";
import Confirm_Modal from "@/components/book/confirmation";
import { addHours, format } from "date-fns";
import Step_One from "@/components/book/sport_component/step1";
import Step_Two from "@/components/book/sport_component/step2";
import Step_Three from "@/components/book/sport_component/step3";

import { saveToken } from "@/components/book/session";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { bookingNotificationSchedule } from "@/context/store/notification_store";
import { queryClient } from "@/hooks/queryClient";
import { useHallInfo } from "@/context/hall_info_context";
import { groupDurationHours } from "@/utils/bookingTime";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReservationBlock = {
  start_time: string;
  end_time: string;
  num_players: number;
  current_player: number;
  time_slots: string[];
  wholeDay?: boolean;
  workTime?: string;
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

  const [steps, setSteps] = useState<number>(0);
  // ── Native step indicator (after state so `steps` is in scope) ─────────
  const StepIndicator = useMemo(
    () => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {/* Connecting line */}
            {i > 0 && (
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: i <= steps ? Colors.primary : "#aaa",
                }}
              />
            )}
            {/* Step circle */}
            <View
              style={{
                width: i === steps ? 26 : 22,
                height: i === steps ? 26 : 22,
                borderRadius: i === steps ? 13 : 11,
                backgroundColor: i <= steps ? Colors.primary : "transparent",
                borderWidth: 2,
                borderColor: i <= steps ? Colors.primary : "#aaa",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: i === steps ? 10 : 8,
                  height: i === steps ? 10 : 8,
                  borderRadius: i === steps ? 5 : 4,
                  backgroundColor:
                    i === steps
                      ? Colors.themeColorTextPure
                      : i < steps
                        ? Colors.themeColorTextPure
                        : "transparent",
                }}
              />
            </View>
          </React.Fragment>
        ))}
      </View>
    ),
    [steps, Colors.primary, Colors.themeColorTextPure],
  );
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
  const { getSpecificHall } = useHallInfo();

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
  const [waitingText, setWaitingText] = useState<string>("");

  // ── Derived pricing (computed, readonly — frontend can't edit) ──────────
  const timeCount = useMemo(() => {
    if (wholeDay) return 24;
    return selectedTimeSlots.reduce(
      (total, group) => total + groupDurationHours(group),
      0,
    );
  }, [selectedTimeSlots, wholeDay]);

  const totalPrice = useMemo(() => {
    if (!bookingDetails?.price) return 0;
    if (wholeDay) return Number(bookingDetails.price.wholeDay);
    const hourlyRate = Number(bookingDetails.price.oneHour);
    return timeCount * hourlyRate;
  }, [bookingDetails?.price, wholeDay, timeCount]);

  const paymentPerPeopleArray = useMemo(() => {
    if (wholeDay) return [];
    const hourlyRate = Number(bookingDetails?.price?.oneHour || 0);
    return selectedTimeSlots.map((group, index) => {
      const durationHours = groupDurationHours(group);
      const totalCost = durationHours * hourlyRate;
      const totalPeople = (playersNeeded[index] || 0) + 1;
      return totalPeople > 0 ? totalCost / totalPeople : 0;
    });
  }, [
    selectedTimeSlots,
    bookingDetails?.price?.oneHour,
    wholeDay,
    playersNeeded,
  ]);

  const totalBookerPaymentArray = paymentPerPeopleArray;

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

      // ── Build reservation blocks first — the server pre-checks them for
      // conflicts before the payment link is generated ──
      const reservationBlocks: ReservationBlock[] = !wholeDay
        ? selectedTimeSlots.map((group, index) => {
            const [startTime] = group[0].split("~");
            const [, endTime] = group[group.length - 1].split("~");
            return {
              start_time: startTime,
              end_time: endTime,
              num_players: playersNeeded[index] ?? 0,
              current_player: 0,
              time_slots: group,
            };
          })
        : [
            {
              // start/end are recomputed server-side from workTime for whole-day
              start_time: "",
              end_time: "",
              wholeDay: true,
              workTime: bookingDetails.workTime,
              num_players: wholeDayPeople,
              current_player: 1,
              time_slots: ["wholeDay"],
            },
          ];
      setReserved_times(reservationBlocks);

      // ── 1) Payment — pre-check + create Wire payment intent & open checkout ──
      setWaiting(true);
      setWaitingText("Creating payment…");
      let paymentIntentId: string | null = null;
      let bookingSession: string | null = null;
      try {
        const sessionId = `intent_sessions`;
        const sessions = await AsyncStorage.getItem(sessionId);
        const parsedSessions: any[] = sessions ? JSON.parse(sessions) : [];
        // Drop expired sessions (local cleanup only — server handles reuse via fingerprint).
        let activeSessions: any[] = parsedSessions.filter(
          (i: any) => Date.now() < i.expiresAt,
        );
        console.log("activeSession", activeSessions.length);

        const paymentRes = await axiosInstance.post("/auth/book/intent", {
          amount: Math.round(totalPrice),
          booking: {
            type: "sport",
            sport_hall_id: bookingDetails.sportHallID,
            date: dateOnly,
            timezone,
            reserved_blocks: reservationBlocks,
          },
          // No need to send stored intent IDs — the server fingerprints the
          // booking params and does a single Redis lookup to find any prior intent.
        });

        const session = paymentRes.data?.result;
        if (session?.error) {
          setWaiting(false);
          Notifier.showNotification({
            title: "Payment Failed",
            description: session.error,
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }

        const checkoutUrl = session?.checkout_url ?? session?.url ?? null;
        paymentIntentId = session?.payment_intent ?? null;
        if (!paymentIntentId) {
          setWaiting(false);
          Notifier.showNotification({
            title: "Payment Failed",
            description: "Could not start payment. Please try again.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        } else {
          // identifier encodes which booking this intent belongs to so the
          // frontend can match it back without hitting the server.
          const identifier = `${bookingDetails.sportHallID}_${dateOnly}`;
          if (session.reused) {
            // Server reused an existing intent — refresh its TTL in the list.
            const exists = activeSessions.some(
              (s: any) => s.intentId === paymentIntentId,
            );
            if (exists) {
              activeSessions = activeSessions.map((s: any) =>
                s.intentId === paymentIntentId
                  ? { ...s, expiresAt: Date.now() + 10 * 60 * 1000, identifier }
                  : s,
              );
            } else {
              // Reused an intent not in our local list (e.g. other device) — add it.
              activeSessions.push({
                intentId: paymentIntentId,
                expiresAt: Date.now() + 10 * 60 * 1000,
                identifier,
              });
            }
          } else {
            // Brand-new intent — append it.
            activeSessions.push({
              intentId: paymentIntentId,
              expiresAt: Date.now() + 10 * 60 * 1000,
              identifier,
            });
          }
          if (activeSessions.length > 0) {
            await AsyncStorage.setItem(
              sessionId,
              JSON.stringify(activeSessions),
            );
          } else {
            await AsyncStorage.removeItem(sessionId);
          }
        }

        // ── Wait for the user to pay (QPay / bank / …) ──
        const waitForPayment = async (
          intentId: string,
          maxPolls: number,
        ): Promise<"paid" | "failed" | "timeout"> => {
          for (let i = 0; i < maxPolls; i++) {
            try {
              const stRes = await axiosInstance.get(
                `/auth/payment/status/${intentId}`,
              );
              const status = stRes.data?.status;
              bookingSession = stRes.data?.session ?? null;
              switch (status) {
                case "succeeded":
                  return "paid";

                case "canceled":
                  return "failed";

                case "requires_action":
                  return "failed";

                case "new":
                case "processing":
                case "requires_capture":
                  // Not finished yet → continue polling
                  break;
                case "requires_payment_method":
                  // Payment wasn't successfully completed.
                  return "failed";
                default:
                  // Unknown status → don't incorrectly mark payment as failed.
                  console.warn("Unknown payment status:", status);
                  break;
              }
            } catch (err) {
              console.log("Payment status request failed", err);
              return "failed";
            }
            await new Promise((r) => setTimeout(r, 2000));
          }
          return "timeout";
        };

        // Open the checkout page in the system browser. The deep-link
        // redirect (projectSags://payment-result?payment_intent=...) plus the
        // app returning to the foreground tells us success vs. cancel. If the
        // user closes it without paying (pressed Done), treat it as canceled:
        // stop polling right away and let them re-tap the book button to pay
        // again.
        let outcome: "paid" | "failed" | "timeout" = "timeout";
        if (checkoutUrl) {
          let maxPolls = 15;
          try {
            let browserResult: "cancel" | "error" | "success" = "error";
            try {
              if (await InAppBrowser.isAvailable()) {
                await InAppBrowser.open(checkoutUrl, {
                  ephemeralWebSession: false,
                  dismissButtonStyle: "cancel",
                  showTitle: true,
                  enableUrlBarHiding: true,
                  enableDefaultShare: false,
                  forceCloseOnRedirection: true,
                });
                browserResult = "cancel";
              } else {
                browserResult = await openCheckoutBrowser(checkoutUrl);
              }
            } catch {
              browserResult = await openCheckoutBrowser(checkoutUrl);
            }
            if (browserResult === "success") {
              // the webhook/worker to finish and grab the session.
              maxPolls = 10;
            } else if (browserResult === "cancel") {
              // User closed the browser without paying — stop fast.
              maxPolls = 3;
            } else {
              outcome = "failed";
            }
          } catch {
            outcome = "failed";
          }
          if (outcome !== "failed") {
            outcome = await waitForPayment(paymentIntentId, maxPolls);
          }
        }
        if (outcome !== "paid") {
          setWaiting(false);
          Notifier.showNotification({
            title: "Payment Not Completed",
            description:
              outcome === "failed"
                ? "The payment was canceled or expired. Press book to try again."
                : outcome === "timeout"
                  ? "We couldn't confirm the payment yet. Check your orders shortly."
                  : "Payment canceled. Press book to try again.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
      } catch (err: any) {
        setWaiting(false);
        if (err.response?.status === 409) {
          Notifier.showNotification({
            title: "Time Slot Taken",
            description:
              err.response.data?.message ||
              "This time slot is no longer available. Please choose another.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
        if (err.message === "could't find Token") {
          Notifier.showNotification({
            title: "Please Login",
            description: "Please Login to process to book",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "warn" },
          });
          return;
        }
        Notifier.showNotification({
          title: "Payment Failed",
          description: "Could not start payment. Please try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        console.log(err);
        return;
      }

      // ── 2) Payment confirmed — the server webhook processes the booking ──
      setWaitingText("Finalizing…");
      if (bookingSession) {
        await saveToken(bookingSession);
        if (!hasScheduled.current) {
          await bookingNotificationSchedule({
            title: `Booking Confirmed for ${bookingDetails.name}`,
            body: "Your booking is being confirmed. Check the Order section.",
            bookingToken: bookingSession,
          });
          hasScheduled.current = true;
        }
      }
      Notifier.showNotification({
        title: "Payment Successful",
        description:
          "Your booking is being confirmed. Check the Order section shortly.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
      // Refresh orders once now and again shortly after so webhook-processed
      // bookings show up in the list.
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
      });
      setTimeout(() => {
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "booked_order",
        });
      }, 8000);
      setWaiting(false);
      setConfirmModal(true);
    } catch (err: any) {
      if (err.response?.status === 402) {
        Notifier.showNotification({
          title: "Payment Not Completed",
          description:
            err.response.data?.message ||
            "Please complete the payment and try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      } else if ([409, 401].includes(err.response?.status)) {
        Notifier.showNotification({
          title: "Booking Exists",
          description:
            err.response.data?.message ||
            "Conflict. Please choose a different time.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      } else {
        Notifier.showNotification({
          title: "Booking Failed",
          description: "An error occurred. Please try again.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
    } finally {
      setWaiting(false);
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
          {waitingText ? (
            <Text
              style={{
                color: Colors.themeColorTextSecondary,
                fontSize: 14,
                fontWeight: "500",
                marginTop: 4,
              }}
            >
              {waitingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <SafeAreaView
          style={{ backgroundColor: Colors.backgroundColor, flex: 1 }}
        >
          <View style={{ flex: 1 }}>
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
              {/* Step Indicator — native View, no third-party lib */}
              <View style={{ flex: 1 }}>{StepIndicator}</View>
              <TouchableOpacity
                onPress={() => {
                  router.navigate("/(drawer)/(user)/(tab-user)/order.tsx");
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
                flex: 1,
              }}
              scrollEventThrottle={16}
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
                  timeCount={timeCount}
                  totalPrice={totalPrice}
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
