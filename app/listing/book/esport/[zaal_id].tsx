import { useTheme } from "@/app/(modals)/context/themeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StepIndicator from "react-native-step-indicator";
import Step_two_pc from "./support_components/step_2_pc";
import { EsportHallDataType } from "@/interfaces/listing";
import {
  EsportBookingData,
  SportBookingData,
  useBookingStore,
} from "@/app/(modals)/context/store/bookStore";
import Step_one_pc from "@/app/listing/book/esport/support_components/step_1_pc";
import { useNavigation } from "@react-navigation/native";
import { TabNavTypes } from "@/interfaces/tabScreenType";
import AppText from "@/constants/appTextDefault";
import HallData from "@/assets/Data/sportHall.json";

interface BookingEsportHallProps {
  listing: EsportHallDataType;
  orderModelVisible: boolean;
  setOrderModelVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookingEsportHall = ({}: BookingEsportHallProps) => {
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
  const [data, setData] = useState<
    EsportHallDataType | SportBookingData | null
  >(null);
  const { zaal_id } = useLocalSearchParams();
  const listing = HallData.find((item) => item.sportHallID === zaal_id);

  const bookingDetails: EsportBookingData = {
    name: listing?.name ?? "",
    date: new Date(),
    sportHallID: listing?.sportHallID ?? "",
    price: listing?.prices as unknown as EsportHallDataType["prices"],
    imageUrls: listing?.imageUrls,
    location: listing?.location ?? { latitude: "", longitude: "" },
    tier: "regular",
    hours: 1,
  };
  const setBookingDetails = useBookingStore(
    (state) => state.setEsportBookingDetails
  );

  useEffect(() => {
    if (listing) {
      setBookingDetails(bookingDetails);
    }
  }, [listing, setBookingDetails]);
  const packages = [
    { label: "1 Hour", value: 1, price: 1200 },
    { label: "3 Hours", value: 3, price: 3000 },
    { label: "10 Hours", value: 10, price: 9000 },
    { label: "WHOLE DAY", value: 24, price: 18000, isSpecial: true },
  ];
  const [tier, setTier] = useState("regular");
  const [hours, setHours] = useState<number>(1);
  const totalPrice = packages.find((p) => p.value === hours)?.price || 0;
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
        <Step_one_pc
          listing={
            bookingDetails
              ? (bookingDetails as unknown as EsportBookingData)
              : undefined
          }
          step={step}
          setStep={setStep}
          hallId={typeof zaal_id === "string" ? zaal_id : zaal_id[0]}
        />
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
            <AppText style={styles.footerLabel}>Total for {tier}</AppText>
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
