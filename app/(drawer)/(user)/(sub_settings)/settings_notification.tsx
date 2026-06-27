import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, ScrollView, Text, Switch } from "react-native";

const NotificationSettingsComponent = () => {
  const { colors, theme } = useTheme();

  const NotificationSections = [
    {
      header: "Essentials",
      items: [
        {
          id: "pauseAll",
          icon: {
            name: "notifications-off",
            color: "#ef4444",
            bgColor: "#3a1f23",
          },
          label: "Pause All",
          description: "Temporarily disable alerts",
          type: "toggle",
        },
        {
          id: "bookingReminders",
          icon: {
            name: "calendar",
            color: "#3b82f6",
            bgColor: "#1e293b",
          },
          label: "Booking Reminders",
          description: "Alerts 15 mins before",
          type: "toggle",
        },
        {
          id: "sessionExpiry",
          icon: {
            name: "alarm",
            color: "#60a5fa",
            bgColor: "#172554",
          },
          label: "Session Expiry",
          description: "Notify when time runs out",
          type: "toggle",
        },
      ],
    },
    {
      header: "Social & Community",
      items: [
        {
          id: "chatMessages",
          icon: {
            name: "chatbubble",
            color: "#8b5cf6",
            bgColor: "#2e1065",
          },
          label: "Chat Messages",
          description: "DMs from friends",
          type: "toggle",
        },
        {
          id: "friendActivity",
          icon: {
            name: "people",
            color: "#6366f1",
            bgColor: "#1e1b4b",
          },
          label: "Friend Activity",
          description: "When friends come online",
          type: "toggle",
        },
      ],
    },
    {
      header: "Updates & Offers",
      items: [
        {
          id: "promotions",
          icon: {
            name: "pricetag",
            color: "#10b981",
            bgColor: "#064e3b",
          },
          label: "Promotions",
          description: "Discounts and special offers",
          type: "toggle",
        },
        {
          id: "tournaments",
          icon: {
            name: "trophy",
            color: "#f59e0b",
            bgColor: "#78350f",
          },
          label: "Tournaments",
          description: "Local competitions",
          type: "toggle",
        },
      ],
    },
  ];

  const initialState = Object.fromEntries(
    NotificationSections.flatMap((s) => s.items.map((i) => [i.id, true])),
  );

  const [values, setValues] = useState<Record<string, boolean>>(initialState);

  const toggle = (id: string) =>
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      contentContainerStyle={{ padding: 20 }}
    >
      {NotificationSections.map((section) => (
        <View key={section.header} style={{ marginBottom: 24 }}>
          {/* SECTION HEADER */}
          <Text
            style={{
              color: "#6f7680",
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            {section.header.toUpperCase()}
          </Text>

          {/* ITEMS */}
          {section.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.containerColor,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.icon.bgColor ?? "#1f2630",
                  }}
                >
                  <Ionicons
                    name={item.icon.name as any}
                    size={20}
                    color={item.icon.color}
                  />
                </View>

                <View>
                  <AppText
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </AppText>
                  {item.description && (
                    <Text
                      style={{
                        color: "#8a8f98",
                        fontSize: 12,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>

              {item.type === "toggle" && (
                <Switch
                  value={values[item.id]}
                  onValueChange={() => {
                    toggle(item.id);
                  }}
                  trackColor={{
                    false: "#2a2f36",
                    true: "#3b82f6",
                  }}
                  thumbColor="#fff"
                />
              )}
            </View>
          ))}
        </View>
      ))}

      <Text
        style={{
          marginTop: 10,
          color: "#6f7680",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        Some notifications may be disabled in your device settings.{" "}
        <Text style={{ color: "#3b82f6" }}>Open System Settings</Text>
      </Text>
    </ScrollView>
  );
};
export default NotificationSettingsComponent;
