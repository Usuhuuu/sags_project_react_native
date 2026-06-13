import {
  EsportBookingData,
  SportBookingData,
} from "@/src/context/store/bookStore";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import React, { SetStateAction } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { format, isValid } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Step_One_Props {
  bookingDetails: SportBookingData | null;
  wholeDay: boolean;
  selectedTimeSlots: string[][];
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
}

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (c: any) =>
  StyleSheet.create({
    root: {
      backgroundColor: c.backgroundColor,
      flex: 1,
      gap: 20,
      width: "100%",
    },
    header: {
      width: "100%",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    title: {
      fontWeight: "800",
      fontSize: 26,
      color: c.onSurface,
      letterSpacing: -0.5,
    },
    body: {
      flex: 1,
      alignItems: "center",
      gap: 20,
      width: "100%",
      paddingBottom: 20,
    },
    card: {
      backgroundColor: c.surface,
      padding: 16,
      width: "92%",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: c.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { height: 2, width: 0 },
      shadowRadius: 10,
      elevation: 3,
    },
    topSection: {
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      paddingBottom: 14,
    },
    imageRow: {
      flexDirection: "row",
      height: 100,
      width: "100%",
      marginBottom: 10,
    },
    image: {
      width: "38%",
      height: "100%",
      borderRadius: 12,
      backgroundColor: c.surfaceHigh,
    },
    infoCol: {
      flex: 1,
      paddingLeft: 14,
      justifyContent: "center",
      gap: 6,
    },
    infoRow: {
      justifyContent: "center",
    },
    labelText: {
      color: c.outline,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    valueText: {
      fontWeight: "700",
      fontSize: 18,
      color: c.onSurface,
    },
    valueTextLocation: {
      color: c.outline,
      fontWeight: "600",
      fontSize: 13,
      lineHeight: 18,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 2,
    },
    durationRow: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
    },
    durationLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: c.onSurfaceVariant,
    },
    priceLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: c.accentPrimary,
    },
    summarySection: {
      paddingTop: 14,
      gap: 2,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 2,
    },
    summaryLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: c.onSurfaceVariant,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 2,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
      marginTop: 6,
    },
    totalLabel: {
      color: c.onSurface,
      fontSize: 20,
      fontWeight: "800",
    },
    totalValue: {
      color: c.accentPrimary,
      fontSize: 20,
      fontWeight: "800",
    },
    btnRow: {
      flexDirection: "row",
      width: "92%",
      justifyContent: "center",
    },
    nextBtn: {
      backgroundColor: c.accentPrimary,
      width: "100%",
      alignItems: "center",
      paddingVertical: 16,
      borderRadius: 16,
    },
    nextBtnText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });

const Step_One = ({
  bookingDetails,
  wholeDay,
  selectedTimeSlots,
  steps,
  setSteps,
}: Step_One_Props) => {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const updateSessions = {
    booking_summary: [
      {
        label: "Sport Hall",
        value: bookingDetails?.name,
      },
      { label: "Location", value: bookingDetails?.location.smart_location },
    ],
    booking_summary_second: [
      {
        label: "Date",
        value: bookingDetails?.date,
      },
      {
        label: "Time",
        value: bookingDetails?.selectedTimeSlots,
      },
    ],
  };
  const renderValue = (value: any) => {
    const formatDate = (v: any) => {
      const d = new Date(v);
      console.log(d);
      return isValid(d) ? format(d, "EEE, dd MMMM") : String(v);
    };

    if (Array.isArray(value)) {
      const flatValues = value.flat();
      return flatValues.map(formatDate).join(", ");
    } else {
      return formatDate(value);
    }
  };
  return (
    <View style={s.root}>
      <View style={s.header}>
        <AppText style={s.title}>Booking Summary</AppText>
      </View>
      <View style={s.body}>
        <View style={s.card}>
          <View style={s.topSection}>
            <View style={s.imageRow}>
              <Image
                source={{ uri: bookingDetails?.imageUrls?.[0] ?? "" }}
                style={s.image}
              />
              <View style={s.infoCol}>
                {updateSessions.booking_summary.map((item) => (
                  <View style={s.infoRow} key={Math.random()}>
                    {item.label !== "Location" ? (
                      <AppText style={s.labelText}>{item.label}</AppText>
                    ) : null}
                    {item.label === "Location" ? (
                      <AppText style={s.valueTextLocation}>
                        {item.value}
                      </AppText>
                    ) : (
                      <AppText style={s.valueText}>{item.value}</AppText>
                    )}
                  </View>
                ))}
              </View>
            </View>
            {!wholeDay && (
              <View style={s.priceRow}>
                <View style={s.durationRow}>
                  <MaterialCommunityIcons
                    name="clock-time-nine-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                  <AppText style={s.durationLabel}>1 Hour</AppText>
                </View>
                <AppText style={s.priceLabel}>
                  ₮{bookingDetails?.price.oneHour}
                </AppText>
              </View>
            )}
          </View>

          <View style={s.summarySection}>
            <View style={s.summaryRow}>
              <AppText style={s.summaryLabel}>Date</AppText>
              <AppText style={s.summaryValue}>
                {bookingDetails?.date
                  ? format(new Date(bookingDetails.date), "EEE, dd LLLL")
                  : ""}
              </AppText>
            </View>

            {wholeDay ? (
              <View style={s.summaryRow}>
                <AppText style={s.summaryLabel}>Time</AppText>
                <AppText style={s.summaryValue}>
                  {bookingDetails?.workTime}
                </AppText>
              </View>
            ) : (
              <>
                {selectedTimeSlots.map((group, index) => {
                  const startTime = group[0].split("~")[0];
                  const endTime = group[group.length - 1].split("~")[1];
                  return (
                    <View key={index} style={s.timeRow}>
                      <AppText style={s.summaryLabel}>Time {index + 1}</AppText>
                      <AppText style={s.summaryValue}>
                        {startTime} – {endTime}
                      </AppText>
                    </View>
                  );
                })}
              </>
            )}
          </View>

          <View style={s.totalRow}>
            <AppText style={s.totalLabel}>TOTAL</AppText>
            <AppText style={s.totalValue}>
              ₮
              {wholeDay
                ? bookingDetails?.price?.wholeDay
                : (selectedTimeSlots.length ?? 0) *
                  Number(bookingDetails?.price.oneHour)}
            </AppText>
          </View>
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.nextBtn}
            activeOpacity={0.8}
            onPress={() => setSteps(steps + 1)}
          >
            <AppText style={s.nextBtnText}>Next</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Step_One;
