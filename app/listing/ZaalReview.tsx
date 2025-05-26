import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import SwipeableModal from "./book/swipe_modal"; // Adjust path if needed

export default function ReviewUpdateScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.button}
      >
        <Text style={{ color: "white" }}>Open Swipeable Modal</Text>
      </TouchableOpacity>

      <SwipeableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <Text style={styles.modalTitle}>Swipe down to close</Text>
        {[...Array(30)].map((_, i) => (
          <Text key={i} style={{ marginVertical: 10 }}>
            Scrollable content line {i + 1}
          </Text>
        ))}
      </SwipeableModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
});
