import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/src/context/themeContext";

interface FilterModalProp {
  showFilterVisible: boolean;
  setShowFilterVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

function FilterModal({
  showFilterVisible,
  setShowFilterVisible,
}: FilterModalProp) {
  const { colors: Colors } = useTheme();
  return (
    <Modal visible={showFilterVisible} animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{ backgroundColor: Colors.white, width: "70%", padding: 10 }}
        >
          <View style={{ width: "100%", alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => {
                setShowFilterVisible(!showFilterVisible);
              }}
              style={{
                alignItems: "flex-end",
                width: "10%",
              }}
            >
              <AntDesign name="close" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "70%",
              backgroundColor: Colors.white,
              borderRadius: 12,
              alignItems: "center",
            }}
          ></View>
        </View>
      </View>
    </Modal>
  );
}

export default FilterModal;
