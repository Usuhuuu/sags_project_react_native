import React, { useEffect, useState } from "react";
import {
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
import AppText from "@/constants/appTextDefault";

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
  const { colors, theme } = useTheme();
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
  const [peekTime, setPeekTime] = useState<string>("");

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
      const chartData = returnData?.statistic.trend?.map((item: any) => ({
        label: new Date(item._id).toLocaleDateString(),
        revenue: item.revenue,
      }));
      setTrendData(chartData ?? []);
      const formatted = `${(returnData?.statistic.peakHour ?? 0)?.toString().padStart(2, "0")}:00 - ${(returnData?.statistic.peakHour ?? 0 + 1).toString().padStart(2, "0")}:00`;
      setPeekTime(formatted);
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
  const [start, end] = peekTime.split("-");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.themeColorTextPure,
            }}
          >
            Business Insights
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.backgroundColor,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
            onPress={() => setIsMenuVisible(true)}
          >
            <Text
              style={{ color: colors.primary, marginRight: 5, fontSize: 12 }}
            >
              {filter === "30d"
                ? "Last 30 Days"
                : filter === "7d"
                  ? "Last 7 Days"
                  : filter}
            </Text>
            <ChevronDown size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal
          visible={isMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "80%",
                  backgroundColor: "#0a1324",
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  shadowColor: "#4dabff",
                  shadowRadius: 20,
                  shadowOpacity: 0.2,
                }}
              >
                <Text
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                    textAlign: "center",
                  }}
                >
                  Select Range
                </Text>

                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleSelectFilter(option)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <Text
                      style={{
                        color: filter === option ? "#4dabff" : "#aaa",
                        fontSize: 16,
                        fontWeight: filter === option ? "bold" : "normal",
                      }}
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          {kpiRenderDetail.map((item, index) => {
            const data = kpiData[item.key];
            return (
              <View
                key={index}
                style={{
                  width: "31%",
                  backgroundColor: colors.containerColor,
                  padding: 12,
                  borderRadius: 16,
                  shadowColor: colors.shadowColor,
                  shadowOpacity: 0.4,
                  shadowOffset: { height: 1, width: 0.4 },
                }}
              >
                <Text style={{ color: "#aaa", fontSize: 10, marginBottom: 8 }}>
                  {item.titleLabel}
                </Text>

                <Text
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 5,
                  }}
                >
                  {data.value}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather
                    name={
                      Number(data.change) > 0 ? "trending-up" : "trending-down"
                    }
                    size={screenWidth * 0.04}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 10,
                      marginLeft: 3,
                    }}
                  >
                    {data.change}
                    <Text style={{ color: "#666" }}> this period</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Chart Section */}
        <View
          style={{
            backgroundColor: colors.containerColor,
            borderRadius: 20,
            padding: 15,
            marginBottom: 25,
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 1, width: 0.4 },
          }}
        >
          <Text
            style={{
              color: colors.themeColorTextPure,
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 15,
            }}
          >
            Booking Trends
          </Text>

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
            chartConfig={{
              backgroundGradientFrom: colors.containerColor,
              backgroundGradientTo: colors.containerColor,
              color: (opacity = 1) => `rgba(77, 171, 255, ${opacity})`,
              labelColor: (opacity = 1) =>
                theme === "dark"
                  ? `rgba(255, 255, 255, ${opacity * 0.5})`
                  : colors.themeColorTextPure,
              strokeWidth: 3,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#4dabff" },
            }}
            bezier
            formatYLabel={(value) => `${Number(value) / 1000}k`}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              alignSelf: "center",
            }}
            withDots={true}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 25,
          }}
        >
          <View
            style={{
              height: 180,
              width: "50%",
              padding: 3,
              shadowOffset: { height: 1, width: 0.4 },
              shadowColor: colors.shadowColor,
              shadowOpacity: 0.4,
            }}
          >
            <View
              style={{
                backgroundColor: colors.containerColor,
                flex: 1,
                padding: 12,
                borderRadius: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
              >
                <Feather
                  name="clock"
                  size={18}
                  color={colors.themeColorTextPure}
                />
                <Text
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Peak Hours
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  marginVertical: 5,
                  shadowOffset: { height: 1, width: 0.4 },
                  shadowColor: colors.shadowColor,
                  shadowOpacity: 0.4,
                }}
              >
                <AppText
                  style={{
                    fontSize: 25,
                    fontWeight: "700",
                    marginLeft: 10,
                    marginTop: 10,
                    width: screenWidth * 0.25,
                  }}
                >
                  {start}
                  {"\n"}
                  <AppText style={{ fontSize: 18, color: colors.darkGrey }}>
                    to {end}
                  </AppText>
                </AppText>
              </View>
              <View
                style={{
                  marginBottom: 10,
                  marginLeft: 10,
                  width: screenWidth * 0.25,
                }}
              >
                <View
                  style={{
                    padding: 10,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    borderRadius: 5,
                    alignItems: "center",
                  }}
                >
                  <AppText
                    style={{
                      fontSize: screenWidth * 0.25 * 0.1,
                      color: colors.primary,
                      fontWeight: "900",
                    }}
                  >
                    High Demand
                  </AppText>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              height: 180,
              width: "50%",
              padding: 3,
            }}
          >
            <View
              style={{
                backgroundColor: colors.containerColor,
                flex: 1,
                padding: 12,
                borderRadius: 10,
                shadowOffset: { height: 1, width: 0.4 },
                shadowColor: colors.shadowColor,
                shadowOpacity: 0.4,
              }}
            >
              <Text
                style={{
                  color: colors.themeColorTextPure,
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 15,
                }}
              >
                RETENTION
              </Text>
            </View>
          </View>
        </View>
        {/* Top Performing Zones */}
        <View
          style={{
            backgroundColor: colors.containerColor,
            borderRadius: 20,
            padding: 20,
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 1, width: 0.4 },
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <LayoutGrid size={18} color={colors.primary} />
            <Text
              style={{
                color: colors.themeColorTextPure,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 0,
              }}
            >
              {" "}
              Top Performing Zones
            </Text>
          </View>

          {ZonesData.map((zone, index) => (
            <View key={index} style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: colors.themeColorTextPure, fontSize: 14 }}
                >
                  {zone.name}
                </Text>
                <Text
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {zone.percentage}%
                </Text>
              </View>

              <View
                style={{
                  height: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#007aff", "#00d4ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${zone.percentage}%`,
                  }}
                />
              </View>

              <Text
                style={{
                  color: "#666",
                  fontSize: 11,
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                {zone.bookings} Bookings
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContractorIndex;
