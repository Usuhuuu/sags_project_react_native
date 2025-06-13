import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";

type SwipeableRowProps = {
  item: {
    id: string | number;
    message: string;
    time: string;
  };
  onDelete: (id: string | number) => void;
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({ item, onDelete }) => {
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    >
      <View style={styles.notificationItem}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    justifyContent: "space-between",
    backgroundColor: Colors.light,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    backgroundColor: Colors.secondary,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 8,

    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 5,
  },
  notificationItem: {
    padding: 15,
    backgroundColor: "#f9f9f9",
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
    color: "#333",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  footerButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  texts: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
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

export default SwipeableRow;
