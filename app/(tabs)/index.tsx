import { View } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import ListingsMap from "@/components/ListingsMap";
import SportHallData from "@/assets/Data/sportHall.json";
import ListingBottomSheet from "@/components/ListingBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

const Page = () => {
  const listingsData = require("@/assets/Data/sportHall.json");
  const [category, setCategory] = useState<string>("basket_ball");
  const items = useMemo(() => listingsData as any[], []);
  const bottomSheetY = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const onDataChanged = (category: string) => {
    console.log("onDataChanged called with category:", category);
    setCategory(category);
    setSelectedCategory(category);
  };

  // Debug: Log filtered listings before rendering ListingsMap
  const filteredListings = SportHallData.filter((item: any) =>
    category === "all" ? true : item.sportType[category.toLowerCase()]
  ).map((item: any) => ({
    ...item,
    availableTimeSlots: item.availableTimeSlots.map((slot: any) => ({
      start_time: slot.start,
      end_time: slot.end,
    })),
  }));

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
          listing={items}
          category={category}
          bottomSheetY={bottomSheetY}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default Page;
