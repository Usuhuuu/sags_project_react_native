import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { LayoutGrid, ChevronDown, Check } from "lucide-react-native";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { RQ_regular_cache_key, useRegularQuery } from "@/hooks/useQuery";
import { useAuth } from "@/app/(modals)/context/authContext";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

// --- Types ---
type TimeFilter = "today" | "7d" | "30d" | "this_month" | "custom";

interface ZoneProps {
  name: string;
  percentage: number;
  bookings: number;
}

type KPIKey = "totalRevenue" | "totalBookings" | "activeUsers";

const ZonesData: ZoneProps[] = [
  { name: "VIP Lounge", percentage: 92, bookings: 184 },
  { name: "PC Zone A", percentage: 88, bookings: 176 },
  { name: "Console Arena", percentage: 81, bookings: 162 },
  { name: "Racing Simulators", percentage: 75, bookings: 150 },
];

const ContractorIndex = () => {
  const { colors } = useTheme();
  const { LoginStatus } = useAuth();
  const filterDetails: Record<
    TimeFilter,
    { label: string; getRange: () => { start: Date; end: Date } }
  > = {
    today: {
      label: "Today",
      getRange: () => ({
        start: dayjs().startOf("day").toDate(),
        end: dayjs().endOf("day").toDate(),
      }),
    },

    "7d": {
      label: "7d",
      getRange: () => ({
        start: dayjs().subtract(7, "day").startOf("day").toDate(),
        end: dayjs().endOf("day").toDate(),
      }),
    },

    "30d": {
      label: "30d",
      getRange: () => ({
        start: dayjs().subtract(30, "day").startOf("day").toDate(),
        end: dayjs().endOf("day").toDate(),
      }),
    },

    this_month: {
      label: "This Month",
      getRange: () => ({
        start: dayjs().startOf("month").toDate(),
        end: dayjs().endOf("month").toDate(),
      }),
    },

    custom: {
      label: "Custom",
      getRange: () => ({
        start: new Date(0), // placeholder
        end: new Date(),
      }),
    },
  };

  const [filter, setFilter] = useState<TimeFilter>("30d");
  const [filterDates, setFilterDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>(filterDetails["30d"].getRange());
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [kpiData, setKpiData] = useState<
    Record<KPIKey, { value: number; change: string }>
  >({
    totalRevenue: { value: 0, change: "0%" },
    totalBookings: { value: 0, change: "0%" },
    activeUsers: { value: 0, change: "0%" },
  });
  const [trendType, setTrendType] = useState<"week" | "day">("week");
  const [trendData, setTrendData] = useState<
    { label: string; revenue: number }[]
  >([]);

  const cacheKey = ["contractor_main"] as const satisfies RQ_regular_cache_key;
  const query =
    filterDates.start && filterDates.end
      ? `?start=${filterDates.start.toISOString()}&end=${filterDates.end.toISOString()}`
      : "";

  const isfocused = useIsFocused();
  const { data, error, isLoading } = useRegularQuery(
    {
      pathname: `/auth/contractor/kpi${query}`,
      cacheKey: cacheKey,
      loginStatus: LoginStatus,
    },
    {
      enabled: isfocused,
    },
  );

  useEffect(() => {
    if (data && data.success) {
      const returnData = data.contractorData;
      setKpiData({
        totalRevenue: {
          value: returnData?.statistic.totalRevenue?.value ?? 0,
          change: returnData?.statistic.totalRevenue?.change ?? "",
        },
        totalBookings: {
          value: returnData?.statistic.totalBookings?.value ?? 0,
          change: returnData?.statistic.totalBookings?.change ?? "",
        },
        activeUsers: {
          value: returnData?.statistic.averageBookingValue?.value ?? 0,
          change: returnData?.statistic.averageBookingValue?.change ?? "",
        },
      });
      const chartData = returnData?.statistic.trend?.map((item) => ({
        label: new Date(item._id).toLocaleDateString(),
        revenue: item.revenue,
      }));
      setTrendData(chartData ?? []);
      setTrendType(returnData?.statistic.trendType ?? "week");
    }
  }, [data, error, isLoading]);
  const screenWidth = Dimensions.get("window").width;

  const filterOptions: TimeFilter[] = [
    "today",
    "7d",
    "30d",
    "this_month",
    "custom",
  ];
  const kpiRenderDetail: { key: KPIKey; titleLabel: string }[] = [
    {
      key: "totalRevenue",
      titleLabel: "Total Revenue",
    },
    {
      key: "totalBookings",
      titleLabel: "Total Bookings",
    },
    {
      key: "activeUsers",
      titleLabel: "Active Users",
    },
  ];

  const handleSelectFilter = (selected: TimeFilter) => {
    setFilter(selected);
    const { start, end } = filterDetails[selected].getRange();
    setFilterDates({
      start: start,
      end: end,
    });
    setIsMenuVisible(false);
    if (selected === "custom") {
      // Trigger Date Picker logic here
      console.log("Open Date Picker");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Business Insights</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsMenuVisible(true)}
          >
            <Text style={styles.dropdownText}>
              {filter === "30d"
                ? "Last 30 Days"
                : filter === "7d"
                  ? "Last 7 Days"
                  : filter}
            </Text>
            <ChevronDown size={16} color="#4dabff" />
          </TouchableOpacity>
        </View>

        {/* Filter Selection Modal */}
        <Modal
          visible={isMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                <Text style={styles.menuHeader}>Select Range</Text>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.menuItem}
                    onPress={() => handleSelectFilter(option)}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        filter === option && styles.menuItemTextActive,
                      ]}
                    >
                      {option === "30d"
                        ? "Last 30 Days"
                        : option === "7d"
                          ? "Last 7 Days"
                          : option}
                    </Text>
                    {filter === option && <Check size={16} color="#4dabff" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          {kpiRenderDetail.map((item, index) => {
            const data = kpiData[item.key];
            return (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statTitle}>{item.titleLabel}</Text>
                <Text style={styles.statValue}>{data.value}</Text>
                <View style={styles.changeRow}>
                  <Feather
                    name={
                      Number(data.change) > 0 ? "trending-up" : "trending-down"
                    }
                    size={screenWidth * 0.04}
                    color={colors.primary}
                  />
                  <Text style={styles.statChange}>
                    {data.change}
                    <Text style={styles.subtext}>this period</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Booking Trends Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Booking Trends</Text>
          <LineChart
            data={{
              labels:
                trendData.length > 0
                  ? trendData.map((_, index) =>
                      trendType === "week"
                        ? `Week ${index + 1}`
                        : `Day ${index + 1}`,
                    )
                  : [""],
              datasets: [
                {
                  data:
                    trendData.length > 0
                      ? trendData.map((item) => Number(item.revenue) || 0)
                      : [0],
                },
              ],
            }}
            width={screenWidth - 70}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>

        {/* Top Performing Zones */}
        <View style={styles.zonesSection}>
          <View style={styles.sectionHeader}>
            <LayoutGrid size={18} color="#4dabff" />
            <Text style={styles.sectionTitle}> Top Performing Zones</Text>
          </View>

          {/* ... existing Zones mapping ... */}
          {ZonesData.map((zone, index) => (
            <View key={index} style={styles.zoneItem}>
              <View style={styles.zoneTextRow}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zonePercentage}>{zone.percentage}%</Text>
              </View>
              <View style={styles.progressBg}>
                <LinearGradient
                  colors={["#007aff", "#00d4ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${zone.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.zoneSubtext}>{zone.bookings} Bookings</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#0a1324",
  backgroundGradientTo: "#0a1324",
  color: (opacity = 1) => `rgba(77, 171, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`,
  strokeWidth: 3,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#4dabff" },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020a17" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    zIndex: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77, 171, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(77, 171, 255, 0.3)",
  },
  dropdownText: { color: "#4dabff", marginRight: 5, fontSize: 12 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "80%",
    backgroundColor: "#0a1324",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#4dabff",
    shadowRadius: 20,
    shadowOpacity: 0.2,
  },
  menuHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  menuItemText: { color: "#aaa", fontSize: 16 },
  menuItemTextActive: { color: "#4dabff", fontWeight: "bold" },

  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    width: "31%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statTitle: { color: "#aaa", fontSize: 10, marginBottom: 8 },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  changeRow: { flexDirection: "row", alignItems: "center" },
  statChange: { color: "#4dabff", fontSize: 10, marginLeft: 3 },
  subtext: { color: "#666" },

  chartSection: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  chart: { marginVertical: 8, borderRadius: 16, alignSelf: "center" },

  zonesSection: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  zoneItem: { marginBottom: 18 },
  zoneTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  zoneName: { color: "#fff", fontSize: 14 },
  zonePercentage: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  zoneSubtext: {
    color: "#666",
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
});

export default ContractorIndex;
