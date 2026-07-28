import { View } from "react-native";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/hall_components/explore_header";
import ListingsMap from "@/components/hall_components/listing_map";
import ListingBottomSheet from "@/components/hall_components/bottom_sheet";
import { useSharedValue } from "react-native-reanimated";
import { HallCategoryValue } from "@/types/hall_info_type";
import { useHallInfo } from "@/context/hall_info_context";

const Page = () => {
  const { getAllHalls } = useHallInfo();
  const hallData = getAllHalls();
  const [category, setCategory] = useState<HallCategoryValue>(
    HallCategoryValue.BASKET_BALL,
  );
  const [debouncedRegion, setDebouncedRegion] = useState<any>(null);
  const regionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bottomSheetY = useSharedValue(0);

  useEffect(() => {
    return () => {
      if (regionTimeoutRef.current) clearTimeout(regionTimeoutRef.current);
    };
  }, []);

  const onDataChanged = useCallback((c: HallCategoryValue) => {
    setCategory(c);
  }, []);

  // All halls in selected category — passed to map for viewport culling
  const categoryHalls = useMemo(() => {
    return Object.values(hallData).filter((item) =>
      item.hall_types?.sub?.includes(category),
    );
  }, [category, hallData]);

  // Region-filtered (debounced) — for bottom sheet list
  const visibleHalls = useMemo(() => {
    if (!debouncedRegion) return categoryHalls;
    const north = debouncedRegion.latitude + debouncedRegion.latitudeDelta / 2;
    const south = debouncedRegion.latitude - debouncedRegion.latitudeDelta / 2;
    const east = debouncedRegion.longitude + debouncedRegion.longitudeDelta / 2;
    const west = debouncedRegion.longitude - debouncedRegion.longitudeDelta / 2;
    return categoryHalls.filter((hall) => {
      const lat = parseFloat(hall.hall_locations?.latitude);
      const lng = parseFloat(hall.hall_locations?.longitude);
      return lat >= south && lat <= north && lng >= west && lng <= east;
    });
  }, [debouncedRegion, categoryHalls]);

  const handleRegionChange = useCallback((r: any) => {
    if (regionTimeoutRef.current) clearTimeout(regionTimeoutRef.current);
    regionTimeoutRef.current = setTimeout(() => {
      setDebouncedRegion({
        latitude: r.latitude,
        longitude: r.longitude,
        latitudeDelta: r.latitudeDelta,
        longitudeDelta: r.longitudeDelta,
      });
    }, 300);
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
        listings={categoryHalls}
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
