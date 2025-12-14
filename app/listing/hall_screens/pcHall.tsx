import { SportHallDataType } from "@/interfaces/listing";
import React, { useRef, useState } from "react";
import { FlatList, Image, View } from "react-native";
import OrderScreen, { FormData } from "../detail";

interface PC_HallsProps {
  listing: SportHallDataType;
  sportHallID: string;
}

const Pc_Halls = ({ listing, sportHallID }: PC_HallsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  return (
    <View>
      <View></View>
    </View>
  );
};

export default Pc_Halls;
