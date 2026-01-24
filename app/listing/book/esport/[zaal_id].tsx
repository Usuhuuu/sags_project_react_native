import { useTheme } from "@/app/(modals)/context/themeContext";
import { Feather, FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";
import Step_two_pc from "./support_components/step_2_pc";
import { EsportHallDataType } from "@/interfaces/listing";
import {
  EsportBookingData,
  useBookingStore,
} from "@/app/(modals)/context/store/bookStore";
import Step_one_pc from "@/app/listing/book/esport/support_components/step_1_pc";
import { useNavigation } from "@react-navigation/native";
import { TabNavTypes } from "@/interfaces/tabScreenType";
import AppText from "@/constants/appTextDefault";
import HallData from "@/assets/Data/sportHall.json";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { saveToken } from "../util/session";
import Confirm_Modal from "../support_components/confirmation_modal";
import { format } from "date-fns";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { bookingNotificationSchedule } from "@/app/(modals)/context/store/notificationStore";
import { queryClient } from "@/hooks/queryClient";

const BookingEsportHall = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation<TabNavTypes>();
  const customStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: colors.primary,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: colors.primary,
    stepStrokeUnFinishedColor: "#aaaaaa",
    separatorFinishedColor: colors.primary,
    separatorUnFinishedColor: "#aaaaaa",
    stepIndicatorFinishedColor: colors.primary,
    stepIndicatorUnFinishedColor: "#ffffff",
    stepIndicatorCurrentColor: "#ffffff",
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: colors.primary,
    stepIndicatorLabelFinishedColor: colors.themeColorTextPure,
    stepIndicatorLabelUnFinishedColor: colors.darkGrey,
    labelColor: colors.darkGrey,
    labelSize: 13,
    currentStepLabelColor: colors.primary,
  };
  const [step, setStep] = useState(0);
  const [isDataInited, setIsDataInited] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [bookSuccess, setBookSuccess] = useState<boolean>(false);
  const [initTime, setInitTime] = useState<boolean>(false);
  const hasScheduled = useRef<boolean>(false);

  const { zaal_id } = useLocalSearchParams();
  const listing = HallData.find((item) => item.sportHallID === zaal_id) as
    | EsportHallDataType
    | undefined;

  const bookingDetails: EsportBookingData = {
    name: listing?.hall_details.hall_name ?? "Hall Name",
    date: new Date(),
    sportHallID: listing?.sportHallID ?? "",
    price: listing?.hall_details.hall_price ?? (null as any),
    imageUrls: listing?.hall_details.hall_imageURLs,
    location: listing?.hall_details.hall_location ?? {
      latitude: "",
      longitude: "",
    },
    tier: "regular",
    hours: 1,
  };
  const setBookingDetails = useBookingStore(
    (state) => state.setEsportBookingDetails
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
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      const response = await axiosInstance.post(
        `/auth/book/esport`,
        {
          sport_hall_id: bookingDetails.sportHallID,
          date: bookingData?.bookingDate,
          timezone: timezone,
          tier: bookingData?.tier,
          hours: bookingData?.hours,
          startTime: bookingData?.startTime,
        },
        {
          timeout: 10000,
        }
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
      if ([409, 401].includes(err.response.status)) {
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
      icon: (
        <FontAwesome
          name="building"
          size={24}
          color={colors.themeColorTextPure}
        />
      ),
    },
    {
      label: "Date",
      value: bookingDetails?.date
        ? format(new Date(bookingDetails.date), "MMMM d, yyyy")
        : undefined,
      icon: (
        <Fontisto name="date" size={24} color={colors.themeColorTextPure} />
      ),
    },
    {
      label: "Time",
      value:
        bookingDetails?.startTime && bookingDetails.startTime.toLocaleString(),
      icon: (
        <Ionicons
          name="time-outline"
          size={24}
          color={colors.themeColorTextPure}
        />
      ),
    },
    {
      label: "Player Needed",
      resolve: (item: number) => 0,
      icon: (
        <Ionicons name="people" size={24} color={colors.themeColorTextPure} />
      ),
    },
  ];

  const addToCalendar = () => {
    console.log("Add to calendar");
  };

  if (isWaiting) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OwnActivaterIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
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
          <Ionicons name="arrow-back-sharp" size={24} color={colors.primary} />
        </TouchableOpacity>
        {/* Step Indicator */}
        <View
          style={{
            flex: 1,
          }}
        >
          <StepIndicator
            customStyles={customStyles}
            currentPosition={step}
            stepCount={3}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("order");
          }}
        >
          <Feather name="more-vertical" size={30} color={colors.primary} />
        </TouchableOpacity>
      </View>
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
      {step === 0 ? (
        <View
          style={[
            {
              backgroundColor: colors.backgroundColor,
              shadowColor: colors.shadowColor,
              shadowOpacity: 0.5,
              shadowOffset: { width: 2, height: 2 },
              marginTop: 20,
              padding: 20,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <View>
            <AppText style={styles.footerLabel}>
              Total for {bookingData?.tier}
            </AppText>
            <AppText style={styles.totalText}>
              ₩{totalPrice.toLocaleString()}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setStep?.(step! + 1);
            }}
          >
            <Text
              style={[
                styles.bookBtnText,
                {
                  color: theme === "dark" ? colors.dark : colors.white,
                },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            {
              backgroundColor: colors.backgroundColor,
              shadowColor: colors.shadowColor,
              shadowOpacity: 0.5,
              shadowOffset: { width: 2, height: 2 },
              marginTop: 20,
              padding: 20,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setStep?.(step! - 1);
              if (step === 2) {
                handleBooking();
              }
            }}
          >
            <Text
              style={[
                styles.bookBtnText,
                {
                  color: theme === "dark" ? colors.dark : colors.white,
                },
              ]}
            >
              Preview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (step === 2) {
                handleBooking();
              } else if (step <= 2) {
                setStep?.(step! + 1);
              }
            }}
          >
            <Text
              style={[
                styles.bookBtnText,
                {
                  color: theme === "dark" ? colors.dark : colors.white,
                },
              ]}
            >
              Continue
            </Text>
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
const PC_BANG_BLUE = "#00d2ff";
const styles = StyleSheet.create({
  container: {},
  header: {},
  headerTitle: {},
  footerLabel: { fontSize: 12 },
  totalText: { fontSize: 22, fontWeight: "bold" },
  bookBtn: {
    backgroundColor: PC_BANG_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookBtnText: { fontWeight: "bold", fontSize: 16 },
});
export default BookingEsportHall;
