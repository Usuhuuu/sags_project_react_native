import { View } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import ListingsMap from "@/components/ListingsMap";
import ListingBottomSheet from "@/components/ListingBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import {
  EsportHallDataType,
  HallCategoryValue,
  SportHallDataType,
} from "@/interfaces/listing";
import HallData from "@/assets/Data/sportHall.json";

const Page = () => {
  const listingsData = HallData as unknown as (
    | SportHallDataType
    | EsportHallDataType
  )[];
  const [category, setCategory] = useState<HallCategoryValue>(
    HallCategoryValue.BASKET_BALL,
  );
  const bottomSheetY = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<HallCategoryValue>(
    HallCategoryValue.BASKET_BALL,
  );
  const onDataChanged = (category: HallCategoryValue) => {
    console.log("onDataChanged called with category:", category);
    setCategory(category);
    setSelectedCategory(category);
  };

  // Debug: Log filtered listings before rendering ListingsMap
  const filteredListings = listingsData
    .map((item: any) =>
      typeof item?.toObject === "function" ? item.toObject() : item,
    )
    .map((item: any) => ({
      ...item,
      hall_details: {
        ...(item.hall_details ?? {}),
        base_time_slots: item.base_time_slots ?? [],
      },
    }))
    .filter((item) => item.hall_types?.sub.includes(category));

  return (
    <GestureHandlerRootView style={{ height: "100%" }}>
      <View style={{ height: "100%" }}>
        <Stack.Screen
          options={{
            header: () => (
              <ExploreHeader
                onCategoryChanged={onDataChanged}
                bottomSheetY={bottomSheetY}
              />
            ),
          }}
        />
        <ListingsMap
          listings={filteredListings}
          selectedCategory={selectedCategory}
        />
        <ListingBottomSheet
          listing={filteredListings}
          category={category}
          bottomSheetY={bottomSheetY}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default Page;
