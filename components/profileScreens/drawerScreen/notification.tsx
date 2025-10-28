import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Colors from "@/constants/Colors";
import { MultiSelect } from "react-native-element-dropdown";
import { TextInput } from "react-native-gesture-handler";
import axiosInstance from "@/hooks/axiosInstance";

const ProfileNotification = ({ data = [] }) => {
  const [value, setValue] = useState<string[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [reallySend, setReallySend] = useState<boolean>(false);
  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: Colors.dark }]}>
          User Type Select
        </Text>
      );
    }
    return null;
  };
  const userTypes = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Contractor", value: "contractor" },
  ];
  const handleSubmit = async () => {
    try {
      console.log("Sending notification:", formData);
      const response = await axiosInstance.post("/auth/send-notification", {
        formData,
      });
      if (response.status == 200) {
        console.log("Notification sent:", response.data);
      }
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };
  const conformSend = () => {
    Alert.alert("Send notification", "unheer shaah ymu?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          setReallySend(true);
          handleSubmit();
        },
        style: "destructive",
      },
    ]);
  };
  const handleTitleChange = (e: any) => {
    setFormData({ ...formData, title: e });
  };
  const handleSubtitleChange = (e: any) => {
    setFormData({ ...formData, sub_title: e });
  };
  const handleBodyChange = (e: any) => {
    setFormData({ ...formData, body: e });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.containerView}>
        <View style={styles.userType}>
          {renderLabel()}
          <MultiSelect
            style={[styles.dropdown, isFocus && { borderColor: Colors.dark }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={userTypes}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setValue(item);
              formData.user_type = item;
              setIsFocus(false);
            }}
          />
          <View style={styles.notificationContainer}>
            <TouchableOpacity style={styles.notificationTouchable}>
              <TextInput
                onChangeText={(e) => {
                  handleTitleChange(e);
                }}
                placeholder="Title"
                placeholderTextColor={Colors.darkGrey}
                style={styles.textInput}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationSubTouchable}>
              <TextInput
                onChangeText={(e) => {
                  handleSubtitleChange(e);
                }}
                placeholder="Sub Title"
                placeholderTextColor={Colors.darkGrey}
                style={styles.textInput}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBodyTouchable}>
              <TextInput
                onChangeText={(e) => {
                  handleBodyChange(e);
                }}
                placeholder="Body"
                placeholderTextColor={Colors.darkGrey}
                style={styles.textInput}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationSendTouchable}>
              <Text
                onPress={() => {
                  conformSend();
                }}
                style={{ fontSize: 20, color: Colors.white }}
              >
                Send notification
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    height: Dimensions.get("window").height,
  },
  containerView: {
    flex: 1,
    flexDirection: "column",
  },
  userType: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 10,
    height: "20%",
    padding: 15,
  },
  dropdown: {
    height: 50,
    borderColor: Colors.darkGrey,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors.darkGrey,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.darkGrey,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  notificationContainer: {
    marginVertical: 10,
  },
  notificationTouchable: {
    backgroundColor: Colors.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: Colors.darkGrey,
    borderWidth: 0.5,
  },
  textInput: {
    color: Colors.dark,
    fontWeight: "500",
  },
  notificationSubTouchable: {
    backgroundColor: Colors.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: Colors.darkGrey,
    borderWidth: 0.5,
  },
  notificationBodyTouchable: {
    backgroundColor: Colors.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: Colors.darkGrey,
    borderWidth: 0.5,
    height: 150,
  },
  notificationSendTouchable: {
    alignItems: "center",
    padding: 15,
    color: Colors.primary,
    backgroundColor: Colors.primary,
    margin: 10,
    borderRadius: 20,
    width: "auto",
  },
});

export default ProfileNotification;
