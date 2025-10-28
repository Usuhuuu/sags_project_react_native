import Colors from "@/constants/Colors";
import axiosInstance from "@/hooks/axiosInstance";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as SecureStorage from "expo-secure-store";
import SportHallTimeSlot from "@/assets/Data/sport_hall_timeslot.json";
import { Calendar } from "react-native-calendars";
import { useCalendar } from "@/app/(modals)/context/CalendarContext";
import moment from "moment";
import { Notifier, NotifierComponents } from "react-native-notifier";
import WeekCalendar from "@/app/(modals)/book/components/calendar_strip";

const BookingCheck = () => {
  const [today, setToday] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [listing, setListing] = useState<
    { start_time: string; end_time: string; isBooked: boolean }[]
  >([]);
  const { showCalendar, resetCalendar } = useCalendar();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  const onDateSelected = (date: string) => {
    setToday(date);
  };

  const fetchSportData = async () => {
    try {
      const session = await SecureStorage.getItemAsync("contractor_session");
      const [year, month, day] = today.split("-");
      const config = session
        ? { headers: { "x-session-container": session } }
        : undefined;

      const response = await axiosInstance.get(
        `/auth/sporthall/${year}/${month}`,
        config
      );

      if (response.status === 200 && response.data.success) {
        if (response.data.session) {
          await SecureStorage.setItemAsync(
            "contractor_session",
            response.data.session
          );
        }

        const bookData = response.data.bookData;
        const marked: Record<string, any> = {};
        console.log("Book Data:", bookData);

        // Mark all booked dates with red dot
        bookData.forEach((item: any) => {
          item.day.forEach((dateStr: string) => {
            marked[dateStr] = {
              ...(marked[dateStr] || {}),
              marked: true,
              dotColor: "red",
              activeOpacity: 0,
            };
          });
        });

        // Highlight selected date
        marked[today] = {
          ...(marked[today] || {}),
          selected: true,
          selectedColor: Colors.primary,
        };

        setMarkedDates(marked);

        // Extract all booked ranges for the selected date
        const bookedRanges = bookData
          .filter((item: any) => item.day.includes(today))
          .flatMap((item: any) => item.blocks)
          .map((block: { start_time: string; end_time: string }) => ({
            start: block.start_time,
            end: block.end_time,
          }));

        // Check for overlap
        const isTimeSlotBooked = (start: string, end: string) => {
          return bookedRanges.some(
            (block: { start: string; end: string }) =>
              start < block.end && end > block.start
          );
        };

        const localSlots = SportHallTimeSlot?.[0]?.availableTimeSlots ?? [];

        const updatedSlots = localSlots.map((slot: any) => ({
          ...slot,
          isBooked: isTimeSlotBooked(slot.start_time, slot.end_time),
        }));

        setListing(updatedSlots);
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        Notifier.showNotification({
          title: "Failed",
          description: "You don't have any sport hall",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else if (err.response?.status === 419) {
        Notifier.showNotification({
          title: "Failed",
          description: "Expired Session",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      } else {
        Notifier.showNotification({
          title: "Failed",
          description: "Server has problem, try again later",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    }
  };

  useEffect(() => {
    fetchSportData();
  }, [today]);

  // Build customDatesStyles for CalendarStrip to add red underline for booked dates
  const getCustomDateStyles = () => {
    // Extract booked dates from markedDates where dotColor is 'red'
    const bookedDates = Object.entries(markedDates)
      .filter(([_, mark]) => mark.marked && mark.dotColor === "red")
      .map(([dateStr]) => dateStr);

    return bookedDates.map((dateStr) => ({
      date: moment(dateStr).toDate(),
      style: {
        borderBottomColor: "red",
        borderBottomWidth: 3,
        borderRadius: 0,
      },
    }));
  };

  return (
    <View
      style={{ width: "100%", height: "95%", backgroundColor: Colors.white }}
    >
      {/* Modal Calendar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onRequestClose={resetCalendar}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={(day: { dateString: string }) => {
                onDateSelected(today);
                resetCalendar();
              }}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: Colors.primary,
                todayTextColor: Colors.primary,
                dotColor: "red",
                textDayFontWeight: "500",
              }}
              style={{ borderRadius: 10 }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={resetCalendar}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Strip */}
      <View style={{ width: "100%", height: "30%" }}>
        <WeekCalendar
          selectedDay={today}
          setSelectedDay={setToday}
          onDateSelect={(date) => {
            onDateSelected(date);
          }}
          selectedDayTextStyle={{ color: Colors.white }}
          selectedDayNumberStyle={{ color: Colors.white }}
          selectedContainerStyle={{ backgroundColor: Colors.primary }}
          containerStyle={{ flex: 1 }}
        />
      </View>

      {/* Booked Times */}
      <View style={{ width: "100%", height: "80%", padding: 20 }}>
        <Text style={styles.text}>Booked Times</Text>
        <FlatList
          data={listing}
          keyExtractor={(item) => `${item.start_time}~${item.end_time}`}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: Colors.dark }}>
                {item.start_time} ~ {item.end_time}
              </Text>
              <Text
                style={{
                  color: item.isBooked ? "black" : "green",
                  fontSize: 14,
                  fontWeight: "bold",
                  backgroundColor: item.isBooked
                    ? Colors.grey
                    : Colors.secondary,
                  textAlign: "center",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                }}
              >
                {item.isBooked ? "Booked" : "Available"}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text>No Booking</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendars: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: 400,
  },
  closeButton: {
    marginTop: 15,
    alignSelf: "center",
    padding: 10,
  },
  closeText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingCheck;
