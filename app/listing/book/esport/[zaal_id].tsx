import { useTheme } from "@/src/context/themeContext";
import { Feather, FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";
import Step_two_pc from "../../../../src/utils/book/esport/support_components/step_2_pc";
import { EsportHallDataType } from "@/interfaces/listing";
import {
  EsportBookingData,
  useBookingStore,
} from "@/src/context/store/bookStore";
import Step_one_pc from "@/src/utils/book/esport/support_components/step_1_pc";
import { useNavigation } from "@react-navigation/native";
import { TabNavTypes } from "@/interfaces/tabScreenType";
import AppText from "@/constants/appTextDefault";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { saveToken } from "../../../../src/utils/book/session";
import Confirm_Modal from "../../../../src/utils/book/sport/support_components/confirmation_modal";
import { format } from "date-fns";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { bookingNotificationSchedule } from "@/src/context/store/notificationStore";
import { queryClient } from "@/hooks/queryClient";
import { useHallInfo } from "@/src/context/hallInfoContext";

const createStyles = (c: any) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.backgroundColor },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    stepWrap: { flex: 1, paddingHorizontal: 8 },
    content: { flex: 1 },
    footer: {
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerInfo: { gap: 2 },
    footerLabel: { fontSize: 12, color: c.outline },
    totalText: { fontSize: 20, fontWeight: "800", color: c.onSurface },
    btn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    btnText: { fontSize: 15, fontWeight: "700" },
    btnRow: {
      flexDirection: "row",
      gap: 10,
    },
    waiting: {
      flex: 1,
      backgroundColor: c.backgroundColor,
      alignItems: "center",
      justifyContent: "center",
    },
  });

const BookingEsportHall = () => {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const navigation = useNavigation<TabNavTypes>();

  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: colors.accentPrimary,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: colors.accentPrimary,
    stepStrokeUnFinishedColor: colors.outline,
    separatorFinishedColor: colors.accentPrimary,
    separatorUnFinishedColor: colors.border,
    stepIndicatorFinishedColor: colors.accentPrimary,
    stepIndicatorUnFinishedColor: colors.surface,
    stepIndicatorCurrentColor: colors.surface,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: colors.accentPrimary,
    stepIndicatorLabelFinishedColor: colors.onSurface,
    stepIndicatorLabelUnFinishedColor: colors.outline,
    labelColor: colors.outline,
    labelSize: 13,
    currentStepLabelColor: colors.accentPrimary,
  };

  const [step, setStep] = useState(0);
  const [isDataInited, setIsDataInited] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [initTime, setInitTime] = useState(false);
  const hasScheduled = useRef(false);

  const { zaal_id } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();

  const listing = getSpecificHall(String(zaal_id));

  const bookingDetails: EsportBookingData = {
    name: listing?.hall_details.hall_name ?? "Hall Name",
    date: new Date(),
    sportHallID: listing?.sportHallID ?? "",
    price: listing?.hall_details.hall_price ?? (null as any),
    imageUrls: listing?.hall_details.hall_imageURLs,
    location: listing?.hall_locations ?? {
      latitude: "",
      longitude: "",
    },
    tier: "regular",
    hours: 1,
  };

  const setBookingDetails = useBookingStore(
    (state) => state.setEsportBookingDetails,
  );
  const bookingData = useBookingStore((state) => state.esportBookingDetails);

  useEffect(() => {
    if (!isDataInited) {
      setBookingDetails(bookingDetails);
      setIsDataInited(true);
    }
  }, [step]);

  const packages = [
    { label: "1 Hour", value: 1, price: 1200 },
    { label: "3 Hours", value: 3, price: 3000 },
    { label: "10 Hours", value: 10, price: 9000 },
    { label: "WHOLE DAY", value: 24, price: 18000, isSpecial: true },
  ];

  const totalPrice =
    packages.find((p) => p.value === bookingData?.hours)?.price || 0;

  const handleBooking = async () => {
    try {
      if (!bookingData) {
        Notifier.showNotification({
          title: "Booking Failed",
          description: "Missing booking details.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        return;
      }
      setIsWaiting(true);

      const timezone = encodeURIComponent(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );

      const response = await axiosInstance.post(
        `/auth/book/esport`,
        {
          sport_hall_id: bookingDetails.sportHallID,
          date: bookingData?.bookingDate,
          timezone,
          tier: bookingData?.tier,
          hours: bookingData?.hours,
          startTime: bookingData?.startTime,
        },
        { timeout: 10000 },
      );

      if (response.status === 200 && response.data.success) {
        const token = response.data.session;
        saveToken(token);
        Notifier.showNotification({
          title: "Successfully Booked",
          description: "Check Booking from Order Section",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });

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
        setBookSuccess(response.data.success);
        setIsWaiting(false);
        setConfirmModal(true);
      }
    } catch (err: any) {
      console.log(err);
      if ([409, 401].includes(err.response?.status)) {
        Notifier.showNotification({
          title: "Booking Exists",
          description:
            err.response.data.message ||
            "Conflict in booking. Please choose a different time.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
        setIsWaiting(false);
        return;
      }
      Notifier.showNotification({
        title: "Booking Failed",
        description: "An error occurred during booking. Please try again.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "warn" },
      });
      setIsWaiting(false);
    } finally {
      setIsWaiting(false);
    }
  };

  const confirmationDetails = [
    {
      label: "Booking Court",
      value: bookingDetails?.name,
      icon: <FontAwesome name="building" size={24} color={colors.onSurface} />,
    },
    {
      label: "Date",
      value: bookingDetails?.date
        ? format(new Date(bookingDetails.date), "MMMM d, yyyy")
        : undefined,
      icon: <Fontisto name="date" size={24} color={colors.onSurface} />,
    },
    {
      label: "Time",
      value:
        bookingDetails?.startTime && bookingDetails.startTime.toLocaleString(),
      icon: <Ionicons name="time-outline" size={24} color={colors.onSurface} />,
    },
    {
      label: "Player Needed",
      resolve: (item: number) => 0,
      icon: <Ionicons name="people" size={24} color={colors.onSurface} />,
    },
  ];

  const addToCalendar = () => {
    console.log("Add to calendar");
  };

  if (isWaiting) {
    return (
      <View style={s.waiting}>
        <OwnActivaterIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.flex}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color={colors.accentPrimary}
          />
        </TouchableOpacity>
        <View style={s.stepWrap}>
          <StepIndicator
            customStyles={customStyles}
            currentPosition={step}
            stepCount={3}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("order")}>
          <Feather
            name="more-vertical"
            size={28}
            color={colors.accentPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={s.content}>
        {step === 0 && (
          <Step_one_pc initTime={initTime} setInitTime={setInitTime} />
        )}
        {step === 1 && (
          <Step_two_pc
            listing={
              bookingDetails
                ? (bookingDetails as unknown as EsportBookingData)
                : undefined
            }
          />
        )}
      </View>

      {/* Footer */}
      {step === 0 ? (
        <View style={s.footer}>
          <View style={s.footerInfo}>
            <AppText style={s.footerLabel}>
              Total for {bookingData?.tier}
            </AppText>
            <AppText style={s.totalText}>
              ₩{totalPrice.toLocaleString()}
            </AppText>
          </View>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.accentPrimary }]}
            onPress={() => setStep(step + 1)}
          >
            <AppText style={[s.btnText, { color: "#FFFFFF" }]}>
              Continue
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.surfaceHigh }]}
            onPress={() => {
              if (step === 2) handleBooking();
              setStep(step - 1);
            }}
          >
            <AppText style={[s.btnText, { color: colors.onSurface }]}>
              Back
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.accentPrimary }]}
            onPress={() => {
              if (step === 2) handleBooking();
              else setStep(step + 1);
            }}
          >
            <AppText style={[s.btnText, { color: "#FFFFFF" }]}>
              {step === 2 ? "Book" : "Continue"}
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {bookSuccess && (
        <Confirm_Modal
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          confirmationDetails={confirmationDetails}
          addToCalendar={addToCalendar}
          hasScheduled={hasScheduled.current}
        />
      )}
    </SafeAreaView>
  );
};

export default BookingEsportHall;
