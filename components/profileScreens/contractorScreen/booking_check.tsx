import Colors from "@/constants/Colors";
import axiosInstance from "@/hooks/axiosInstance";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import * as SecureStorage from "expo-secure-store";
import SportHallTimeSlot from "@/assets/Data/sport_hall_timeslot.json";
import { SportHallDataType } from "@/interfaces/listing";
import { Calendar, CalendarProps } from "react-native-calendars";

const BookingCheck = () => {
  const [today, setToday] = useState(new Date());
  const [formData, setFormData] = useState();
  const dateSlotGiver = (date: any) => {
    console.log(date);
    setToday(date);
  };
  const fetchSportData = async () => {
    try {
      const session = await SecureStorage.getItemAsync("contractor_session");
      const [year, month, day] = today.toISOString().split("T")[0].split("-");

      const config = session
        ? { headers: { "x-session-container": session } }
        : undefined;
      const response = await axiosInstance.get(
        `/auth/sporthall/${year}/${month}`,
        config
      );
      console.log(response.data);

      if (response.status === 200 && response.data.success) {
        if (response.data.session) {
          await SecureStorage.setItemAsync(
            "contractor_session",
            response.data.session
          );
        }
        console.log(response.data.bookData);
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        Alert.alert("You doensn't have any sport hall");
      } else if (err.response.status === 419) {
        console.log(err.response.data);

        Alert.alert("Expired Session");
      }
    }
  };
  const listing = SportHallTimeSlot[0].availableTimeSlots;

  useEffect(() => {
    fetchSportData();
  }, [today]);

  return (
    <View
      style={{ width: "100%", height: "95%", backgroundColor: Colors.white }}
    >
      <View style={{ width: "100%", height: "20%" }}>
        <CalendarStrip
          style={styles.calendars}
          selectedDate={new Date(today)}
          calendarAnimation={{ type: "parallel", duration: 30 }}
          startingDate={new Date(today)}
          onDateSelected={(date: any) => dateSlotGiver(date)}
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
        />
      </View>
      <View
        style={{
          width: "100%",
          height: "80%",
          padding: 20,
        }}
      >
        <Text>Booked Times</Text>

        <View
          style={{
            flexWrap: "wrap",
            width: "100%",

            flex: 1,
          }}
        >
          {listing.map((item) => {
            return (
              <View
                key={`${item.start_time}~${item.end_time}`}
                style={{
                  width: "50%",
                  flex: 1,
                }}
              >
                <Text>
                  {item.start_time}~{item.end_time}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendars: {
    flex: 1,
  },
});

export default BookingCheck;
