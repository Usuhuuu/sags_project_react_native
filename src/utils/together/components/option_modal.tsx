import { useTheme } from "@/src/context/themeContext";
import { SPORT_INDICATOR } from "@/assets/Data/sport_indicator";
import { ULAANBAATAR_DISTRICTS_MAP } from "@/assets/Data/ub_location";
import AppText from "@/constants/appTextDefault";
import { AntDesign, Entypo } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PostModalOptionsProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  settingsId?: "location" | "game_type" | "date";
  optionData?: Record<"location" | "game_type" | "date", any>;
  setOptionData?: React.Dispatch<
    React.SetStateAction<Record<"location" | "game_type" | "date", any>>
  >;
}
const PostModalOptions = (props: PostModalOptionsProps) => {
  const { colors } = useTheme();
  const { width } = Dimensions.get("window");

  const getOptions = () => {
    if (props.settingsId === "location")
      return Object.values(ULAANBAATAR_DISTRICTS_MAP);
    if (props.settingsId === "game_type") return Object.values(SPORT_INDICATOR);

    return [];
  };
  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      presentationStyle="fullScreen"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      >
        <View
          style={{
            width: width,
            backgroundColor: colors.backgroundColor,
            alignItems: "center",
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => props.setVisible(false)}>
            <AntDesign name="left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <AppText
            style={{
              color: colors.themeColorTextPure,
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            Select Location
          </AppText>
          <View />
        </View>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: colors.backgroundColor,
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: colors.backgroundColor,
              gap: 10,
            }}
          >
            {getOptions().map((item) => (
              <TouchableOpacity
                key={String(item.id)}
                style={{
                  padding: 15,
                  backgroundColor: colors.containerColor,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderColor:
                    props.optionData &&
                    props.optionData[
                      props.settingsId as "location" | "game_type" | "date"
                    ] === item.id
                      ? colors.primary
                      : "transparent",
                  borderWidth:
                    props.optionData &&
                    props.optionData[
                      props.settingsId as "location" | "game_type" | "date"
                    ] === item.id
                      ? 2
                      : 0,
                }}
                onPress={() => {
                  if (props.setOptionData && props.settingsId) {
                    props.setOptionData((prev) => ({
                      ...prev,
                      [props.settingsId as string]: item.id,
                    }));
                  }
                }}
              >
                <Entypo name="location-pin" size={24} color={colors.primary} />
                <AppText>{item.name}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default PostModalOptions;
