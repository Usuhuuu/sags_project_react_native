import React, { useEffect, useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { EsportHallDataType, SportHallDataType } from "@/types/hall_info_type";
import { HallTypesSeparator } from "@/types/hall_separator_type";
import SportHall from "@/components/hall_components/halls/sport_hall";
import CombinedEsportHall from "./esport/[hall_id]";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "@/context/theme_context";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useHallInfo } from "@/context/hall_info_context";
import BookingBoardGame from "./boardGame/[hall_id]";

export default function DetailsPage() {
  const { hall_id } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();
  const { colors } = useTheme();

  const hallId = Array.isArray(hall_id) ? hall_id[0] : hall_id;
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
  console.log("hallSeparator", hallSeparator);

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      {hallSeparator === HallTypesSeparator.SPORTHALL && (
        <SportHall
          listing={listing as SportHallDataType}
          hallType={hallSeparator}
          sportHallID={hallId}
        />
      )}
      {hallSeparator === HallTypesSeparator.COMPUTERGAMESHALL && (
        <CombinedEsportHall
          listing={listing as EsportHallDataType}
          hallID={hallId}
          hallType={hallSeparator}
        />
      )}
      {hallSeparator === HallTypesSeparator.BILLIARDHALL && (
        <BookingBoardGame
          listing={listing as EsportHallDataType}
          hallID={hallId}
          hallType={hallSeparator}
        />
      )}
    </Animated.View>
  );
}
