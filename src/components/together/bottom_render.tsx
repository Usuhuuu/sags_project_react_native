import React, { useEffect, useMemo, useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme_context";
import { UBDistrict } from "@/app/(drawer)/(user)/(tab-user)/together";
import AppText from "@/components/ui/app_text";
import { Entypo } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

const RadioButton = ({
  selected,
  color,
  size = 20,
}: {
  selected: boolean;
  color?: string;
  size?: number;
}) => (
  <View
    style={[
      styles.radioOuter,
      { width: size, height: size, borderColor: color },
    ]}
  >
    {selected && (
      <View
        style={[
          styles.radioInner,
          { backgroundColor: color, width: size * 0.5, height: size * 0.5 },
        ]}
      />
    )}
  </View>
);

type Bottom_Renderer_Props = {
  visible: boolean;
  setVisible: (v: boolean) => void;
  renderData: Record<string, UBDistrict>;
  selectedData?: string;
  onSelect: (item: { id: string; type: "district" | "sport_type" }) => void;
  selectingType: "district" | "sport_type";
};

export const Bottom_Renderer = ({
  visible,
  setVisible,
  renderData,
  selectedData,
  onSelect,
  selectingType,
}: Bottom_Renderer_Props) => {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["40%", "80%"], []);
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.45}
      pressBehavior="close"
    />
  );
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onClose={() => setVisible(false)}
      backgroundStyle={{ backgroundColor: colors.backgroundColor }}
    >
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#ccc",
          alignSelf: "center",
          marginBottom: 12,
        }}
      />

      <BottomSheetScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {Object.values(renderData).map((item: any) => {
          const isSelected = selectedData === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                onSelect({ id: item.id, type: selectingType });
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                borderRadius: 10,
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected ? colors.primary : "transparent",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Entypo name="location" size={22} color={colors.darkGrey} />
                <AppText
                  style={{
                    color: colors.darkGrey,
                    marginLeft: 8,
                  }}
                >
                  {item.name}
                </AppText>
              </View>

              <RadioButton
                selected={isSelected}
                color={colors.primary}
                size={22}
              />
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
export default Bottom_Renderer;

const styles = StyleSheet.create({
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
});
