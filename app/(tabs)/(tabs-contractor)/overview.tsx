import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { User, Settings, CalendarDays } from "lucide-react-native";

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
  const [activities, setActivities] = useState(LIVE_ACTIVITY_DATA);

  const toggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Glassmorphism Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Business Overview</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <User size={24} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Primary Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Today's Revenue</Text>
            <View style={styles.valueRow}>
              <Text style={styles.statValue}>$1,250.00</Text>
              <View style={styles.glowDot} />
            </View>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Current Occupancy</Text>
            <View style={styles.valueRow}>
              <Text style={styles.statValue}>85%</Text>
              <View style={styles.glowDot} />
            </View>
          </View>
        </View>

        {/* Live Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Activity</Text>
          <View style={styles.underline} />

          {activities.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <Text style={styles.activityMainText}>
                {item.name}:{" "}
                <Text style={styles.activitySubText}>{item.timeLeft}</Text>
              </Text>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleActivity(item.id)}
                trackColor={{ false: "#1a2536", true: "#4dabff" }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Bottom Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Settings size={32} color="#aaa" />
            <Text style={styles.actionLabel}>Manage Zones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <CalendarDays size={32} color="#aaa" />
            <Text style={styles.actionLabel}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020a17" },
  scrollPadding: { paddingBottom: 120 },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

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

  section: { paddingHorizontal: 25, marginTop: 10 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
  underline: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 12,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  activityMainText: { color: "#fff", fontSize: 18 },
  activitySubText: { color: "#666" },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  actionBtn: { alignItems: "center" },
  actionLabel: { color: "#aaa", marginTop: 10, fontSize: 14 },

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
