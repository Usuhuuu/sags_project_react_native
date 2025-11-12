import React, { useState } from "react";
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
import { Feather, FontAwesome6, Fontisto } from "@expo/vector-icons";
import { format } from "date-fns";
import { ProgressBar } from "react-native-paper";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { Return_Type } from "@/interfaces/order&book_type";
import axiosInstance from "@/hooks/axiosInstance";
import Colors from "@/constants/Colors";
import { useTranslation } from "react-i18next";

export const OrderItem = React.memo(({ item }: { item: Return_Type }) => {
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
  const blockCount = item?.blocks?.length;
  const perBlockHeight = 60 * blockCount;

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(
        interpolate(
          expanded.value,
          [0, 1],
          [
            200 + perBlockHeight,
            item.blocks[0].block_booking_status === "confirmed"
              ? 600 + perBlockHeight
              : 600 + perBlockHeight + 50,
          ],
          Extrapolate.CLAMP
        ),
        { duration: 100, easing: Easing.inOut(Easing.cubic) }
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

  const data = item;

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
  const dataDetails = {
    paymentInfo: [
      {
        label: `${orderLangInit.paymentInfo.paymentStatusPaid}`,
        resolve: (data: Return_Type) =>
          `${data.full_paid ? "Paid" : "Pending"}`,
      },
      {
        label: `${orderLangInit.paymentInfo.paymentMethod}`,
        key: "payment_method",
      },
      {
        label: `${orderLangInit.paymentInfo.totalAmount}`,
        key: "total_amount",
      },
    ],
    bookingInfo: [
      {
        label: `${orderLangInit.bookingInfo.date}`,
        resolve: (data: Return_Type) =>
          `${format(new Date(data.day[0]), "MMMM d, yyyy")}`,
      },
      {
        label: `${orderLangInit.bookingInfo.time}`,
        resolve: (data: any) =>
          `${data?.blocks[0]?.[0]?.start_time ?? ""} ~ ${
            data?.blocks[0]?.[0]?.end_time ?? ""
          }`,
      },
      { label: "Status", key: "block_booking_status" },
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
        resolve: (data: Return_Type) => `${data.paying_peoples[0].amountPaid}`,
      },
    ],
  };

  return (
    <View style={{ width: "100%", padding: 10 }}>
      <Animated.View
        style={[
          {
            padding: 20,
            backgroundColor:
              data.blocks[0].block_booking_status === "confirmed"
                ? Colors.grey
                : Colors.white,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
            gap: 10,
          },
          animatedCardStyle,
        ]}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
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
            <View style={{ height: "70%", gap: 20 }}>
              {/* Basic Info */}
              <View style={{ gap: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: "400" }}>
                  {data.zaal_info.name}
                </Text>
                <Text style={{ color: Colors.darkGrey }}>
                  {format(new Date(data.day[0]), "MMMM d, yyyy")}
                </Text>

                {data.blocks.map((block, index) => (
                  <View
                    key={index}
                    style={{ marginBottom: 8, maxHeight: 45, minHeight: 45 }}
                  >
                    {/* Time Row */}
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{ flexDirection: "row", width: "50%", gap: 3 }}
                      >
                        <FontAwesome6
                          name="clock-four"
                          size={15}
                          color={Colors.darkGrey}
                        />
                        <Text style={{ color: Colors.darkGrey }}>
                          {block.start_time}
                        </Text>
                        <Text style={{ color: Colors.darkGrey }}>~</Text>
                        <Text style={{ color: Colors.darkGrey }}>
                          {block.end_time}
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
                            color={Colors.darkGrey}
                          />
                          <Text style={{ color: Colors.darkGrey }}>
                            {block.current_player > 0
                              ? block.current_player
                              : 1}
                          </Text>
                          <Text style={{ color: Colors.darkGrey }}>/</Text>
                          <Text style={{ color: Colors.darkGrey }}>
                            {block.num_players + 1}
                          </Text>
                        </View>

                        {/* Status badge */}
                        <View
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
                            }}
                          >
                            <Text
                              style={{
                                borderRadius: 10,
                                color:
                                  block.num_players === block.current_player &&
                                  block.num_players !== 0
                                    ? Colors.littleDark
                                    : Colors.yellowText,
                              }}
                            >
                              {block.num_players === block.current_player &&
                              block.num_players !== 0
                                ? `${orderLangInit.confirmed}`
                                : `${orderLangInit.waiting}`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Progress bar */}
                      <ProgressBar
                        progress={
                          block.num_players > 0
                            ? (block.current_player + 1) /
                              (block.num_players + 1)
                            : 1
                        }
                        color={Colors.primary}
                      />
                    </View>
                  </View>
                ))}
              </View>
              {/* Expandable Details Section */}
              <Animated.View style={[animatedContentStyle]}>
                <View style={{ height: "auto" }}>
                  <View style={{ flexDirection: "column" }}>
                    {Object.entries(dataDetails).map(([sectionKey, fields]) => (
                      <View
                        key={`${sectionKey}-${Math.random()}`}
                        style={{ marginBottom: 10 }}
                      >
                        <Text style={{ fontWeight: "600", marginBottom: 6 }}>
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

                          return (
                            <View
                              key={field.label}
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <Text style={{ color: Colors.darkGrey }}>
                                {field.label}
                              </Text>
                              <Text style={{ color: Colors.dark }}>
                                {value.toString()}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}
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
                          <Text style={{ color: Colors.white }}>
                            {orderLangInit.cancelBooking}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={{
                        padding: 10,
                        backgroundColor: Colors.lightGrey,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                      }}
                    >
                      <View>
                        <Text style={{ color: Colors.darkGrey }}>
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
                      style={{ color: "red", fontSize: 20, fontWeight: 500 }}
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
                    borderColor: Colors.littleDarkGrey,
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
                        color: Colors.dark,
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
                        color={Colors.dark}
                      />
                    ) : (
                      <Feather name="arrow-up" size={24} color={Colors.dark} />
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
});
