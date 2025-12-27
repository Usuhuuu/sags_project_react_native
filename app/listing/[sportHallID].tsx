import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import SportHallData from "@/assets/Data/sportHall.json";

import {
  EsportHallDataType,
  HallCategoryType,
  HallCategoryValue,
  SportHallDataType,
} from "@/interfaces/listing";
import { HallTypesSeparator } from "@/interfaces/hallTypes";
import SportHall from "./hall_screens/sportHall";
import Pc_Halls from "./hall_screens/pcHall";
import { ActivityIndicator } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../(modals)/context/themeContext";

const DetailsPage = () => {
  const { sportHallID } = useLocalSearchParams();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [hallSeparator, setHallSeparotor] = useState<HallTypesSeparator | null>(
    null
  );
  const listing = SportHallData.find(
    (item) => item.sportHallID === sportHallID
  ) as unknown as SportHallDataType | EsportHallDataType;
  const hallSeparatorFunc = () => {
    const sportSet = new Set(listing?.hall_types.sub);
    if (!sportSet) return;
    switch (true) {
      case sportSet.has("basket_ball") ||
        sportSet.has("foot_ball") ||
        sportSet.has("volley_ball"):
        setHallSeparotor(HallTypesSeparator.SPORTHALL);
        break;
      case sportSet.has("billiards"):
        setHallSeparotor(HallTypesSeparator.BILLIARDHALL);
        break;
      case sportSet.has("bowling"):
        setHallSeparotor(HallTypesSeparator.BOWLINGHALL);
        break;
      case sportSet.has("computer") || sportSet.has("playstation"):
        setHallSeparotor(HallTypesSeparator.COMPUTERGAMESHALL);
        break;
      default:
        setHallSeparotor(null);
        break;
    }
  };

  useEffect(() => {
    hallSeparatorFunc();
    if (hallSeparator !== undefined || null) {
      setLoading(false);
    }
  }, [sportHallID, hallSeparator]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <Animated.View
          style={{ flex: 1, backgroundColor: colors.backgroundColor }}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          {hallSeparator === HallTypesSeparator.SPORTHALL && listing && (
            <SportHall
              listing={listing as unknown as SportHallDataType}
              hallType={hallSeparator}
              sportHallID={
                Array.isArray(sportHallID) ? sportHallID[0] : sportHallID
              }
            />
          )}
          {hallSeparator === HallTypesSeparator.COMPUTERGAMESHALL &&
            listing && (
              <Pc_Halls
                listing={listing as unknown as EsportHallDataType}
                hallID={
                  Array.isArray(sportHallID) ? sportHallID[0] : sportHallID
                }
                hallType={hallSeparator}
              />
            )}
        </Animated.View>
      )}
    </View>
  );
};

export default DetailsPage;
