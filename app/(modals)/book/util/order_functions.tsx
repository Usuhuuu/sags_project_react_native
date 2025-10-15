import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Return_Type } from "@/interfaces/order&book_type";
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export const OrderItem = React.memo(({ item }: { item: Return_Type }) => {
  const expanded = useSharedValue(0);
  const toggleExpand = () => {
    expanded.value = withTiming(expanded.value === 0 ? 1 : 0, {
      duration: 300,
    });
  };
  const animatedCardStyle = useAnimatedStyle(() => ({
    height: expanded.value === 0 ? 120 : 400, // collapsed → expanded
    overflow: "hidden",
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: expanded.value,
    transform: [{ translateY: expanded.value ? 0 : 20 }],
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
          description: "PISDA",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
      } else if (response.status === 400 && !response.data.success) {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err: any) {
      if (err.response.status === 400 && !err.response.data.success) {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    }
  };

  return (
    <View
      style={{
        width: "100%",
        padding: 10,
      }}
    >
      <View
        style={{
          padding: 20,
          marginVertical: 10,
          backgroundColor: Colors.white,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 400 }}>
          {data.zaal_info.name}
        </Text>
        <Text style={style.texts}>
          {format(new Date(data.day[0]), "MMMM d, yyyy")}
        </Text>

        {/* Time and Payment status wait */}
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View style={{ flexDirection: "row", width: "50%", gap: 3 }}>
            <FontAwesome6 name="clock-four" size={15} color={Colors.darkGrey} />
            <Text style={style.texts}>{data.blocks[0].start_time}</Text>
            <Text style={style.texts}>~</Text>
            <Text style={style.texts}>{data.blocks[0].end_time}</Text>
          </View>
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
                  data.blocks[0].num_players ===
                    data.blocks[0].current_player &&
                  data.blocks[0].num_players !== 0
                    ? Colors.green
                    : Colors.warningYellow,
                padding: 4,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  borderRadius: 10,
                  color:
                    data.blocks[0].num_players ===
                      data.blocks[0].current_player &&
                    data.blocks[0].num_players !== 0
                      ? Colors.greenText
                      : Colors.yellowText,
                }}
              >
                {data.booking_status}
              </Text>
            </View>
          </View>
        </View>
        {/* Partner needed Section */}
        {data.blocks[0].num_players > 0 && (
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
                <Fontisto name="persons" size={15} color={Colors.darkGrey} />
                <Text style={style.texts}>
                  {data.blocks[0].current_player.toString()}
                </Text>
                <Text style={style.texts}>/</Text>
                <Text style={style.texts}>
                  {data.blocks[0].num_players.toString()}
                </Text>
              </View>

              {/* Pending or Complete */}
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
                      data.blocks[0].num_players ===
                        data.blocks[0].current_player &&
                      data.blocks[0].num_players !== 0
                        ? Colors.green
                        : Colors.warningYellow,
                    padding: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      borderRadius: 10,
                      color:
                        data.blocks[0].num_players ===
                          data.blocks[0].current_player &&
                        data.blocks[0].num_players !== 0
                          ? Colors.greenText
                          : Colors.yellowText,
                    }}
                  >
                    {data.blocks[0].num_players ===
                      data.blocks[0].current_player &&
                    data.blocks[0].num_players !== 0
                      ? "Complete"
                      : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
            <ProgressBar
              progress={
                data.blocks[0].current_player / data.blocks[0].num_players
              }
              color={Colors.primary}
            />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TouchableOpacity style={{}}>
            <Text
              style={{ color: Colors.primary, fontWeight: 500, fontSize: 20 }}
            >
              View Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{}}
            onPress={() => {
              handleCancel(item._id);
            }}
          >
            <Text style={{ color: "#991B1B", fontWeight: 500, fontSize: 20 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const style = StyleSheet.create({
  texts: {
    color: Colors.darkGrey,
  },
});
