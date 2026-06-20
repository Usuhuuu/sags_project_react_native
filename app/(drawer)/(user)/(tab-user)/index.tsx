import { View } from "react-native";
import React, { useState, useRef, useMemo, useCallback } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/hall_info/explore_header";
import ListingsMap from "@/components/hall_info/listing_map";
import ListingBottomSheet from "@/components/hall_info/bottom_sheet";
import { useSharedValue } from "react-native-reanimated";
import { HallCategoryValue } from "@/types/hall_info_type";
import { useHallInfo } from "@/context/hall_info_context";

const Page = () => {
  const { getAllHalls } = useHallInfo();
  const hallDataRef = useRef(getAllHalls());
  const hallData = hallDataRef.current;
  const [category, setCategory] = useState<HallCategoryValue>(
    HallCategoryValue.BASKET_BALL,
  );
  const bottomSheetY = useSharedValue(0);

  const onDataChanged = (c: HallCategoryValue) => {
    console.log(`Category changed:`, c);
    setCategory(c);
  };

  const filteredListings = useMemo(
    () =>
      Object.values(hallData).filter((item) =>
        item.hall_types?.sub?.includes(category),
      ),
    [category, hallData],
  );

  return (
    <View style={{ flex: 1 }}>
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
      <ListingsMap listings={filteredListings} selectedCategory={category} />
      <ListingBottomSheet
        listing={filteredListings}
        category={category}
        bottomSheetY={bottomSheetY}
      />
    </View>
  );
};

export default Page;
