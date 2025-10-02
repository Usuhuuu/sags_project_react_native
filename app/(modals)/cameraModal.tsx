import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, Linking } from "react-native";
import { useCameraPermissions, CameraView } from "expo-camera";
import Colors from "@/constants/Colors";

const CameraModal = () => {
  const [permission, requestPermission] = useCameraPermissions();

  const checkPermissions = async () => {
    if (!permission) return;

    if (permission.status !== "granted") {
      if (!permission.canAskAgain) {
        Alert.alert(
          "Request Permission",
          "Camera access is required to use this feature. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        requestPermission();
      }
    }
  };

  useEffect(() => {
    checkPermissions();
  }, [permission]);

  return <CameraView style={styles.cameraView}></CameraView>;
};

const styles = StyleSheet.create({
  cameraView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light,
  },
});

export default CameraModal;
