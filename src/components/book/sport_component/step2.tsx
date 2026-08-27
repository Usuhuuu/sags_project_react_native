import { SportBookingData } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import React, { SetStateAction, useMemo } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

interface Step_Two_Props {
  wholeDay: boolean;
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
  bookingDetails: SportBookingData | null;
  selectedTimeSlots: string[][];
  wholeDayPeople: number;
  setWholeDayPeople: React.Dispatch<SetStateAction<number>>;
  playersNeeded: { [key: number]: number };
  setPlayersNeeded: React.Dispatch<SetStateAction<{ [key: number]: number }>>;
}

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (c: any) =>
  StyleSheet.create({
    root: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 24,
      gap: 12,
    },
    sessionCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: c.shadowColor,
      shadowOpacity: 0.08,
      shadowOffset: { height: 2, width: 0 },
      shadowRadius: 8,
      elevation: 2,
    },
    sessionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.onSurface,
    },
    sessionTime: {
      fontSize: 15,
      fontWeight: "500",
      color: c.onSurfaceVariant,
      marginTop: 2,
      marginBottom: 14,
    },
    peopleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.surfaceHigh,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    peopleLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    peopleLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: c.onSurface,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    stepperBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.accentPrimaryGlow,
      justifyContent: "center",
      alignItems: "center",
    },
    stepperValue: {
      fontSize: 18,
      fontWeight: "700",
      color: c.onSurface,
      minWidth: 24,
      textAlign: "center",
    },
    btnRow: {
      flexDirection: "row",
      gap: 12,
      paddingTop: 8,
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

const Step_Two = ({
  selectedTimeSlots,
  setSteps,
  steps,
  wholeDay,
  bookingDetails,
  wholeDayPeople,
  setWholeDayPeople,
  playersNeeded,
  setPlayersNeeded,
}: Step_Two_Props) => {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={s.root}>
      {wholeDay ? (
        <View style={s.sessionCard}>
          <AppText style={s.sessionTitle}>{bookingDetails?.workTime}</AppText>
          <View style={[s.peopleRow, { marginTop: 14 }]}>
            <View style={s.peopleLabelRow}>
              <MaterialIcons
                name="people-alt"
                size={22}
                color={colors.onSurface}
              />
              <AppText style={s.peopleLabel}>People Needed</AppText>
            </View>
            <View style={s.stepperRow}>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => {
                  if (wholeDayPeople < 20) {
                    setWholeDayPeople(wholeDayPeople + 1);
                  } else {
                    Notifier.showNotification({
                      title: "Oops",
                      description: "Needed people must be below 20",
                      Component: NotifierComponents.Alert,
                      componentProps: { alertType: "warn" },
                    });
                  }
                }}
              >
                <AntDesign name="plus" size={16} color={colors.accentPrimary} />
              </TouchableOpacity>
              <AppText style={s.stepperValue}>{wholeDayPeople}</AppText>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => {
                  if (wholeDayPeople > 0) setWholeDayPeople(wholeDayPeople - 1);
                }}
              >
                <AntDesign
                  name="minus"
                  size={16}
                  color={colors.accentPrimary}
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
              <View key={index} style={s.sessionCard}>
                <AppText style={s.sessionTitle}>Session {index + 1}</AppText>
                <AppText style={s.sessionTime}>
                  {startTime} – {endTime}
                </AppText>
                <View style={s.peopleRow}>
                  <View style={s.peopleLabelRow}>
                    <MaterialIcons
                      name="people-alt"
                      size={22}
                      color={colors.onSurface}
                    />
                    <AppText style={s.peopleLabel}>People Needed</AppText>
                  </View>
                  <View style={s.stepperRow}>
                    <TouchableOpacity
                      style={s.stepperBtn}
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
                            description: "Needed people must be below 20",
                            Component: NotifierComponents.Alert,
                            componentProps: { alertType: "warn" },
                          });
                        }
                      }}
                    >
                      <AntDesign
                        name="plus"
                        size={16}
                        color={colors.accentPrimary}
                      />
                    </TouchableOpacity>
                    <AppText style={s.stepperValue}>
                      {playersNeeded[index] ?? 0}
                    </AppText>
                    <TouchableOpacity
                      style={s.stepperBtn}
                      onPress={() => {
                        setPlayersNeeded((prev) => ({
                          ...prev,
                          [index]: Math.max((prev[index] || 0) - 1, 0),
                        }));
                      }}
                    >
                      <AntDesign
                        name="minus"
                        size={16}
                        color={colors.accentPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}

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
          onPress={() => setSteps(steps + 1)}
        >
          <AppText style={s.btnPrimaryText}>Next</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step_Two;
