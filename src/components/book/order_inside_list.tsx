import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Feather,
  FontAwesome,
  FontAwesome6,
  Fontisto,
  MaterialIcons,
} from "@expo/vector-icons";
import { format, differenceInSeconds } from "date-fns";
import { showToast } from "@/utils/toast";
import { useTranslation } from "react-i18next";

import { Return_Type } from "@/types/book_type";
import axiosInstance from "@/hooks/axiosInstance";
import { useTheme } from "@/context/theme_context";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

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

type StatusCfg = {
  color: string;
  bg: string;
  border: string;
};

type ProgressBarProps = {
  progress: number;
  color: string;
  trackColor?: string;
};

type CountdownResult = {
  minutes: number;
  seconds: number;
  secondsLeft: number;
};

/* -------------------------------------------------------------------------- */
/*                              PROGRESS BAR                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              STATUS CONFIG                                 */
/* -------------------------------------------------------------------------- */

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

    cancelled: {
      color: c.errorColor,
      bg: c.errorGlow,
      border: c.errorBorder,
    },
  };

  return (
    map[status] ?? {
      color: c.accentPrimary,
      bg: c.accentPrimaryGlow,
      border: c.accentPrimaryBorder,
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                                COUNTDOWN                                   */
/* -------------------------------------------------------------------------- */

/**
 * One countdown interval per OrderItem.
 *
 * This avoids creating separate intervals inside:
 * - TimerOrAmountPill
 * - ContinuePayField
 */
function useCountdown(expireAt?: string | Date): CountdownResult {
  const getSecondsLeft = useCallback(() => {
    if (!expireAt) return 0;

    const seconds = differenceInSeconds(new Date(expireAt), new Date());

    return Math.max(Number.isNaN(seconds) ? 0 : seconds, 0);
  }, [expireAt]);

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft());

    if (!expireAt) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = getSecondsLeft();

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expireAt, getSecondsLeft]);

  return useMemo(
    () => ({
      minutes: Math.floor(secondsLeft / 60),
      seconds: secondsLeft % 60,
      secondsLeft,
    }),
    [secondsLeft],
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SHIMMER                                   */
/* -------------------------------------------------------------------------- */

const Shimmer = React.memo(
  ({
    width,
    height,
    radius = 6,
  }: {
    width: number;
    height: number;
    radius?: number;
  }) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        true,
      );
    }, [shimmer]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
    }));

    return (
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: "#e0e0e0",
          },
          animatedStyle,
        ]}
      />
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                         TIMER / AMOUNT PILL                                */
/* -------------------------------------------------------------------------- */

const TimerOrAmountPill = React.memo(
  ({
    secondsLeft,
    minutes,
    seconds,
    errorColor,
    surfaceHighest,
    amountText,
  }: CountdownResult & {
    errorColor: string;
    surfaceHighest: string;
    amountText: string;
  }) => {
    if (secondsLeft > 0) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: surfaceHighest,
            borderWidth: 1,
            borderColor: errorColor,
          }}
        >
          <FontAwesome name="clock-o" size={12} color={errorColor} />

          <Text
            style={{
              color: errorColor,
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: surfaceHighest,
          borderWidth: 1,
          borderColor: surfaceHighest,
        }}
      >
        <Text
          style={{
            color: amountText.startsWith("-") ? errorColor : "#fff",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {amountText}
        </Text>
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                             CONTINUE PAY                                  */
/* -------------------------------------------------------------------------- */

const ContinuePayField = React.memo(
  ({
    session,
    secondsLeft,
    payBtnStyle,
    payBtnTextStyle,
  }: {
    session: any;
    secondsLeft: number;
    payBtnStyle: any;
    payBtnTextStyle: any;
  }) => {
    if (!session || secondsLeft <= 0) {
      return null;
    }

    return (
      <View style={{ padding: 12 }}>
        <TouchableOpacity
          style={payBtnStyle}
          activeOpacity={0.8}
          onPress={() => {
            console.log("Pay:", session.token);
          }}
        >
          <MaterialIcons name="payment" size={16} color="#FFFFFF" />

          <Text style={payBtnTextStyle}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                              STYLE FACTORY                                 */
/* -------------------------------------------------------------------------- */

function createStyles(c: TC, theme: "light" | "dark") {
  const isDark = theme === "dark";

  return StyleSheet.create({
    wrapper: {
      width: "100%",
      paddingVertical: 8,
      paddingHorizontal: 16,
    },

    cardShadow: {
      borderRadius: 16,
      backgroundColor: c.surface,

      shadowColor: c.accentPrimary,
      shadowOffset: {
        width: 0,
        height: isDark ? 6 : 10,
      },
      shadowOpacity: isDark ? 0.28 : 0.16,
      shadowRadius: isDark ? 22 : 20,

      elevation: 14,
    },

    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
      backgroundColor: c.surface,
    },

    accentBar: {
      height: 3,
      width: "100%",
    },

    inner: {
      padding: 16,
    },

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

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    statusLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.9,
    },

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

    dateText: {
      color: c.outline,
      fontSize: 13,
    },

    divider: {
      height: 1,
      backgroundColor: c.borderSubtle,
      marginVertical: 12,
    },

    blocks: {
      gap: 12,
    },

    blockItem: {
      gap: 8,
    },

    blockRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

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

    timeText: {
      color: c.onSurfaceVariant,
      fontSize: 12,
      fontWeight: "500",
    },

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

    playerText: {
      fontSize: 12,
      fontWeight: "500",
    },

    confirmedOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      padding: 16,
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

    expandSection: {
      overflow: "hidden",
    },

    section: {
      marginBottom: 14,
    },

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

    fieldRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },

    fieldLabel: {
      color: c.outline,
      fontSize: 13,
    },

    fieldValue: {
      color: c.onSurfaceVariant,
      fontSize: 13,
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
      marginLeft: 12,
    },

    actions: {
      gap: 8,
      marginTop: 4,
      marginBottom: 8,
    },

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

    cancelBtnText: {
      color: c.errorColor,
      fontSize: 14,
      fontWeight: "600",
    },

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

    supportBtnText: {
      color: c.outline,
      fontSize: 14,
      fontWeight: "500",
    },

    payBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 13,
      borderRadius: 10,
      backgroundColor: "#007AFF",

      shadowColor: "#007AFF",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.5,
      shadowRadius: 16,

      elevation: 10,
    },

    payBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

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

    expandBtnText: {
      color: c.accentPrimary,
      fontSize: 14,
      fontWeight: "600",
    },

    progressBar: {
      height: 4,
      borderRadius: 4,
      backgroundColor: c.borderSubtle,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                                ORDER ITEM                                  */
/* -------------------------------------------------------------------------- */

const OrderItemComponent = ({ item }: { item: Return_Type }) => {
  const { t, i18n } = useTranslation();
  const { colors: Colors, theme } = useTheme();

  const data = item;

  const S = useMemo(
    () => createStyles(Colors as unknown as TC, theme),
    [Colors, theme],
  );

  const firstBlock = data.blocks?.[0];

  const status = getStatus(
    firstBlock?.block_booking_status ?? "",
    Colors as unknown as TC,
  );

  const [isOpen, setIsOpen] = useState(false);

  const expanded = useSharedValue(0);
  const animatedMaxHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const countdown = useCountdown(data.session_obj?.expireAt);

  const toggleExpand = useCallback(() => {
    const next = isOpen ? 0 : 1;

    expanded.value = withTiming(next, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });

    animatedMaxHeight.value = withTiming(next * 1200, {
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
    });

    animatedOpacity.value = withTiming(next, {
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
    });

    setIsOpen((previous) => !previous);
  }, [isOpen, expanded, animatedMaxHeight, animatedOpacity]);

  const expandedSectionStyle = useAnimatedStyle(
    () => ({
      maxHeight: animatedMaxHeight.value,
      opacity: animatedOpacity.value,
    }),
    [],
  );

  const chevronStyle = useAnimatedStyle(() => {
    const deg = interpolate(expanded.value, [0, 1], [0, 180]);

    return {
      transform: [
        {
          rotate: `${deg}deg`,
        },
      ],
    };
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    try {
      const res = await axiosInstance.post("/auth/bookcancel", {
        transaction_ID: id,
        reason: "Tsag amjihgui bolson",
      });

      if (res.status === 200 && res.data.success) {
        showToast({
          title: "Booking Canceled",
          description: "Your booking has been successfully canceled.",
          alertType: "success",
        });
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch {
      showToast({
        title: "Failed",
        description: "Could not cancel the booking.",
        alertType: "error",
      });
    }
  }, []);

  const orderLangInit: any = useMemo(
    () =>
      t("orderScreen", {
        returnObjects: true,
      }),
    [t, i18n.language],
  );

  const isConfirmed = firstBlock?.block_booking_status === "confirmed";

  const dataDetails = useMemo(
    () => ({
      paymentInfo: [
        {
          label: orderLangInit.paymentInfo.paymentMethod,
          key: "payment_method",
        },

        {
          label: orderLangInit.paymentInfo.totalAmount,
          key: "total_amount",
        },

        {
          label: orderLangInit.paymentInfo.paymentStatusPaid,

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
          label: orderLangInit.bookingInfo.date,

          resolve: (d: Return_Type) => format(new Date(d.day), "MMMM d, yyyy"),
        },

        {
          label: orderLangInit.bookingInfo.time,

          resolve: (d: Return_Type) =>
            `${format(new Date(d.blocks[0].start_time), "HH:mm")} – ${format(
              new Date(d.blocks[0].end_time),
              "HH:mm",
            )}`,
        },

        {
          label: "Status",

          resolve: (d: Return_Type) => d.blocks[0].block_booking_status,
        },

        {
          label: orderLangInit.bookingInfo.playerNeeded,

          resolve: (d: Return_Type) =>
            d.blocks[0].num_players > 0
              ? `${d.blocks[0].current_player} / ${d.blocks[0].num_players}`
              : "–",
        },
      ],

      playerInfo: [
        {
          label: orderLangInit.playerInfo.playerName,

          resolve: (d: Return_Type) =>
            d.paying_peoples?.[0]?.paying_user_info?.[0]?.unique_user_ID ?? "–",
        },

        {
          label: orderLangInit.playerInfo.playerContact,

          resolve: (d: Return_Type) =>
            d.paying_peoples?.[0]?.paying_user_info?.[0]?.phoneNumber ?? "–",
        },

        {
          label: orderLangInit.playerInfo.playerPaymentStatus,

          resolve: (d: Return_Type) =>
            d.paying_peoples?.[0]?.payment_status ?? "–",
        },

        {
          label: orderLangInit.playerInfo.playerPaymentAmount,

          resolve: (d: Return_Type) =>
            String(d.paying_peoples?.[0]?.amountPaid ?? "–"),
        },
      ],
    }),
    [orderLangInit],
  );

  return (
    <View style={S.wrapper}>
      <View style={S.cardShadow}>
        <View style={S.card}>
          {/* Accent */}
          <View
            style={[
              S.accentBar,
              {
                backgroundColor: status.color,
              },
            ]}
          />

          <View style={S.inner}>
            {/* Header */}
            <View style={S.header}>
              <View
                style={[
                  S.statusPill,
                  {
                    backgroundColor: status.bg,
                    borderColor: status.border,
                  },
                ]}
              >
                <View
                  style={[
                    S.statusDot,
                    {
                      backgroundColor: status.color,
                    },
                  ]}
                />

                <Text
                  style={[
                    S.statusLabel,
                    {
                      color: status.color,
                    },
                  ]}
                >
                  {(firstBlock?.block_booking_status ?? "").toUpperCase()}
                </Text>
              </View>

              <TimerOrAmountPill
                {...countdown}
                errorColor={Colors.errorColor}
                surfaceHighest={Colors.surfaceHighest}
                amountText={`₮${Number(data.total_amount).toLocaleString()}`}
              />
            </View>

            {/* Hall name */}
            <Text style={S.hallName} numberOfLines={1}>
              {data.zaal_info?.hall_details?.hall_name}
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
                const numPlayers =
                  block.num_players === 0 ? 1 : block.num_players;

                const progress = Math.min(
                  (Number(block.current_player) || 0) / numPlayers,
                  1,
                );

                const full =
                  block.num_players > 0 &&
                  block.current_player >= block.num_players;

                return (
                  <View
                    key={`${block.start_time}-${index}`}
                    style={S.blockItem}
                  >
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
                          {block.current_player} / {numPlayers}
                        </Text>
                      </View>
                    </View>

                    <ProgressBar
                      progress={progress}
                      color={full ? Colors.successColor : Colors.accentPrimary}
                      trackColor={Colors.borderSubtle}
                    />
                  </View>
                );
              })}
            </View>

            {/* Details are mounted only while open */}
            {isOpen && (
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
                      {fields.map((field: any, fieldIndex) => {
                        const value =
                          "resolve" in field &&
                          typeof field.resolve === "function"
                            ? field.resolve(data)
                            : ((data as any)?.[field.key] ?? "");

                        if (field.label === "Continue Pay") {
                          return (
                            <ContinuePayField
                              key={field.label}
                              session={value}
                              secondsLeft={countdown.secondsLeft}
                              payBtnStyle={S.payBtn}
                              payBtnTextStyle={S.payBtnText}
                            />
                          );
                        }

                        return (
                          <View
                            key={field.label}
                            style={[
                              S.fieldRow,
                              fieldIndex < fields.length - 1 &&
                                S.fieldRowBorder,
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
                  {firstBlock?.block_booking_status === "waiting" && (
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
            )}

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

          {/* Confirmed overlay */}
          {isConfirmed && !isOpen && (
            <View style={S.confirmedOverlay}>
              <TouchableOpacity
                style={S.confirmedViewBtn}
                onPress={toggleExpand}
                activeOpacity={0.8}
              >
                <Text style={S.expandBtnText}>{orderLangInit.viewDetails}</Text>

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
};

/* -------------------------------------------------------------------------- */
/*                              MEMO COMPARATOR                               */
/* -------------------------------------------------------------------------- */

export const OrderItem = React.memo(OrderItemComponent, (prev, next) => {
  const previous = prev.item;
  const current = next.item;

  return (
    previous._id === current._id &&
    previous.total_amount === current.total_amount &&
    previous.full_paid === current.full_paid &&
    previous.session_obj?.expireAt === current.session_obj?.expireAt &&
    previous.blocks?.[0]?.block_booking_status ===
      current.blocks?.[0]?.block_booking_status &&
    previous.blocks?.[0]?.current_player === current.blocks?.[0]?.current_player
  );
});

/* -------------------------------------------------------------------------- */
/*                            BOOKING SKELETON                                */
/* -------------------------------------------------------------------------- */

export function BookingSkeleton({
  width,
  theme,
}: {
  width: number;
  theme: "light" | "dark";
}) {
  const { colors: Colors } = useTheme();

  const S = useMemo(
    () => createStyles(Colors as unknown as TC, theme),
    [Colors, theme],
  );

  const innerWidth = width - 64;

  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <View style={S.cardShadow}>
        <View style={S.card}>
          <View
            style={[
              S.accentBar,
              {
                backgroundColor: Colors.surfaceHighest,
              },
            ]}
          />

          <View style={S.inner}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Shimmer width={112} height={26} radius={13} />

              <Shimmer width={84} height={26} radius={13} />
            </View>

            <Shimmer width={innerWidth * 0.72} height={22} radius={6} />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Shimmer width={12} height={12} radius={6} />

              <Shimmer width={innerWidth * 0.38} height={12} radius={4} />
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: Colors.borderSubtle,
                marginBottom: 14,
              }}
            />

            {[0, 1].map((index) => (
              <View
                key={index}
                style={{
                  marginBottom: 14,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Shimmer width={innerWidth * 0.46} height={28} radius={6} />

                  <Shimmer width={72} height={28} radius={6} />
                </View>

                <Shimmer width={innerWidth} height={4} radius={2} />
              </View>
            ))}

            <View
              style={{
                marginTop: 6,
              }}
            >
              <Shimmer width={innerWidth} height={46} radius={10} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
