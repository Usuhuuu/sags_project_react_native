import { SportBookingData } from "@/context/store/book_store";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import React, { SetStateAction } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Step_Four_Props {
  bookingDetails: SportBookingData | null;
  wholeDay: boolean;
  timeCount: number;
  totalPrice: number;
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
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
    subtitle: {
      fontSize: 14,
      color: c.onSurfaceVariant,
      marginTop: -8,
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
    // ── Payment method row ──
    methodRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.accentPrimaryBorder,
      backgroundColor: c.accentPrimaryGlow,
    },
    methodIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    methodTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: c.onSurface,
    },
    methodDesc: {
      fontSize: 12,
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    secureChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: c.successGlow,
      borderWidth: 1,
      borderColor: c.successBorder,
    },
    secureText: {
      fontSize: 11,
      fontWeight: "700",
      color: c.successColor,
    },
    // ── Amount due ──
    amountWrap: {
      alignItems: "center",
      paddingVertical: 18,
      gap: 6,
    },
    amountLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: c.onSurfaceVariant,
      letterSpacing: 0.6,
    },
    amountValue: {
      fontSize: 34,
      fontWeight: "800",
      color: c.accentPrimary,
      letterSpacing: -0.5,
    },
    amountUnit: {
      fontSize: 15,
      fontWeight: "600",
      color: c.onSurfaceVariant,
    },
    note: {
      fontSize: 12,
      lineHeight: 18,
      color: c.onSurfaceVariant,
      textAlign: "center",
      paddingHorizontal: 8,
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
      flex: 1.6,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.accentPrimary,
    },
    btnPrimaryText: {
      color: c.white,
      fontSize: 15,
      fontWeight: "700",
    },
  });

const Step_Four = ({
  bookingDetails,
  wholeDay,
  timeCount,
  totalPrice,
  steps,
  setSteps,
  handleOrder,
}: Step_Four_Props) => {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.root}>
      <View style={s.card}>
        <AppText style={s.title}>Payment</AppText>
        <AppText style={s.subtitle}>
          Complete payment to confirm your booking
        </AppText>

        {/* Order summary */}
        <View style={{ gap: 10 }}>
          <View style={s.infoRow}>
            <AppText style={s.infoLabel}>Court</AppText>
            <AppText style={s.infoValue} numberOfLines={1}>
              {bookingDetails?.name}
            </AppText>
          </View>
          <View style={s.infoRow}>
            <AppText style={s.infoLabel}>Date</AppText>
            <AppText style={s.infoValue}>
              {bookingDetails?.date
                ? format(new Date(bookingDetails.date), "EEE, dd LLLL")
                : ""}
            </AppText>
          </View>
          <View style={s.infoRow}>
            <AppText style={s.infoLabel}>Duration</AppText>
            <AppText style={s.infoValue}>
              {wholeDay ? "Whole Day (24h)" : `${timeCount}h`}
            </AppText>
          </View>
        </View>
      </View>

      {/* Payment method */}
      <View style={s.card}>
        <AppText style={{ fontSize: 17, fontWeight: "700", color: colors.onSurface }}>
          Payment Method
        </AppText>
        <View style={s.methodRow}>
          <View style={s.methodIcon}>
            <MaterialCommunityIcons
              name="cellphone-wireless"
              size={22}
              color={colors.accentPrimary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={s.methodTitle}>Wire — Mobile Payment</AppText>
            <AppText style={s.methodDesc}>Bank & mobile operators</AppText>
          </View>
          <View style={s.secureChip}>
            <Ionicons name="lock-closed" size={11} color={colors.successColor} />
            <AppText style={s.secureText}>Secure</AppText>
          </View>
        </View>

        {/* Amount due */}
        <View style={[s.amountWrap, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
          <AppText style={s.amountLabel}>TOTAL DUE</AppText>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <AppText style={s.amountValue}>₮{totalPrice.toLocaleString()}</AppText>
            <AppText style={s.amountUnit}>MNT</AppText>
          </View>
        </View>

        <AppText style={s.note}>
          You will be redirected to complete the payment securely. Your booking
          is confirmed after payment succeeds.
        </AppText>
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
          <Ionicons name="card" size={16} color={colors.white} />
          <AppText style={s.btnPrimaryText}>Pay & Confirm</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step_Four;
