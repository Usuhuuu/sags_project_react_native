import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SportHallDataType } from "@/types/hall_info_type";
import Animated from "react-native-reanimated";
import { useTheme } from "@/context/theme_context";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { useHallInfo } from "@/context/hall_info_context";
import Main from "@/components/hall_components/halls/main";
import { getHallTypeFromCategories } from "@/utils/duration_price";

export default function DetailsPage() {
  const { hall_id } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();
  const { colors } = useTheme();

  const hallId = Array.isArray(hall_id) ? hall_id[0] : hall_id;
  const listing = useMemo(
    () => getSpecificHall(hallId),
    [getSpecificHall, hallId],
  );
  const hallSeparated = getHallTypeFromCategories(listing?.hall_types?.sub);

  if (!hallSeparated || !listing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <OwnActivaterIndicator />
      </View>
    );
  }
  return (
    <Animated.View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <Main
        listing={listing as SportHallDataType}
        hallType={hallSeparated}
        sportHallID={hallId}
      />
    </Animated.View>
  );
}
