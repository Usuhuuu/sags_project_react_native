import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { PartnerBlock } from "@/app/(tabs)/inbox";
import axiosInstance from "@/hooks/axiosInstance";
import { SportHallDataType } from "@/interfaces/listing";
import { HashedSportData } from "@/utils/sport_hall_hash";
import { MaterialIcons } from "@expo/vector-icons"; // install expo/vector-icons if needed
import Colors from "@/constants/Colors";
import { format, parseISO } from "date-fns";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { Axios } from "axios";

type FetchedDataType = {
  _id: string;
  zaal_ID: string;
  day: string[];
  blocks: PartnerBlock[];
  paying_peoples: OtherPoeples[];
  sport_hall: SportHallDataType;
};
type OtherPoeples = {
  userID: string;
  amountPaid: number;
  payment_status: string;
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const OrderHistory = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [fetchedData, setFetchedData] = useState<FetchedDataType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (year: number, month: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/auth/sporthall/book/${year}/${month + 1}?page=1`
      );
      if (response.status === 200 && response.data.success) {
        const result = response.data.findBooks.map((hall: FetchedDataType) => {
          const tempHall = HashedSportData[hall?.zaal_ID];
          return {
            ...hall,
            sport_hall: tempHall,
          };
        });
        setFetchedData(result);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async (item: string) => {
    try {
      const response = await axiosInstance.post("/auth/bookcancel", {
        transaction_ID: item,
        reason: "Tsag amjihgui bolson",
      });
      if (response.status === 200 && response.data.success) {
        Notifier.showNotification({
          title: "Successfully Canceled Order",
          description: "PISDA",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
      } else if (response.status === 400 && !response.data.success) {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err: any) {
      if (err.response.status === 400 && !err.response.data.success) {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else {
        Notifier.showNotification({
          title: "Failed",
          description: "Could't find order",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    }
  };

  useEffect(() => {
    fetchHistory(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth])
  );

  const renderItem = ({ item }: { item: FetchedDataType }) => {
    const readableDays = item.day.join(", ");
    const readableBlocks = item.blocks.map((b) => b.time_slots).join(", ");

    return (
      <View style={styles.card}>
        <Text style={styles.hallName}>
          {item.sport_hall?.name || "🏟️ Sport Hall"}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>📅 Days:</Text>
          <Text style={styles.value}>{readableDays}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>⏱ Blocks:</Text>
          <View
            style={[
              styles.value,
              {
                flex: 1,
              },
            ]}
          >
            <Text
              style={{
                width: "100%",
                flexDirection: "column",
                flexWrap: "wrap",
              }}
              ellipsizeMode="tail"
            >
              {readableBlocks}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item._id)} // define handleCancel or remove
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Year selector */}
      <View style={styles.yearSelector}>
        <TouchableOpacity
          onPress={() => setSelectedYear((y) => y - 1)}
          style={styles.yearButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.yearText}>{selectedYear}</Text>
        <TouchableOpacity
          onPress={() => setSelectedYear((y) => y + 1)}
          style={styles.yearButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chevron-right" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Month grid */}
      <View style={styles.monthGrid}>
        {months.map((month, index) => {
          const selected = selectedMonth === index;
          return (
            <Pressable
              key={month}
              onPress={() => setSelectedMonth(index)}
              style={({ pressed }) => [
                styles.monthItem,
                selected && styles.monthItemSelected,
                pressed && !selected && { backgroundColor: "#d9eaff" },
              ]}
            >
              <Text
                style={[styles.monthText, selected && styles.monthTextSelected]}
              >
                {month.substring(0, 3)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 32 }}
        />
      ) : (
        <FlatList
          data={fetchedData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You don’t have any bookings yet.
            </Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fbfd",
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#222",
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 28,
    color: "#007AFF",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  monthItem: {
    width: 50,
    height: 40,
    margin: 6,
    borderRadius: 10,
    backgroundColor: "#e6ecf5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  monthItemSelected: {
    backgroundColor: "#007AFF",
    elevation: 5,
    shadowOpacity: 0.2,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  monthTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  hallName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    color: "#222",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    color: "#666",
    width: 90,
  },
  value: {
    color: "#444",
    flex: 1,
    flexWrap: "wrap",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 14,
    backgroundColor: "#ff5c5c",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#ff5c5c",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 18,
    marginTop: 50,
  },
});

export default OrderHistory;
