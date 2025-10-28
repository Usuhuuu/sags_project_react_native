import { useAuth } from "@/app/(modals)/context/authContext";
import React from "react";
import { StyleSheet, View } from "react-native";

const MailComponent = () => {
  const { LoginStatus } = useAuth();

  return (
    <>
      {LoginStatus && (
        <View style={styles.container}>
          <View></View>
          <View></View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});

export default MailComponent;
