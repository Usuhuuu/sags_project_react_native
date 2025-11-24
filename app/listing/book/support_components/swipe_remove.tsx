import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";

type SwipeableRowProps = {
  item: {
    id: string | number;
    message: string;
    time: string;
  };
  onDelete: (id: string | number) => void;
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({ item, onDelete }) => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light,
    },

    notificationItem: {
      padding: 15,
      backgroundColor: Colors.containerColor,
      borderRadius: 8,
      margin: 10,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 3,
    },
    notificationContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    notificationText: {
      flex: 1,
      marginLeft: 10,
    },
    notificationMessage: {
      fontSize: 16,
      fontWeight: "600",
    },
    notificationTime: {
      fontSize: 12,
      color: Colors.darkGrey,
      marginTop: 4,
    },

    deleteAction: {
      backgroundColor: "#ff1515",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      marginVertical: 10,
      width: 64,
    },
  });
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="close" size={24} color={Colors.themeColorTextPure} />
        </TouchableOpacity>
      )}
    >
      <View style={styles.notificationItem}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationText}>
            <AppText style={styles.notificationMessage}>{item.message}</AppText>
            <AppText style={styles.notificationTime}>{item.time}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>
    </Swipeable>
  );
};

export default SwipeableRow;
