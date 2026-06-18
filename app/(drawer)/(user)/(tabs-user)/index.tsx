import { View } from "react-native";
import React, { useState, useRef, useMemo, useCallback } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import ListingsMap from "@/components/ListingsMap";
import ListingBottomSheet from "@/components/ListingBottomSheet";
import { useSharedValue } from "react-native-reanimated";
import { HallCategoryValue } from "@/interfaces/listing";
import { useHallInfo } from "@/src/context/hallInfoContext";

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
