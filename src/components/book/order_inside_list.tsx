import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import {
  Feather,
  FontAwesome,
  FontAwesome6,
  Fontisto,
  MaterialIcons,
} from "@expo/vector-icons";
import { format, differenceInSeconds } from "date-fns";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { Return_Type } from "@/types/book_type";
import axiosInstance from "@/hooks/axiosInstance";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/theme_context";
import { Skeleton } from "moti/skeleton";

type TC = {
  surface: string;
  surfaceHigh: string;
  surfaceHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  border: string;
  borderSubtle: string;
  accentPrimary: string;
  accentPrimaryGlow: string;
  accentPrimaryBorder: string;
  successColor: string;
  successGlow: string;
  successBorder: string;
  warningColor: string;
  warningGlow: string;
  warningBorder: string;
  errorColor: string;
  errorGlow: string;
  errorBorder: string;
  white: string;
  shadowColor: string;
};

type StatusCfg = { color: string; bg: string; border: string };

type ProgressBarProps = {
  progress: number; // 0 to 1
  color: string;
  trackColor?: string;
};
export function ProgressBar({
  progress,
  color,
  trackColor = "#e5e7eb",
}: ProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={{
        height: 4,
        borderRadius: 4,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${safeProgress * 100}%`,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    </View>
  );
}

function getStatus(status: string, c: TC): StatusCfg {
  const map: Record<string, StatusCfg> = {
    confirmed: {
      color: c.successColor,
      bg: c.successGlow,
      border: c.successBorder,
    },
    waiting: {
      color: c.warningColor,
      bg: c.warningGlow,
      border: c.warningBorder,
    },
    cancelled: { color: c.errorColor, bg: c.errorGlow, border: c.errorBorder },
  };
  return (
    map[status] ?? {
      color: c.accentPrimary,
      bg: c.accentPrimaryGlow,
      border: c.accentPrimaryBorder,
    }
  );
}

function useCountdown(expireAt?: string | Date) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (expireAt == null) return 0;
    const d = differenceInSeconds(new Date(expireAt), new Date());
    return Math.max(isNaN(d) ? 0 : d, 0);
  });
  useEffect(() => {
    if (expireAt == null) {
      setSecondsLeft(0);
      return;
    }
    const iv = setInterval(() => {
      const raw = differenceInSeconds(new Date(expireAt), new Date());
      const sec = Math.max(isNaN(raw) ? 0 : raw, 0);
      setSecondsLeft(sec);
      if (sec <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [expireAt]);
  return {
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    secondsLeft,
  };
}

// ── Style factory ──────────────────────────────────────────────────────────
function createStyles(c: TC, theme: "light" | "dark") {
  const isDark = theme === "dark";
  const overlayBg = isDark ? "rgba(14,16,20,0.88)" : "rgba(240,242,245,0.92)";

  return StyleSheet.create({
    wrapper: {
      width: "100%",
      paddingVertical: 8,
      paddingHorizontal: 16,
    },

    // ── SHADOW LAYER (no overflow — iOS needs this separate) ──
    cardShadow: {
      borderRadius: 16,
      backgroundColor: c.surface,
      // iOS — coloured glow in dark, crisp depth in light
      shadowColor: c.accentPrimary,
      shadowOffset: { width: 0, height: isDark ? 6 : 10 },
      shadowOpacity: isDark ? 0.28 : 0.16,
      shadowRadius: isDark ? 22 : 20,
      // Android
      elevation: 14,
    },

    // ── CLIP LAYER (overflow:hidden for accent bar + border radius) ──
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      backgroundColor: c.surface,
    },

    accentBar: { height: 3, width: "100%" },
    inner: { padding: 16 },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.9 },
    timerPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: c.errorGlow,
      borderWidth: 1,
      borderColor: c.errorBorder,
    },
    timerText: {
      color: c.errorColor,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    amountPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 9999,
      backgroundColor: c.accentPrimaryGlow,
      borderWidth: 1,
      borderColor: c.accentPrimaryBorder,
    },
    amountText: { color: c.accentPrimary, fontSize: 12, fontWeight: "600" },
    hallName: {
      color: c.accentPrimary,
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: -0.4,
      marginBottom: 6,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 14,
    },
    dateText: { color: c.outline, fontSize: 13 },
    divider: { height: 1, backgroundColor: c.borderSubtle, marginVertical: 12 },
    blocks: { gap: 12 },
    blockItem: { gap: 8 },
    blockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    timeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: c.accentPrimaryGlow,
      borderWidth: 1,
      borderColor: c.accentPrimaryBorder,
    },
    timeText: { color: c.onSurfaceVariant, fontSize: 12, fontWeight: "500" },
    playerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: c.surfaceHigh,
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    playerText: { fontSize: 12, fontWeight: "500" },
    progressBar: {
      height: 4,
      borderRadius: 4,
      backgroundColor: c.borderSubtle,
    },
    confirmedOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      padding: 16,
      //backgroundColor: overlayBg,
      zIndex: 10,
    },
    confirmedViewBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: c.accentPrimaryGlow,
      borderWidth: 1,
      borderColor: c.accentPrimaryBorder,
    },
    expandSection: { overflow: "hidden" },
    section: { marginBottom: 14 },
    sectionLabel: {
      color: c.outline,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    sectionBox: {
      backgroundColor: c.surfaceHigh,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      overflow: "hidden",
    },
    fieldRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: c.borderSubtle },
    fieldLabel: { color: c.outline, fontSize: 13 },
    fieldValue: {
      color: c.onSurfaceVariant,
      fontSize: 13,
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
      marginLeft: 12,
    },
    actions: { gap: 8, marginTop: 4, marginBottom: 8 },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 13,
      borderRadius: 10,
      backgroundColor: c.errorGlow,
      borderWidth: 1,
      borderColor: c.errorBorder,
    },
    cancelBtnText: { color: c.errorColor, fontSize: 14, fontWeight: "600" },
    supportBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 13,
      borderRadius: 10,
      backgroundColor: c.surfaceHigh,
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    supportBtnText: { color: c.outline, fontSize: 14, fontWeight: "500" },
    payBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 13,
      borderRadius: 10,
      backgroundColor: "#007AFF",
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
    },
    payBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    expandBtn: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: c.accentPrimaryGlow,
      borderWidth: 1,
      borderColor: c.accentPrimaryBorder,
    },
    expandBtnText: { color: c.accentPrimary, fontSize: 14, fontWeight: "600" },
  });
}

// ── OrderItem ──────────────────────────────────────────────────────────────
export const OrderItem = React.memo(
  ({ item }: { item: Return_Type }) => {
    const { t } = useTranslation();
    const { colors: Colors, theme } = useTheme();
    const data = item;

    const S = useMemo(
      () => createStyles(Colors as unknown as TC, theme),
      [theme],
    );
    const status = getStatus(
      data.blocks[0].block_booking_status,
      Colors as unknown as TC,
    );

    const expanded = useSharedValue(0);
    const [isOpen, setIsOpen] = useState(false);

    const toggleExpand = () => {
      const next = isOpen ? 0 : 1;
      expanded.value = withTiming(next, {
        duration: 400,
        easing: Easing.inOut(Easing.cubic),
      });
      runOnJS(setIsOpen)(!isOpen);
    };

    const expandedSectionStyle = useAnimatedStyle(() => ({
      maxHeight: withTiming(expanded.value * 1200, {
        duration: 420,
        easing: Easing.inOut(Easing.cubic),
      }),
      opacity: withTiming(expanded.value, {
        duration: 300,
        easing: Easing.inOut(Easing.cubic),
      }),
    }));

    const chevronStyle = useAnimatedStyle(() => {
      const deg = interpolate(expanded.value, [0, 1], [0, 180]);
      return { transform: [{ rotate: `${deg}deg` }] };
    });

    const handleCancel = async (id: string) => {
      try {
        const res = await axiosInstance.post("/auth/bookcancel", {
          transaction_ID: id,
          reason: "Tsag amjihgui bolson",
        });
        if (res.status === 200 && res.data.success) {
          Notifier.showNotification({
            title: "Booking Canceled",
            description: "Your booking has been successfully canceled.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
        } else throw new Error();
      } catch {
        Notifier.showNotification({
          title: "Failed",
          description: "Could not cancel the booking.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    };

    const { minutes, seconds, secondsLeft } = useCountdown(
      data.session_obj?.expireAt,
    );
    const orderLangInit: any = t("orderScreen", { returnObjects: true });
    const isConfirmed = data.blocks[0].block_booking_status === "confirmed";

    const dataDetails = useMemo(
      () => ({
        paymentInfo: [
          {
            label: `${orderLangInit.paymentInfo.paymentMethod}`,
            key: "payment_method",
          },
          {
            label: `${orderLangInit.paymentInfo.totalAmount}`,
            key: "total_amount",
          },
          {
            label: `${orderLangInit.paymentInfo.paymentStatusPaid}`,
            resolve: (d: Return_Type) => (d.full_paid ? "Paid" : "Pending"),
          },
          {
            label: "Continue Pay",
            resolve: (d: Return_Type) =>
              !d.session_obj || d.full_paid ? null : d.session_obj,
          },
        ],
        bookingInfo: [
          {
            label: `${orderLangInit.bookingInfo.date}`,
            resolve: (d: Return_Type) =>
              format(new Date(d.day), "MMMM d, yyyy"),
          },
          {
            label: `${orderLangInit.bookingInfo.time}`,
            resolve: (d: any) =>
              `${format(new Date(d.blocks[0].start_time), "HH:mm")} – ${format(new Date(d.blocks[0].end_time), "HH:mm")}`,
          },
          {
            label: "Status",
            resolve: (d: any) => d.blocks[0].block_booking_status,
          },
          {
            label: `${orderLangInit.bookingInfo.playerNeeded}`,
            resolve: (d: Return_Type) =>
              d.blocks[0].num_players > 0
                ? `${d.blocks[0].current_player} / ${d.blocks[0].num_players}`
                : "–",
          },
        ],
        playerInfo: [
          {
            label: `${orderLangInit.playerInfo.playerName}`,
            resolve: (d: Return_Type) =>
              d.paying_peoples[0].paying_user_info[0].unique_user_ID,
          },
          {
            label: `${orderLangInit.playerInfo.playerContact}`,
            resolve: (d: Return_Type) =>
              d.paying_peoples[0].paying_user_info[0].phoneNumber,
          },
          {
            label: `${orderLangInit.playerInfo.playerPaymentStatus}`,
            resolve: (d: Return_Type) => d.paying_peoples[0].payment_status,
          },
          {
            label: `${orderLangInit.playerInfo.playerPaymentAmount}`,
            resolve: (d: Return_Type) => String(d.paying_peoples[0].amountPaid),
          },
        ],
      }),
      [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const ContinuePayButton = ({ session }: { session: any }) => (
      <TouchableOpacity
        style={S.payBtn}
        activeOpacity={0.8}
        onPress={() => console.log("Pay:", session.token)}
      >
        <MaterialIcons name="payment" size={16} color="#FFFFFF" />
        <Text style={S.payBtnText}>Pay Now</Text>
      </TouchableOpacity>
    );

    return (
      <View style={S.wrapper}>
        {/* ── cardShadow: shadow only, no overflow clipping ── */}
        <View style={S.cardShadow}>
          {/* ── card: overflow:hidden for accent bar + border ── */}
          <View style={S.card}>
            <View style={[S.accentBar, { backgroundColor: status.color }]} />

            <View style={S.inner}>
              {/* Header */}
              <View style={S.header}>
                <View
                  style={[
                    S.statusPill,
                    { backgroundColor: status.bg, borderColor: status.border },
                  ]}
                >
                  <View
                    style={[S.statusDot, { backgroundColor: status.color }]}
                  />
                  <Text style={[S.statusLabel, { color: status.color }]}>
                    {data.blocks[0].block_booking_status.toUpperCase()}
                  </Text>
                </View>

                {data.session_obj && secondsLeft > 0 ? (
                  <View style={S.timerPill}>
                    <FontAwesome
                      name="clock-o"
                      size={12}
                      color={Colors.errorColor}
                    />
                    <Text style={S.timerText}>
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </Text>
                  </View>
                ) : (
                  <View style={S.amountPill}>
                    <Text style={S.amountText}>
                      ₮{Number(data.total_amount).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Hall name */}
              <Text style={S.hallName} numberOfLines={1}>
                {data.zaal_info?.hall_details.hall_name}
              </Text>

              {/* Date */}
              <View style={S.dateRow}>
                <Feather name="calendar" size={12} color={Colors.outline} />
                <Text style={S.dateText}>
                  {format(new Date(data.day), "MMMM d, yyyy")}
                </Text>
              </View>

              <View style={S.divider} />

              {/* Blocks */}
              <View style={S.blocks}>
                {data.blocks.map((block, index) => {
                  const numP = block.num_players === 0 ? 1 : block.num_players;
                  const progress = Math.min(
                    (Number(block.current_player) || 0) / numP,
                    1,
                  );
                  const full =
                    block.num_players > 0 &&
                    block.current_player >= block.num_players;

                  return (
                    <View key={index} style={S.blockItem}>
                      <View style={S.blockRow}>
                        <View style={S.timeChip}>
                          <FontAwesome6
                            name="clock-four"
                            size={11}
                            color={Colors.accentPrimary}
                          />
                          <Text style={S.timeText}>
                            {format(new Date(block.start_time), "HH:mm")}
                            {" – "}
                            {format(new Date(block.end_time), "kk:mm")}
                          </Text>
                        </View>

                        <View
                          style={[
                            S.playerChip,
                            full && {
                              backgroundColor: Colors.successGlow,
                              borderColor: Colors.successBorder,
                            },
                          ]}
                        >
                          <Fontisto
                            name="persons"
                            size={11}
                            color={full ? Colors.successColor : Colors.outline}
                          />
                          <Text
                            style={[
                              S.playerText,
                              {
                                color: full
                                  ? Colors.successColor
                                  : Colors.outline,
                              },
                            ]}
                          >
                            {block.current_player} / {numP}
                          </Text>
                        </View>
                      </View>

                      <ProgressBar
                        progress={progress}
                        color={
                          full ? Colors.successColor : Colors.accentPrimary
                        }
                      />
                    </View>
                  );
                })}
              </View>

              {/* Expandable section */}
              <Animated.View style={[S.expandSection, expandedSectionStyle]}>
                <View style={S.divider} />

                {Object.entries(dataDetails).map(([sectionKey, fields]) => (
                  <View key={sectionKey} style={S.section}>
                    <Text style={S.sectionLabel}>
                      {sectionKey === "paymentInfo"
                        ? orderLangInit.paymentInfo.paymentInfo
                        : sectionKey === "bookingInfo"
                          ? orderLangInit.bookingInfo.bookingInfo
                          : orderLangInit.playerInfo.playerInfo}
                    </Text>

                    <View style={S.sectionBox}>
                      {fields.map((field, fi) => {
                        const value =
                          "resolve" in field &&
                          typeof field.resolve === "function"
                            ? field.resolve(data)
                            : ((data as any)?.[field.key] ?? "");

                        if (field.label === "Continue Pay") {
                          if (!value || secondsLeft <= 0) return null;
                          return (
                            <View key={field.label} style={{ padding: 12 }}>
                              <ContinuePayButton session={value} />
                            </View>
                          );
                        }

                        return (
                          <View
                            key={field.label}
                            style={[
                              S.fieldRow,
                              fi < fields.length - 1 && S.fieldRowBorder,
                            ]}
                          >
                            <Text style={S.fieldLabel}>{field.label}</Text>
                            <Text style={S.fieldValue} numberOfLines={1}>
                              {String(value)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}

                <View style={S.actions}>
                  {data.blocks[0].block_booking_status === "waiting" && (
                    <TouchableOpacity
                      style={S.cancelBtn}
                      activeOpacity={0.8}
                      onPress={() => handleCancel((data as any)._id)}
                    >
                      <Feather
                        name="x-circle"
                        size={15}
                        color={Colors.errorColor}
                      />
                      <Text style={S.cancelBtnText}>
                        {orderLangInit.cancelBooking}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={S.supportBtn} activeOpacity={0.8}>
                    <Feather
                      name="message-circle"
                      size={15}
                      color={Colors.outline}
                    />
                    <Text style={S.supportBtnText}>
                      {orderLangInit.contactCostumerService}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Expand button */}
              <TouchableOpacity
                style={S.expandBtn}
                onPress={toggleExpand}
                activeOpacity={0.8}
              >
                <Text style={S.expandBtnText}>
                  {isOpen ? orderLangInit.close : orderLangInit.viewDetails}
                </Text>
                <Animated.View style={chevronStyle}>
                  <Feather
                    name="chevron-down"
                    size={17}
                    color={Colors.accentPrimary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Confirmed overlay — full card */}
            {isConfirmed && !isOpen && (
              <View style={S.confirmedOverlay}>
                <TouchableOpacity
                  style={S.confirmedViewBtn}
                  onPress={toggleExpand}
                  activeOpacity={0.8}
                >
                  <Text style={S.expandBtnText}>
                    {orderLangInit.viewDetails}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={17}
                    color={Colors.accentPrimary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
  (prev, next) => prev.item._id === next.item._id,
);

// ── BookingSkeleton ────────────────────────────────────────────────────────
export function BookingSkeleton({
  width,
  theme,
}: {
  width: number;
  theme: "light" | "dark";
  color?: any;
}) {
  const { colors: Colors } = useTheme();
  const S = useMemo(
    () => createStyles(Colors as unknown as TC, theme),
    [theme],
  );
  const IW = width - 64;

  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
      <View style={S.cardShadow}>
        <View style={S.card}>
          <View
            style={[S.accentBar, { backgroundColor: Colors.surfaceHighest }]}
          />
          <View style={S.inner}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Skeleton width={112} height={26} radius={13} colorMode={theme} />
              <Skeleton width={84} height={26} radius={13} colorMode={theme} />
            </View>
            <Skeleton
              width={IW * 0.72}
              height={22}
              radius={6}
              colorMode={theme}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Skeleton width={12} height={12} radius={6} colorMode={theme} />
              <Skeleton
                width={IW * 0.38}
                height={12}
                radius={4}
                colorMode={theme}
              />
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: Colors.borderSubtle,
                marginBottom: 14,
              }}
            />
            {[0, 1].map((i) => (
              <View key={i} style={{ marginBottom: 14, gap: 8 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Skeleton
                    width={IW * 0.46}
                    height={28}
                    radius={6}
                    colorMode={theme}
                  />
                  <Skeleton
                    width={72}
                    height={28}
                    radius={6}
                    colorMode={theme}
                  />
                </View>
                <Skeleton width={IW} height={4} radius={2} colorMode={theme} />
              </View>
            ))}
            <View style={{ marginTop: 6 }}>
              <Skeleton width={IW} height={46} radius={10} colorMode={theme} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
