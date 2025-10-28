import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface ProfileStatisticalProps {
  copyToClipboard: () => void;
  notificationData: Array<String>;
}

const ProfileStatistical = ({ data = [] }) => {
  return (
    <View style={styles.safeArea}>
      <ScrollView>
        {/* Header */}
        <View>
          <Text>Statistical Screen</Text>
        </View>
        {/* Body */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    height: "95%",
    width: "100%",
  },
  container: {},
  text: {
    fontSize: 18, // Larger text size
    color: "#333", // Darker text color
  },
  label: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
});

export default ProfileStatistical;
