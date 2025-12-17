import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import SportHallData from "@/assets/Data/sportHall.json";

import { EsportHallDataType, SportHallDataType } from "@/interfaces/listing";
import { HallTypesSeparator } from "@/interfaces/hallTypes";
import SportHall from "./hall_screens/sportHall";
import Pc_Halls from "./hall_screens/pcHall";
import { ActivityIndicator } from "react-native-paper";

const DetailsPage = () => {
  const { sportHallID } = useLocalSearchParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [hallSeparator, setHallSeparotor] = useState<HallTypesSeparator | null>(
    null
  );
  const listing = SportHallData.find(
    (item) => item.sportHallID === sportHallID
  );
  const hallSeparatorFunc = () => {
    const sportType = listing?.sportType;
    if (!sportType) return;
    const activeTypes = Object.entries(sportType).filter(
      ([, value]) => value === true
    );
    if (activeTypes.length > 1) {
      console.log("Multiple sport types detected:", activeTypes);
    }
    switch (true) {
      case sportType.basket_ball ||
        sportType.foot_ball ||
        sportType.volley_ball:
        setHallSeparotor(HallTypesSeparator.SPORTHALL);
        break;
      case sportType.billiards:
        setHallSeparotor(HallTypesSeparator.BILLIARDHALL);
        break;
      case sportType.bowling:
        setHallSeparotor(HallTypesSeparator.BOWLINGHALL);
        break;
      case sportType.computer || sportType.playstation:
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
        <View style={{ flex: 1 }}>
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
                sportHallID={
                  Array.isArray(sportHallID) ? sportHallID[0] : sportHallID
                }
                hallType={hallSeparator}
              />
            )}
        </View>
      )}
    </View>
  );
};

export default DetailsPage;
