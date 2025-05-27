import Colors from "@/constants/Colors";
import axiosInstance from "@/hooks/axiosInstance";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import * as SecureStorage from "expo-secure-store";
import SportHallTimeSlot from "@/assets/Data/sport_hall_timeslot.json";
import { Calendar } from "react-native-calendars";
import { useCalendar } from "@/interfaces/CalendarContext";
import moment from "moment";

const BookingCheck = () => {
  const [today, setToday] = useState(moment());
  const [listing, setListing] = useState<
    { start_time: string; end_time: string; isBooked: boolean }[]
  >([]);
  const { showCalendar, resetCalendar } = useCalendar();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  const onDateSelected = (date: moment.Moment) => {
    setToday(date);
  };

  const fetchSportData = async () => {
    try {
      const session = await SecureStorage.getItemAsync("contractor_session");
      const selectedDateStr = today.format("YYYY-MM-DD");
      const [year, month] = selectedDateStr.split("-");

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
        marked[selectedDateStr] = {
          ...(marked[selectedDateStr] || {}),
          selected: true,
          selectedColor: Colors.primary,
        };

        setMarkedDates(marked);

        // Extract all booked ranges for the selected date
        const bookedRanges = bookData
          .filter((item: any) => item.day.includes(selectedDateStr))
          .flatMap((item: any) => item.blocks)
          .map((block: { start_time: string; end_time: string }) => ({
            start: block.start_time,
            end: block.end_time,
          }));

        // Check for overlap
        const isTimeSlotBooked = (start: string, end: string) => {
            return bookedRanges.some(
            (block: { start: string; end: string }) => start < block.end && end > block.start
            );
        };

        const localSlots =
          SportHallTimeSlot?.[0]?.availableTimeSlots ?? [];

        const updatedSlots = localSlots.map((slot: any) => ({
          ...slot,
          isBooked: isTimeSlotBooked(slot.start_time, slot.end_time),
        }));

        setListing(updatedSlots);
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        Alert.alert("You don't have any sport hall");
      } else if (err.response?.status === 419) {
        Alert.alert("Expired Session");
      } else {
        Alert.alert("Something went wrong");
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
      // Optionally add dateNumberStyle if you want to style the text differently
    }));
  };

  return (
    <View style={{ width: "100%", height: "95%", backgroundColor: Colors.white }}>
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
                onDateSelected(moment(day.dateString));
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
            <TouchableOpacity style={styles.closeButton} onPress={resetCalendar}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Strip */}
      <View style={{ width: "100%", height: "20%" }}>
        <CalendarStrip
          style={styles.calendars}
          calendarAnimation={{ type: "parallel", duration: 30 }}
          startingDate={today.toDate()}
          selectedDate={today.toDate()}
          onDateSelected={(date: Date) => onDateSelected(moment(date))}
          dateNumberStyle={{
            fontSize: 18,
            fontWeight: "400",
            color: "#464646",
          }}
          dateNameStyle={{
            fontSize: 10,
            fontWeight: "400",
            color: Colors.littleDark,
          }}
          calendarHeaderStyle={{
            fontSize: 18,
            fontWeight: "500",
            color: Colors.littleDark,
          }}
          customDatesStyles={getCustomDateStyles()}
        />
      </View>

      {/* Booked Times */}
      <View style={{ width: "100%", height: "80%", padding: 20 }}>
        <Text style={styles.text}>Booked Times</Text>
        <View style={{ flexWrap: "wrap", width: "100%", flex: 1 }}>
          {listing.length === 0 ? (
            <Text style={{ fontSize: 16, color: Colors.grey }}>
              No available time slots for this day.
            </Text>
          ) : (
            listing.map((item) => (
              <View
                key={`${item.start_time}~${item.end_time}`}
                style={{ width: "50%", flex: 1, marginBottom: 10 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
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
              </View>
            ))
          )}
        </View>
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
