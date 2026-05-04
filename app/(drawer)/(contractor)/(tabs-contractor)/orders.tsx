import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { RQ_regular_cache_key, useRegularQuery } from "@/hooks/useQuery";
import { useAuth } from "@/src/context/authContext";
import { ContractorBookingType } from "@/interfaces/contractorResponseType";
import { format } from "date-fns";
import { useTheme } from "@/src/context/themeContext";
import { useIsFocused } from "@react-navigation/native";

// --- Types ---
type BookingType = "UPCOMING" | "ACTIVE" | "HISTORY";

interface TabItem {
  id: BookingType;
  label: string;
}

const ContractorBooking = () => {
  const { colors, theme } = useTheme();
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
      }}
    >
      {/* Header Container with Glass Effect */}
      <View
        style={{
          padding: 20,
          backgroundColor: colors.containerColor,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: colors.shadowColor,
          shadowOpacity: 0.4,
          shadowOffset: { height: 4, width: 0 },
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: 20,
            color: colors.themeColorTextPure,
          }}
        >
          Bookings
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            borderRadius: 12,
            paddingHorizontal: 15,
            height: 45,
            borderWidth: 1,
            borderColor: colors.darkGrey,
          }}
        >
          <Search
            size={18}
            color="#666"
            style={{
              marginRight: 10,
            }}
          />
          <TextInput
            placeholder="Search users or zones..."
            placeholderTextColor={colors.darkGrey}
            style={{
              flex: 1,
              color: colors.darkGrey,
              fontSize: 14,
            }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          paddingHorizontal: 20,
          marginVertical: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.containerColor,
            borderRadius: 25,
            padding: 4,
            justifyContent: "space-between",
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 2, width: 2 },
          }}
        >
          {bookingStatusDetail.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                setBookingType(tab.id);
              }}
              style={[
                {
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 20,
                },
                activeTab === tab.id && {
                  backgroundColor: "rgba(77, 171, 255, 0.1)",
                },
              ]}
            >
              <Text
                style={[
                  {
                    color:
                      activeTab === tab.id ? colors.primary : colors.darkGrey,
                    fontSize: 14,
                    fontWeight: "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#4dabff",
                    position: "absolute",
                    bottom: -10,
                    shadowColor: "#4dabff",
                    shadowRadius: 10,
                    shadowOpacity: 1,
                  }}
                />
              )}
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
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
};

const BookingCard = React.memo(({ item }: { item: ContractorBookingType }) => {
  const { colors } = useTheme();
  const width = Dimensions.get("window").width;
  return (
    <View
      style={{
        backgroundColor: colors.containerColor,
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        shadowColor: colors.shadowColor,
        shadowOffset: { height: 4, width: 2 },
        shadowOpacity: 0.4,
      }}
    >
      {item.blocks?.map((block, blockIndex) => (
        <View
          key={blockIndex}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ width: width * 0.55 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 4,
                color: colors.themeColorTextPure,
              }}
            >
              {block.current_player_list?.[0]?.unique_user_ID ?? "No User"}
            </Text>

            <Text
              style={{
                color: colors.darkGrey,
                fontSize: 13,
                width: width * 0.5,
              }}
              numberOfLines={2}
            >
              {format(new Date(block.start_time), "PPP HH:mm")} {" -\n"}
              {format(new Date(block.end_time), "PPP HH:mm")}
            </Text>
          </View>

          <View
            style={[
              block.block_booking_status === "confirmed"
                ? {
                    borderColor: colors.primary,
                  }
                : {
                    borderColor: colors.darkGrey,
                    backgroundColor: "transparent",
                  },
              {
                width: width * 0.25,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                { fontSize: 12, fontWeight: "600" },
                block.block_booking_status === "confirmed"
                  ? { color: colors.primary }
                  : { color: colors.darkGrey },
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

export default ContractorBooking;
