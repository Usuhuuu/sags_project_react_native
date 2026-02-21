import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Search } from "lucide-react-native";
import { RQ_regular_cache_key, useRegularQuery } from "@/hooks/useQuery";
import { useAuth } from "@/app/(modals)/context/authContext";
import { ContractorBookingType } from "@/interfaces/contractorResponseType";
import { format } from "date-fns";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { useIsFocused } from "@react-navigation/native";

// --- Types ---
type BookingStatus = "Checked In" | "Confirmed";
type BookingType = "UPCOMING" | "ACTIVE" | "HISTORY";

interface TabItem {
  id: BookingType;
  label: string;
}

const ContractorBooking = () => {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "ACTIVE" | "HISTORY">(
    "UPCOMING",
  );
  const [search, setSearch] = useState("");
  const { LoginStatus } = useAuth();
  const [bookingType, setBookingType] = useState<BookingType>("UPCOMING");
  const [page, setPages] = useState<Record<BookingType, number>>({
    ["UPCOMING"]: 1,
    ["HISTORY"]: 1,
    ["ACTIVE"]: 1,
  });
  const [bookingData, setBookingData] = useState<{
    UPCOMING: ContractorBookingType[];
    HISTORY: ContractorBookingType[];
    ACTIVE: ContractorBookingType[];
  }>({
    UPCOMING: [],
    HISTORY: [],
    ACTIVE: [],
  });

  const dayString = new Date().toISOString().split("T")[0];

  const cacheKey = [
    "contractor_order",
    bookingType,
    page[bookingType],
    dayString,
  ] as const satisfies RQ_regular_cache_key;

  const isFocused = useIsFocused();
  const { data, error, isLoading } = useRegularQuery(
    {
      pathname: `/auth/contractor/book/${bookingType}?startTime=${encodeURI(new Date().toISOString())}&page=${page[bookingType]}`,
      cacheKey: cacheKey,
      loginStatus: LoginStatus,
    },
    {
      enabled: isFocused,
    },
  );

  useEffect(() => {
    if (data?.success && data.contractorData) {
      setBookingData((prev) => {
        const incoming = data.contractorData?.book ?? [];

        if (!incoming.length) return prev;

        const existing = prev[activeTab];

        const map = new Map<string, ContractorBookingType>();

        // keep old
        for (const item of existing) {
          if (!item._id) continue;
          map.set(item._id, item);
        }

        // add new page
        for (const item of incoming) {
          if (!item._id) continue;
          map.set(item._id, item);
        }

        return {
          ...prev,
          [activeTab]: Array.from(map.values()),
        };
      });
    }
  }, [data, error]);

  const bookingStatusDetail: TabItem[] = [
    {
      id: "UPCOMING",
      label: "Upcoming",
    },
    {
      id: "ACTIVE",
      label: "Active",
    },
    {
      id: "HISTORY",
      label: "Completed",
    },
  ];

  const renderBookingItem = useCallback(
    ({ item }: { item: ContractorBookingType }) => <BookingCard item={item} />,
    [],
  );
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Container with Glass Effect */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Bookings</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search users or zones..."
            placeholderTextColor="#666"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          {bookingStatusDetail.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                setBookingType(tab.id);
              }}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookingData[activeTab] ?? []}
        keyExtractor={(item, index) => item?._id ?? `${index}`}
        ListEmptyComponent={() => {
          return <></>;
        }}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const BookingCard = React.memo(({ item }: { item: ContractorBookingType }) => {
  const { colors } = useTheme();
  const width = Dimensions.get("window").width;
  return (
    <View style={styles.card}>
      {item.blocks?.map((block, blockIndex) => (
        <View key={blockIndex} style={styles.cardHeader}>
          <View style={{ width: width * 0.55 }}>
            <Text style={styles.userName}>
              {block.current_player_list?.[0]?.unique_user_ID ?? "No User"}
            </Text>

            <Text
              style={{ color: "#666", fontSize: 13, width: width * 0.5 }}
              numberOfLines={2}
            >
              {format(block.start_time, "PPP HH:mm")} {" -\n"}
              {format(block.end_time, "PPP HH:mm")}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              block.block_booking_status === "confirmte"
                ? styles.badgeActive
                : styles.badgeInactive,
              {
                width: width * 0.25,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                block.block_booking_status === "confirmte"
                  ? styles.badgeTextActive
                  : styles.badgeTextInactive,
              ]}
            >
              {block.block_booking_status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020a17" },
  headerContainer: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 14 },

  tabWrapper: { paddingHorizontal: 20, marginVertical: 20 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 25,
    padding: 4,
    justifyContent: "space-between",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20 },
  activeTab: { backgroundColor: "rgba(77, 171, 255, 0.1)" },
  tabText: { color: "#666", fontSize: 14, fontWeight: "500" },
  activeTabText: { color: "#4dabff" },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4dabff",
    position: "absolute",
    bottom: -10,
    shadowColor: "#4dabff",
    shadowRadius: 10,
    shadowOpacity: 1,
  },

  listContent: { padding: 20 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  zoneText: { color: "#aaa", fontSize: 14, marginBottom: 4 },
  timeText: { color: "#666", fontSize: 13 },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeInactive: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  badgeActive: {
    borderColor: "#4dabff",
    backgroundColor: "rgba(77, 171, 255, 0.1)",
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextInactive: { color: "#666" },
  badgeTextActive: { color: "#4dabff" },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    shadowColor: "#4dabff",
    shadowRadius: 15,
    shadowOpacity: 0.5,
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
    height: 85,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  activeIconWrapper: { marginBottom: 4 },
  activeIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4dabff",
    shadowRadius: 10,
    shadowOpacity: 0.6,
  },
  navLabel: { color: "#666", fontSize: 10, marginTop: 4 },
  navLabelActive: { color: "#4dabff" },
});

export default ContractorBooking;
