import { useEffect, useState } from "react";
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

const DetailsPage = () => {
  const { hall_id } = useLocalSearchParams();
  const { getSpecificHall } = useHallInfo();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [hallSeparator, setHallSeparotor] = useState<HallTypesSeparator | null>(
    null,
  );
  const formated_hall_id = Array.isArray(hall_id) ? hall_id[0] : hall_id;
  const listing = getSpecificHall(formated_hall_id);
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
  }, [formated_hall_id, hallSeparator]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <OwnActivaterIndicator />
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
              sportHallID={formated_hall_id}
            />
          )}
          {hallSeparator === HallTypesSeparator.COMPUTERGAMESHALL &&
            listing && (
              <Pc_Halls
                listing={listing as unknown as EsportHallDataType}
                hallID={formated_hall_id}
                hallType={hallSeparator}
              />
            )}
        </Animated.View>
      )}
    </View>
  );
};

export default DetailsPage;
