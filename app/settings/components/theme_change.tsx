import { Modal, TouchableOpacity, View, Text } from "react-native";
import React, { SetStateAction, useState } from "react";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { AntDesign } from "@expo/vector-icons";

interface Theme_Changer_Modal_Props {
  themeModalVisible: boolean;
  setThemeModalVisible: React.Dispatch<SetStateAction<boolean>>;
}

const Theme_Changer_Modal = ({
  themeModalVisible,
  setThemeModalVisible,
}: Theme_Changer_Modal_Props) => {
  const { colors: Colors, theme, changeTheme } = useTheme();
  const [themeState, setThemeState] = useState(theme);

  return (
    <Modal
      visible={themeModalVisible}
      transparent
      style={{ flex: 1 }}
      animationType="fade"
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "70%",
            height: "auto",
            backgroundColor: Colors.backgroundColor,
            padding: 10,
            borderRadius: 8,
            shadowColor: Colors.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
            borderColor: Colors.white,
            gap: 10,
          }}
        >
          {/* Close */}
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => {
                setThemeModalVisible(false);
              }}
            >
              <AntDesign
                name="close"
                size={24}
                color={Colors.themeColorTextPure}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 20,
              color: Colors.themeColorTextPure,
              fontWeight: 600,
            }}
          >
            Change The Text
          </Text>
          <View
            style={{
              backgroundColor: Colors.containerColor,
              borderRadius: 10,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={{
                width: "50%",
                alignItems: "center",
                backgroundColor:
                  themeState === "dark"
                    ? Colors.primary
                    : Colors.containerColor,
                borderRadius: 10,
                padding: 5,
              }}
              onPress={() => {
                setThemeState("dark");
              }}
            >
              <Text
                style={{
                  color: themeState === "dark" ? Colors.white : Colors.darkGrey,
                }}
              >
                Black
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: "50%",
                alignItems: "center",
                backgroundColor:
                  themeState === "light"
                    ? Colors.primary
                    : Colors.containerColor,
                borderRadius: 10,
                padding: 7,
              }}
              onPress={() => {
                setThemeState("light");
              }}
            >
              <Text
                style={{
                  color:
                    themeState === "light" ? Colors.white : Colors.darkGrey,
                }}
              >
                White
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ justifyContent: "center" }}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                padding: 10,
                alignSelf: "center",
              }}
              onPress={() => {
                changeTheme(themeState);
                setThemeModalVisible(false);
              }}
            >
              <Text style={{ color: Colors.white }}>Change Theme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Theme_Changer_Modal;
