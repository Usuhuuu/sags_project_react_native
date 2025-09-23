import Colors from "@/constants/Colors";
import axiosInstance from "@/hooks/axiosInstance";
import React, { SetStateAction, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

interface FriendAddModalProp {
  modalDisplay: boolean;
  setModalDisplay: React.Dispatch<SetStateAction<boolean>>;
}

const Friend_Add_Modal = ({
  modalDisplay,
  setModalDisplay,
}: FriendAddModalProp) => {
  const [textInPutValue, setTextInPutValue] = useState<string>("");

  const sendRequest = async () => {
    try {
      if (textInPutValue.length > 5) {
        const response = await axiosInstance.post("/auth/friend_request", {
          friend_unique_ID: textInPutValue.trim(),
        });

        if (response.status === 200 && response.data.success) {
          Notifier.showNotification({
            title: "Friend request sent",
            description: `Request sent to ${textInPutValue}`,
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "success" },
          });
          setTextInPutValue("");
          setModalDisplay(false);
        } else {
          Notifier.showNotification({
            title: "Request failed",
            description: response.data.message || "Try again later",
            Component: NotifierComponents.Alert,
            componentProps: { alertType: "error" },
          });
        }
      } else {
        Notifier.showNotification({
          title: "Invalid username",
          description: "Please enter at least 6 characters",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "warn" },
        });
      }
    } catch (err) {
      console.log(err);
      Notifier.showNotification({
        title: "Error",
        description: "Something went wrong. Please try again.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    }
  };

  return (
    <Modal visible={modalDisplay} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={{ gap: 10 }}>
            <TextInput
              value={textInPutValue}
              onChangeText={(text) => setTextInPutValue(text)}
              placeholder={"Enter the username"}
              style={{
                width: "100%",
                backgroundColor: Colors.lightGrey,
                padding: 10,
                borderRadius: 10,
              }}
              placeholderTextColor={Colors.darkGrey}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  padding: 10,
                  borderRadius: 10,
                  width: "40%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  setTextInPutValue("");
                  setModalDisplay(false);
                }}
              >
                <Text style={{ color: Colors.primary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: Colors.primary,
                  width: "40%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  sendRequest();
                }}
              >
                <Text style={{ color: Colors.white }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Input sections */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: Colors.white,
    width: "80%",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark,
  },
});

export default Friend_Add_Modal;
