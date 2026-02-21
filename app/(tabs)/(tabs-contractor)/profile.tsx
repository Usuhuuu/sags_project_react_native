import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import {
  Search,
  MapPin,
  Users,
  Calendar,
  User,
  Briefcase,
  CreditCard,
  ShieldCheck,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "@/app/(modals)/context/authContext";

// --- Types ---
interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
}

// --- Data ---
const PROFILE_STATS: StatItem[] = [
  {
    label: "Total Venues:",
    value: "3",
    icon: <MapPin size={18} color="#4dabff" />,
  },
  {
    label: "Staff Members:",
    value: "12",
    icon: <Users size={18} color="#4dabff" />,
  },
  {
    label: "Years Active:",
    value: "5",
    icon: <Calendar size={18} color="#4dabff" />,
  },
];

const MENU_ITEMS: MenuItem[] = [
  { title: "Personal Information", icon: <User size={22} color="#aaa" /> },
  { title: "Business Credentials", icon: <Briefcase size={22} color="#aaa" /> },
  { title: "Payment Methods", icon: <CreditCard size={22} color="#aaa" /> },
  { title: "Security", icon: <ShieldCheck size={22} color="#aaa" /> },
];

const ContractorProfile = () => {
  const { logOut } = useAuth();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.searchBar}>
            <Search size={18} color="#666" />
            <TextInput
              placeholder="Search users or zones..."
              placeholderTextColor="#666"
              style={styles.input}
            />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow} />
            <Image
              source={{ uri: "https://i.imgur.com/8Km9tLL.png" }} // Placeholder for Marc Andreessen
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>Marc Andreessen</Text>
          <Text style={styles.userRole}>Senior Hall Manager</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          {PROFILE_STATS.map((item, index) => (
            <View key={index} style={styles.statItem}>
              {item.icon}
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Settings Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.menuLeft}>
                {item.icon}
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert(
              "Confirm Action",
              "Are you sure you want to Log Out?",
              [
                {
                  text: "No",
                  onPress: () => console.log("CANCEL"),
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => logOut(),
                },
              ],
              { cancelable: false },
            )
          }
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020a17" },
  scrollContent: { paddingBottom: 120 },

  header: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: { flex: 1, color: "#fff", marginLeft: 10 },

  profileInfo: { alignItems: "center", marginTop: 30 },
  avatarContainer: {
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#4dabff",
    shadowColor: "#4dabff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  avatar: { width: 115, height: 115, borderRadius: 57.5 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 15 },
  userRole: { color: "#666", fontSize: 16, marginTop: 4 },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { color: "#666", fontSize: 10, marginTop: 8 },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 2 },

  menuCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { color: "#fff", fontSize: 16, marginLeft: 15 },

  logoutButton: {
    margin: 20,
    height: 55,
    borderRadius: 15,
    backgroundColor: "rgba(255, 107, 107, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { color: "#ff6b6b", fontSize: 16, fontWeight: "bold" },

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

export default ContractorProfile;
