import { SportBookingData } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import React, { SetStateAction } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

interface Step_Three_Props {
  bookingDetails: SportBookingData | null;
  wholeDay: boolean;
  selectedTimeSlots: string[][];
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
  wholeDayPeople: number;
  playersNeeded: { [key: number]: number };
  paymentPerPeopleArray: number[];
  totalBookerPaymentArray: number[];
  timeCount: number;
  totalPrice: number;
  handleOrder: () => void;
}

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (c: any) =>
  StyleSheet.create({
    root: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 24,
      gap: 16,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      shadowColor: c.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { height: 2, width: 0 },
      shadowRadius: 10,
      elevation: 3,
      gap: 14,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: c.onSurface,
      letterSpacing: -0.3,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: c.surfaceHigh,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    infoLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: c.onSurfaceVariant,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    sectionLabel: {
      fontSize: 17,
      fontWeight: "700",
      color: c.onSurface,
      marginTop: 4,
    },
    timeCard: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      overflow: "hidden",
    },
    timeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    timeHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    timeHeaderLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    timeHeaderPrice: {
      fontSize: 15,
      fontWeight: "700",
      color: c.accentPrimary,
    },
    peopleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    peopleLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: c.onSurfaceVariant,
    },
    peopleValue: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    peopleIcon: {
      marginLeft: 4,
    },
    sessionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: c.surfaceHigh,
      marginHorizontal: 8,
      borderRadius: 10,
      marginBottom: 4,
    },
    sessionText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.onSurfaceVariant,
    },
    sessionValue: {
      fontSize: 14,
      fontWeight: "600",
      color: c.onSurface,
    },
    breakdownCard: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      overflow: "hidden",
    },
    breakdownHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    breakdownCell: {
      fontSize: 14,
      fontWeight: "600",
      color: c.onSurface,
      textAlign: "center",
    },
    totalRow: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
      alignItems: "center",
    },
    totalText: {
      fontSize: 16,
      fontWeight: "800",
      color: c.accentPrimary,
    },
    bookerTotalText: {
      fontSize: 15,
      fontWeight: "700",
      color: c.onSurface,
      textAlign: "center",
      paddingVertical: 10,
    },
    totalSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    totalSummaryLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    totalSummaryValue: {
      fontSize: 16,
      fontWeight: "700",
      color: c.accentPrimary,
    },
    btnRow: {
      flexDirection: "row",
      gap: 12,
    },
    btnOutline: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    btnOutlineText: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurface,
    },
    btnPrimary: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.accentPrimary,
    },
    btnPrimaryText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });

const Step_Three = ({
  bookingDetails,
  wholeDay,
  selectedTimeSlots,
  steps,
  setSteps,
  wholeDayPeople,
  totalBookerPaymentArray,
  paymentPerPeopleArray,
  timeCount,
  totalPrice,
  handleOrder,
  playersNeeded,
}: Step_Three_Props) => {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.root}>
      <View style={s.card}>
        <AppText style={s.title}>Booking Confirmation</AppText>

        {/* Hall name & Date */}
        <View style={{ gap: 10 }}>
          <View style={s.infoRow}>
            <AppText style={s.infoValue}>{bookingDetails?.name}</AppText>
          </View>
          <View style={s.infoRow}>
            <AppText style={s.infoLabel}>Date</AppText>
            <AppText style={s.infoValue}>
              {bookingDetails?.date
                ? format(new Date(bookingDetails.date), "EEE, dd LLLL")
                : ""}
            </AppText>
          </View>
        </View>

        <AppText style={s.sectionLabel}>Times & Players</AppText>

        {wholeDay ? (
          <View style={s.timeCard}>
            <View style={s.timeHeader}>
              <View style={s.timeHeaderLeft}>
                <MaterialCommunityIcons
                  name="clock-time-nine-outline"
                  size={20}
                  color={colors.onSurface}
                />
                <AppText style={s.timeHeaderLabel}>Whole Day</AppText>
              </View>
              <AppText style={s.timeHeaderPrice}>
                ₮{bookingDetails?.price.wholeDay}
              </AppText>
            </View>
            <View style={s.peopleRow}>
              <AppText style={s.peopleLabel}>People</AppText>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <AppText style={s.peopleValue}>{wholeDayPeople}</AppText>
                <MaterialIcons
                  name="people-alt"
                  size={20}
                  color={colors.onSurface}
                  style={s.peopleIcon}
                />
              </View>
            </View>
            <View style={s.totalRow}>
              <AppText style={s.totalText}>
                Booker's Total: ₮
                {wholeDayPeople <= 0
                  ? bookingDetails?.price.wholeDay
                  : Number(bookingDetails?.price.wholeDay) / wholeDayPeople}
              </AppText>
            </View>
          </View>
        ) : (
          <>
            {/* Time slots */}
            <View style={{ gap: 8 }}>
              {selectedTimeSlots.map((group, index) => {
                const startTime = group[0].split("~")[0];
                const endTime = group[group.length - 1].split("~")[1];
                return (
                  <View key={index} style={s.sessionRow}>
                    <AppText style={s.sessionText}>
                      {startTime} – {endTime}
                    </AppText>
                    <AppText style={s.sessionValue}>
                      {playersNeeded[index] || 0} Person
                    </AppText>
                  </View>
                );
              })}
            </View>

            {/* Price breakdown */}
            <View style={s.breakdownCard}>
              <View style={s.breakdownHeader}>
                <View style={s.timeHeaderLeft}>
                  <MaterialCommunityIcons
                    name="clock-time-nine-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                  <AppText
                    style={[
                      s.timeHeaderLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    1 Hour
                  </AppText>
                </View>
                <AppText style={s.timeHeaderPrice}>
                  ₮{bookingDetails?.price.oneHour}
                </AppText>
              </View>

              {/* Total summary — clean, straight rows */}
              <View style={s.totalSummaryRow}>
                <AppText style={s.totalSummaryLabel}>Total Hours</AppText>
                <AppText style={s.totalSummaryValue}>{timeCount}h</AppText>
              </View>
              <View
                style={[
                  s.totalSummaryRow,
                  { borderTopWidth: 0, paddingTop: 0 },
                ]}
              >
                <AppText style={s.totalSummaryLabel}>Total Price</AppText>
                <AppText style={s.totalSummaryValue}>
                  ₮{totalPrice.toLocaleString()}
                </AppText>
              </View>

              {selectedTimeSlots.map((group, index) => {
                const startTime = group[0].split("~")[0];
                const endTime = group[group.length - 1].split("~")[1];

                const getHour = (time: string) => {
                  const [hourStr] = time.split(":");
                  return parseInt(hourStr, 10);
                };

                const startHour = getHour(startTime);
                const endHour = getHour(endTime);
                const durationHours = endHour - startHour;

                const totalPeople = (playersNeeded[index] || 0) + 1;
                const paymentPerPerson = paymentPerPeopleArray[index] ?? 0;

                return (
                  <View key={index} style={{ paddingVertical: 4 }}>
                    <AppText
                      style={[
                        s.sessionText,
                        { paddingHorizontal: 16, paddingTop: 6 },
                      ]}
                    >
                      Session {index + 1}:
                    </AppText>
                    <View style={s.breakdownRow}>
                      <AppText style={s.breakdownCell}>
                        {durationHours} Hours
                      </AppText>
                      <AppText style={s.breakdownCell}>
                        {totalPeople} Players
                      </AppText>
                      <AppText style={s.breakdownCell}>
                        ₮{paymentPerPerson.toFixed(2)}/person
                      </AppText>
                    </View>
                  </View>
                );
              })}

              <View style={s.totalRow}>
                <AppText style={s.bookerTotalText}>
                  Booker's Total: ₮
                  {totalBookerPaymentArray
                    .reduce((sum, v) => sum + v, 0)
                    .toFixed(2)}
                </AppText>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={s.btnRow}>
        <TouchableOpacity
          style={s.btnOutline}
          activeOpacity={0.7}
          onPress={() => setSteps(steps - 1)}
        >
          <AppText style={s.btnOutlineText}>Back</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnPrimary}
          activeOpacity={0.8}
          onPress={() => handleOrder()}
        >
          <AppText style={s.btnPrimaryText}>Book</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step_Three;
