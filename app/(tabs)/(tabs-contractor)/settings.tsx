import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import {
  ArrowLeft,
  Sliders,
  Bell,
  Globe,
  FileText,
  Shield,
  Moon,
  MessageSquare,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react-native";

// --- Types ---
interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  type: "navigation" | "switch";
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  isLast?: boolean;
}

const ContractorSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Group 1: General Preferences */}
        <View style={styles.groupCard}>
          <SettingItem
            icon={<Sliders size={20} color="#aaa" />}
            label="App Preferences"
            type="navigation"
          />
          <SettingItem
            icon={<Bell size={20} color="#aaa" />}
            label="Notification Settings"
            type="navigation"
          />
          <SettingItem
            icon={<Globe size={20} color="#aaa" />}
            label="Language"
            type="navigation"
            isLast
          />
        </View>

        {/* Group 2: Legal */}
        <View style={styles.groupCard}>
          <SettingItem
            icon={<FileText size={20} color="#aaa" />}
            label="Terms & Conditions"
            type="navigation"
          />
          <SettingItem
            icon={<Shield size={20} color="#aaa" />}
            label="Privacy Policy"
            type="navigation"
            isLast
          />
        </View>

        {/* Group 3: Toggles */}
        <View style={styles.groupCard}>
          <SettingItem
            icon={<Moon size={20} color="#aaa" />}
            label="Dark Mode"
            type="switch"
            value={isDarkMode}
            onValueChange={setIsDarkMode}
          />
          <SettingItem
            icon={<MessageSquare size={20} color="#aaa" />}
            label="Push Notifications"
            type="switch"
            value={isPushEnabled}
            onValueChange={setIsPushEnabled}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-Components ---

const SettingItem = ({
  icon,
  label,
  type,
  value,
  onValueChange,
  isLast,
}: SettingItemProps) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={[styles.itemRow, isLast && { borderBottomWidth: 0 }]}
    disabled={type === "switch"}
  >
    <View style={styles.itemLeft}>
      {icon}
      <Text style={styles.itemLabel}>{label}</Text>
    </View>

    {type === "navigation" ? (
      <ChevronRight size={20} color="#555" />
    ) : (
      <View style={value ? styles.switchGlowContainer : null}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#1a2536", true: "#4dabff" }}
          thumbColor="#fff"
          ios_backgroundColor="#1a2536"
        />
      </View>
    )}
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020a17" },
  header: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: { marginBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#fff" },

  scrollContent: { padding: 20, paddingBottom: 120 },

  groupCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  itemLabel: { color: "#fff", fontSize: 16, marginLeft: 15 },

  // Switch Glow Effect
  switchGlowContainer: {
    shadowColor: "#4dabff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5, // For Android glow
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#050f1f",
    borderTopWidth: 1,
    borderTopColor: "#1a2536",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  activeNavCircle: { marginBottom: 5 },
  gradientCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4dabff",
    shadowRadius: 10,
    shadowOpacity: 0.6,
  },
  navLabel: { color: "#666", fontSize: 10, marginTop: 4 },
  navLabelActive: { color: "#4dabff" },
});

export default ContractorSettings;
