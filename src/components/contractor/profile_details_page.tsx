import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/context/theme_context";

export type ProfileDetailItem = {
  label: string;
  value: string;
  icon: string;
  action?: boolean;
};

type ProfileDetailsPageProps = {
  title: string;
  description: string;
  items: ProfileDetailItem[];
};

export default function ProfileDetailsPage({
  title,
  description,
  items,
}: ProfileDetailsPageProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={{ padding: 6, marginRight: 10 }}
        >
          <Feather name="arrow-left" size={24} color={colors.themeColorTextPure} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.themeColorTextPure, fontSize: 23, fontWeight: "700" }}>
            {title}
          </Text>
          <Text style={{ color: colors.darkGrey, fontSize: 13, marginTop: 3 }}>
            {description}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: colors.containerColor,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {items.map((item, index) => (
            <View
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 17,
                borderBottomWidth: index === items.length - 1 ? 0 : 0.5,
                borderBottomColor: colors.darkGrey,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.backgroundColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name={item.icon as any} size={19} color="#4dabff" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: colors.themeColorTextPure, fontSize: 16, fontWeight: "600" }}>
                  {item.label}
                </Text>
                <Text style={{ color: colors.darkGrey, fontSize: 14, marginTop: 3 }}>
                  {item.value}
                </Text>
              </View>
              {item.action && <Feather name="chevron-right" size={20} color={colors.darkGrey} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
