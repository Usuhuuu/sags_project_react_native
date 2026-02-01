import { ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ULAANBAATAR_DISTRICTS_MAP } from "@/assets/Data/ub_location";
import { SPORT_INDICATOR } from "@/assets/Data/sport_indicator";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useOptionPostStore } from "@/app/(modals)/context/store/optionPostStore";

type OptionRenderParams = {
  settingsId?: string;
  selectedOption?: string;
};

const OptionRender = () => {
  const { settingsId } = useLocalSearchParams<OptionRenderParams>();
  const { colors, theme } = useTheme();
  const { setOptionPostDetail, clearOptionPostDetail } = useOptionPostStore();
  const navigation = useNavigation();
  const [selectOption, setSelectOption] = useState<string | null>(null);

  const getOptions = () => {
    if (settingsId === "location")
      return Object.values(ULAANBAATAR_DISTRICTS_MAP);
    if (settingsId === "game_type")
      return Array.isArray(SPORT_INDICATOR)
        ? SPORT_INDICATOR
        : [SPORT_INDICATOR];
    return [];
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (selectOption !== null) {
              router.setParams({
                selectedOption: selectOption,
              });
              router.back();
            }
          }}
        >
          <AntDesign name="left" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectOption]);
  return (
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
                selectOption === item.id ? colors.primary : "transparent",
              borderWidth: selectOption === item.id ? 2 : 0,
            }}
            onPress={() => {
              setSelectOption(String(item.id));
            }}
          >
            <Entypo name="location-pin" size={24} color={colors.primary} />
            <AppText>{item.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
export default OptionRender;
