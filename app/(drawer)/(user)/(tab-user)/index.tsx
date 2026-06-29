import { View } from "react-native";
import { useState, useRef, useMemo, useCallback } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/hall_components/explore_header";
import ListingsMap from "@/components/hall_components/listing_map";
import ListingBottomSheet from "@/components/hall_components/bottom_sheet";
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
  const [region, setRegion] = useState<any>(null);

  const bottomSheetY = useSharedValue(0);

  const onDataChanged = useCallback((c: HallCategoryValue) => {
    setCategory(c);
  }, []);

  const visibleHalls = useMemo(() => {
    const temp = Object.values(hallData).filter((item) =>
      item.hall_types?.sub?.includes(category),
    );
    if (!region) return temp;
    const north = region.latitude + region.latitudeDelta / 2;
    const south = region.latitude - region.latitudeDelta / 2;
    const east = region.longitude + region.longitudeDelta / 2;
    const west = region.longitude - region.longitudeDelta / 2;
    return temp.filter((hall) => {
      const lat = parseFloat(hall.hall_locations?.latitude);
      const lng = parseFloat(hall.hall_locations?.longitude);
      return lat >= south && lat <= north && lng >= west && lng <= east;
    });
  }, [region, category, hallData]);
  console.log(`Visible halls:`, visibleHalls.length);

  const handleRegionChange = useCallback((r: any) => {
    setRegion({
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: r.latitudeDelta,
      longitudeDelta: r.longitudeDelta,
    });
  }, []);

  const header = useCallback(
    () => (
      <ExploreHeader
        onCategoryChanged={onDataChanged}
        bottomSheetY={bottomSheetY}
      />
    ),
    [],
  );
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: header,
        }}
      />
      <ListingsMap
        listings={visibleHalls}
        onRegionChange={handleRegionChange}
      />
      <ListingBottomSheet
        listing={visibleHalls}
        category={category}
        bottomSheetY={bottomSheetY}
      />
    </View>
  );
};

export default Page;
