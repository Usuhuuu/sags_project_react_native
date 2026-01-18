import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
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
import { ProgressBar } from "react-native-paper";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { Return_Type } from "@/interfaces/order&book_type";
import axiosInstance from "@/hooks/axiosInstance";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/themeContext";
import AppText from "@/constants/appTextDefault";

export const OrderItem = React.memo(
  ({ item }: { item: Return_Type }) => {
    const { colors: Colors, theme } = useTheme();

    const data = item;
    const expanded = useSharedValue(0);
    const textOpacity = useSharedValue(1);
    const [toggle, setToggle] = useState(false);

    const toggleExpand = () => {
      textOpacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setToggle)(!toggle);
        textOpacity.value = withTiming(1, { duration: 150 });
      });
      expanded.value = withTiming(expanded.value === 0 ? 1 : 0, {
        duration: 50,
      });
    };
    const blockCount = data?.blocks?.length;
    const perBlockHeight = 60 * blockCount;

    const animatedCardStyle = useAnimatedStyle(() => {
      const baseHeight = 600 + perBlockHeight;
      const isConfirmed =
        data?.blocks?.[0]?.block_booking_status === "confirmed";

      let extra = 50;
      if (isConfirmed) extra = 50;
      const expandedHeight = perBlockHeight + baseHeight + extra;
      const notExtendedHeight = perBlockHeight + extra;

      return {
        height: withTiming(
          interpolate(
            expanded.value,
            [0, 1],
            [200 + notExtendedHeight, expandedHeight],
            Extrapolate.CLAMP
          ),
          {
            duration: 100,
            easing: Easing.inOut(Easing.cubic),
          }
        ),
      };
    });

    const animatedContentStyle = useAnimatedStyle(() => {
      const isExpanding = expanded.value === 1;

      const opacity = withTiming(expanded.value, {
        duration: isExpanding ? 400 : 150,
        easing: Easing.inOut(Easing.cubic),
      });

      const translateY = withTiming(
        interpolate(expanded.value, [0, 1], [10, 0]),
        { duration: 300, easing: Easing.inOut(Easing.cubic) }
      );

      return {
        opacity,
        transform: [{ translateY }],
      };
    });
    const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value,
    }));

    const handleCancel = async (item: string) => {
      try {
        const response = await axiosInstance.post("/auth/bookcancel", {
          transaction_ID: item,
          reason: "Tsag amjihgui bolson",
        });
        if (response.status === 200 && response.data.success) {
          Notifier.showNotification({
            title: "Successfully Canceled Order",
            description: "Your booking has been canceled.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
        } else {
          Notifier.showNotification({
            title: "Failed",
            description: "Couldn't find order.",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
        }
      } catch (err: any) {
        Notifier.showNotification({
          title: "Failed",
          description: "Couldn't find order.",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    };
    const { t } = useTranslation();

    const orderLangInit: any = t("orderScreen", { returnObjects: true });

    const useCountdown = (expireAt?: string | Date) => {
      const [secondsLeft, setSecondsLeft] = useState(() => {
        if (expireAt === undefined || expireAt === null) return 0;
        const diff = differenceInSeconds(new Date(expireAt), new Date());
        return Math.max(isNaN(diff) ? 0 : diff, 0);
      });

      useEffect(() => {
        if (expireAt === undefined || expireAt === null) {
          setSecondsLeft(0);
          return;
        }

        const interval = setInterval(() => {
          const raw = differenceInSeconds(new Date(expireAt), new Date());
          const sec = Math.max(isNaN(raw) ? 0 : raw, 0);
          setSecondsLeft(sec);

          if (sec <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
      }, [expireAt]);

      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      return { minutes, seconds, secondsLeft };
    };

    const { minutes, seconds, secondsLeft } = useCountdown(
      data.session_obj?.expireAt
    );

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
            resolve: (data: Return_Type) =>
              `${data.full_paid ? "Paid" : "Pending"}`,
          },
          {
            label: "Continue Pay",
            resolve: (data: Return_Type) => {
              if (!data.session_obj || data.full_paid) return null;
              return data.session_obj;
            },
          },
        ],
        bookingInfo: [
          {
            label: `${orderLangInit.bookingInfo.date}`,
            resolve: (data: Return_Type) =>
              `${format(new Date(data.day), "MMMM d, yyyy")}`,
          },
          {
            label: `${orderLangInit.bookingInfo.time}`,
            resolve: (data: any) =>
              `${format(data.blocks[0].start_time, "HH:mm")} ~ ${
                format(data.blocks[0].end_time, "HH:mm") ?? ""
              }`,
          },
          {
            label: "Status",
            resolve: (data: any) => `${data.blocks[0].block_booking_status}`,
          },
          {
            label: `${orderLangInit.bookingInfo.playerNeeded}`,
            resolve: (data: Return_Type) =>
              `${
                data.blocks[0].num_players > 0
                  ? data.blocks[0].current_player / data.blocks[0].num_players
                  : ""
              }`,
          },
        ],
        playerInfo: [
          {
            label: `${orderLangInit.playerInfo.playerName}`,
            resolve: (data: Return_Type) =>
              `${data.paying_peoples[0].paying_user_info[0].unique_user_ID}`,
          },

          {
            label: `${orderLangInit.playerInfo.playerContact}`,
            resolve: (data: Return_Type) =>
              `${data.paying_peoples[0].paying_user_info[0].phoneNumber}`,
          },
          {
            label: `${orderLangInit.playerInfo.playerPaymentStatus}`,
            resolve: (data: Return_Type) =>
              `${data.paying_peoples[0].payment_status}`,
          },
          {
            label: `${orderLangInit.playerInfo.playerPaymentAmount}`,
            resolve: (data: Return_Type) =>
              `${data.paying_peoples[0].amountPaid}`,
          },
        ],
      }),
      []
    );

    const ContinuePayButton = ({ session }: any) => {
      return (
        <TouchableOpacity
          style={{
            backgroundColor: Colors.green,
            alignItems: "center",
            padding: 10,
            borderRadius: 10,
            flexDirection: "row",
            justifyContent: "center",
            gap: 5,
          }}
          onPress={() => console.log("Pay:", session.token)}
        >
          <MaterialIcons name="payment" size={24} color={Colors.white} />
          <AppText style={{ fontWeight: "bold", fontSize: 16 }}>
            Pay Now
          </AppText>
        </TouchableOpacity>
      );
    };

    return (
      <View
        style={{ width: "100%", paddingVertical: 20, paddingHorizontal: 5 }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: Colors.containerColor,
              shadowColor: Colors.shadowColor,
              shadowOffset: { width: 1, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
              borderRadius: 10,
              padding: 5,
            },
            animatedCardStyle,
          ]}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              padding: 15,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                gap: 10,
                height: "100%",
              }}
            >
              <View style={{ height: "70%" }}>
                {/* Basic Info */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: "rgba(59,130,246,0.15)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: Colors.primary,
                      }}
                    />
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 12,
                        fontWeight: "600",
                        letterSpacing: 0.5,
                      }}
                    >
                      {data.blocks[0].block_booking_status.toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "#FF4D4F",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {data.session_obj && secondsLeft > 0
                      ? `⏱ ${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
                      : Number(data.total_amount)}
                  </Text>
                </View>

                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "400",
                        color: Colors.themeColorTextPure,
                      }}
                    >
                      {data.zaal_info.hall_details.hall_name}
                    </Text>
                  </View>
                  <Text style={{ color: Colors.themeColorTextSecondary }}>
                    {format(new Date(data.day), "MMMM d, yyyy")}
                  </Text>
                  {data.blocks.map((block, index) => (
                    <View
                      key={index}
                      style={{
                        marginBottom: 8,
                        maxHeight: 45,
                        minHeight: 45,
                      }}
                    >
                      {/* Time Row */}
                      <View style={{ flexDirection: "row" }}>
                        <View
                          style={{
                            flexDirection: "row",
                            width: "50%",
                            gap: 3,
                          }}
                        >
                          <FontAwesome6
                            name="clock-four"
                            size={15}
                            color={Colors.themeColorTextSecondary}
                          />
                          <Text
                            style={{ color: Colors.themeColorTextSecondary }}
                          >
                            {format(new Date(block.start_time), "HH:mm")}
                          </Text>
                          <Text
                            style={{ color: Colors.themeColorTextSecondary }}
                          >
                            ~
                          </Text>
                          <Text
                            style={{ color: Colors.themeColorTextSecondary }}
                          >
                            {format(new Date(block.end_time), "kk:mm")}
                          </Text>
                        </View>
                      </View>

                      {/* Player Info */}
                      <View style={{ flexDirection: "column" }}>
                        <View style={{ flexDirection: "row" }}>
                          <View
                            style={{
                              flexDirection: "row",
                              width: "50%",
                              gap: 3,
                              padding: 4,
                            }}
                          >
                            <Fontisto
                              name="persons"
                              size={15}
                              color={Colors.themeColorTextSecondary}
                            />
                            <Text
                              style={{
                                color: Colors.themeColorTextSecondary,
                              }}
                            >
                              {block.current_player}
                            </Text>
                            <Text
                              style={{
                                color: Colors.themeColorTextSecondary,
                              }}
                            >
                              /
                            </Text>
                            <Text
                              style={{
                                color: Colors.themeColorTextSecondary,
                              }}
                            >
                              {block.num_players == 0
                                ? (block.num_players += 1)
                                : block.num_players}
                            </Text>
                          </View>

                          {/* Status badge */}
                          {/* <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor:
                                  block.num_players === block.current_player &&
                                  block.num_players !== 0
                                    ? Colors.green
                                    : Colors.warningYellow,
                                padding: 2,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                              }}
                            >
                              <Text
                                style={{
                                  borderRadius: 10,
                                  color:
                                    block.num_players ===
                                      block.current_player &&
                                    block.num_players !== 0
                                      ? Colors.white
                                      : Colors.yellowText,
                                }}
                              >
                                {block.num_players === block.current_player &&
                                block.num_players !== 0
                                  ? `${orderLangInit.confirmed}`
                                  : `${orderLangInit.waiting}`}
                              </Text>
                            </View>
                          </View> */}
                        </View>

                        {/* Progress bar */}
                        <View style={{ marginTop: 5 }}>
                          <ProgressBar
                            progress={
                              block.num_players > 0
                                ? block.current_player / block.num_players
                                : 1
                            }
                            color={Colors.primary}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
                {/* Expandable Details Section */}
                <Animated.View style={[animatedContentStyle]}>
                  <View style={{ height: "auto" }}>
                    <View style={{ flexDirection: "column" }}>
                      {Object.entries(dataDetails).map(
                        ([sectionKey, fields]) => (
                          <View
                            key={`${sectionKey}`}
                            style={{ marginBottom: 10 }}
                          >
                            <Text
                              style={{
                                fontWeight: "600",
                                marginBottom: 6,
                                color: Colors.themeColorTextPure,
                              }}
                            >
                              {sectionKey === "paymentInfo"
                                ? `${orderLangInit.paymentInfo.paymentInfo}`
                                : sectionKey === "bookingInfo"
                                ? `${orderLangInit.bookingInfo.bookingInfo}`
                                : `${orderLangInit.playerInfo.playerInfo}`}
                            </Text>
                            {fields.map((field) => {
                              const value =
                                "resolve" in field &&
                                typeof field.resolve === "function"
                                  ? field.resolve(data)
                                  : (data as any)?.[field.key] ?? "";
                              if (field.label === "Continue Pay" && value) {
                                return (
                                  <View
                                    key={field.label}
                                    style={{
                                      paddingVertical: secondsLeft > 0 ? 10 : 0,
                                    }}
                                  >
                                    <ContinuePayButton session={value} />
                                  </View>
                                );
                              }
                              return (
                                <View
                                  key={field.label}
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.themeColorTextSecondary,
                                    }}
                                  >
                                    {field.label}
                                  </Text>
                                  <Text
                                    style={{
                                      color: Colors.themeColorTextSecondary,
                                    }}
                                  >
                                    {value}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {data.blocks[0].block_booking_status === "waiting" && (
                        <TouchableOpacity
                          style={{
                            padding: 10,
                            backgroundColor: "#FF4433",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 5,
                          }}
                        >
                          <View>
                            <Text style={{ color: Colors.containerColor }}>
                              {orderLangInit.cancelBooking}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={{
                          padding: 10,
                          backgroundColor:
                            theme === "dark" ? Colors.darkGrey : Colors.grey,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 5,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              color:
                                theme === "dark"
                                  ? Colors.themeColorTextSecondary
                                  : Colors.dark,
                            }}
                          >
                            {orderLangInit.contactCostumerService}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
                {item.blocks[0].block_booking_status === "confirmed" && (
                  <View
                    style={{
                      zIndex: 1,
                      position: "absolute",
                      height: "100%",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        padding: 20,
                        borderRadius: 20,
                        borderColor: "red",
                        borderWidth: 1,
                        width: "60%",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "red",
                          fontSize: 20,
                          fontWeight: 500,
                        }}
                      >
                        {orderLangInit.alreadyPlayed}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={toggleExpand}
                    style={{
                      width: "100%",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: Colors.themeColorTextPure,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 10,
                    }}
                  >
                    <Animated.View
                      style={[
                        {
                          flexDirection: "row",
                          width: "100%",
                          justifyContent: "space-between",
                        },
                        animatedTextStyle,
                      ]}
                    >
                      <Text
                        style={{
                          color: Colors.themeColorTextPure,
                          fontWeight: "500",
                          fontSize: 18,
                        }}
                      >
                        {!toggle
                          ? `${orderLangInit.viewDetails}`
                          : `${orderLangInit.close}`}
                      </Text>
                      {!toggle ? (
                        <Feather
                          name="arrow-down"
                          size={24}
                          color={Colors.themeColorTextPure}
                        />
                      ) : (
                        <Feather
                          name="arrow-up"
                          size={24}
                          color={Colors.themeColorTextPure}
                        />
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.item._id === nextProps.item._id;
  }
);
