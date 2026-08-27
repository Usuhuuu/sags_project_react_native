import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme_context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import {
  DrawerActions,
  useNavigation,
} from "expo-router/build/react-navigation";

// --- TypeScript Types ---
interface ActivityItem {
  id: string;
  name: string;
  timeLeft: string;
  isActive: boolean;
}

// --- Dynamic Data ---
const LIVE_ACTIVITY_DATA: ActivityItem[] = [
  { id: "1", name: "PC-08", timeLeft: "45m left", isActive: true },
  { id: "2", name: "PC-12", timeLeft: "20m left", isActive: true },
  { id: "3", name: "Console-03", timeLeft: "1h 15m left", isActive: true },
];

const ContractorOverview = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [activities, setActivities] = useState(LIVE_ACTIVITY_DATA);

  const toggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item,
      ),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Glassmorphism Header */}
        <View
          style={{
            padding: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 4, width: 4 },
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.themeColorTextPure,
            }}
          >
            Business Overview
          </Text>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.containerColor,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              navigation.dispatch(DrawerActions.openDrawer());
            }}
          >
            <Ionicons name="menu-outline" size={24} color={colors.darkGrey} />
          </TouchableOpacity>
        </View>

        {/* Primary Stats Row */}
        <View
          style={{
            padding: 25,
            marginTop: 20,
          }}
        >
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <View style={styles.valueRow}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.themeColorTextPure,
                  },
                ]}
              >
                $1,250.00
              </Text>
              <View style={styles.glowDot} />
            </View>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Current Occupancy</Text>
            <View style={styles.valueRow}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: colors.themeColorTextPure,
                  },
                ]}
              >
                85%
              </Text>
              <View style={styles.glowDot} />
            </View>
          </View>
        </View>

        {/* Live Activity Section */}
        <View
          style={{
            paddingHorizontal: 25,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: colors.themeColorTextPure,
              fontSize: 20,
              fontWeight: "600",
            }}
          >
            Live Activity
          </Text>
          <View
            style={{
              height: 1,
              backgroundColor: colors.containerColor,
              marginVertical: 12,
            }}
          />

          {activities.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.containerColor,
              }}
            >
              <Text
                style={[
                  {
                    color: colors.themeColorTextPure,
                    fontSize: 18,
                  },
                ]}
              >
                {item.name}:{" "}
                <Text
                  style={[
                    {
                      color: colors.darkGrey,
                    },
                  ]}
                >
                  {item.timeLeft}
                </Text>
              </Text>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleActivity(item.id)}
                trackColor={{ false: colors.darkGrey, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Bottom Quick Actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 40,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity style={{ alignItems: "center" }}>
            <Ionicons name="settings" size={24} color={colors.darkGrey} />
            <Text
              style={{ color: colors.darkGrey, marginTop: 10, fontSize: 14 }}
            >
              Manage Zones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: "center" }}>
            <FontAwesome5
              name="calendar-alt"
              size={32}
              color={colors.darkGrey}
            />
            <Text
              style={{ color: colors.darkGrey, marginTop: 10, fontSize: 14 }}
            >
              Schedule
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  statsContainer: { padding: 25, marginTop: 20 },
  statBlock: { marginBottom: 30 },
  statLabel: { color: "#666", fontSize: 16, marginBottom: 8 },
  valueRow: { flexDirection: "row", alignItems: "center" },
  statValue: { color: "#fff", fontSize: 34, fontWeight: "bold" },
  glowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4dabff",
    marginLeft: 15,
    shadowColor: "#4dabff",
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5,
  },

  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#050f1f",
    borderTopWidth: 1,
    borderTopColor: "#1a2536",
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  activeGlowContainer: { marginBottom: 5 },
  activeIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4dabff",
    shadowRadius: 8,
    shadowOpacity: 0.6,
  },
  navLabel: { color: "#666", fontSize: 11, marginTop: 4 },
  navLabelActive: { color: "#4dabff" },
});

export default ContractorOverview;
