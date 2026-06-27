import React, { useEffect, useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { EsportHallDataType, SportHallDataType } from "@/types/hall_info_type";
import { HallTypesSeparator } from "@/types/hall_separator_type";
import SportHall from "@/components/hall_components/halls/sport_hall";
import Pc_Halls from "@/components/hall_components/halls/pc_hall";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@/context/theme_context";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useHallInfo } from "@/context/hall_info_context";

export default function DetailsPage() {
  const { sportHallID } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();
  const { colors } = useTheme();

  const hallId = Array.isArray(sportHallID) ? sportHallID[0] : sportHallID;
  const listing = useMemo(
    () => getSpecificHall(hallId),
    [getSpecificHall, hallId],
  );

  const hallSeparator = useMemo(() => {
    const subTypes = listing?.hall_types?.sub;
    if (!subTypes || subTypes.length === 0) return null;
    const sportSet = new Set(subTypes);

    if (
      sportSet.has("basket_ball") ||
      sportSet.has("foot_ball") ||
      sportSet.has("volley_ball")
    )
      return HallTypesSeparator.SPORTHALL;
    if (sportSet.has("billiards")) return HallTypesSeparator.BILLIARDHALL;
    if (sportSet.has("bowling")) return HallTypesSeparator.BOWLINGHALL;
    if (sportSet.has("computer") || sportSet.has("playstation"))
      return HallTypesSeparator.COMPUTERGAMESHALL;
    return null;
  }, [listing]);

  if (!hallSeparator || !listing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <OwnActivaterIndicator />
      </View>
    );
  }

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      {hallSeparator === HallTypesSeparator.SPORTHALL && (
        <SportHall
          listing={listing as unknown as SportHallDataType}
          hallType={hallSeparator}
          sportHallID={hallId}
        />
      )}
      {hallSeparator === HallTypesSeparator.COMPUTERGAMESHALL && (
        <Pc_Halls
          listing={listing as unknown as EsportHallDataType}
          hallID={hallId}
          hallType={hallSeparator}
        />
      )}
    </Animated.View>
  );
}
