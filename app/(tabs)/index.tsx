import { View, StyleSheet, Dimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack } from "expo-router";
import ExploreHeader from "@/components/ExploreHeader";
import ListingsMap from "@/components/ListingsMap";
import listingsDataGeo from "@/assets/Data/airbnb-listings.geo (1).json"; // Ensure the filename is correct
import { ListingGeo } from "@/interfaces/listingGeo";
import ListingBottomSheet from "@/components/ListingBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import the root view component
import Colors from "@/constants/Colors";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface FeatureCollection {
  type: "FeatureCollection";
  features: ListingGeo[];
}

const Page = () => {
  const listingsData = require("@/assets/Data/airbnb-listings.json");
  const [category, setCategory] = useState<string>("Sags");
  const items = useMemo(() => listingsData as any[], []);
  // Category change handler
  const onDataChanged = (category: string) => {
    console.log(`CHANGED_`, category);
    setCategory(category);
  };
  const { bottom, top } = useSafeAreaInsets();
  const height = Dimensions.get("window").height;
  return (
    <GestureHandlerRootView style={[styles.container, { marginTop: top }]}>
      <Stack.Screen
        options={{
          header: () => <ExploreHeader onCategoryChanged={onDataChanged} />,
        }}
      />
      {/*<Listing listings={items} category={category} />*/}
      <ListingsMap listings={listingsDataGeo as FeatureCollection} />
      <ListingBottomSheet listing={items} category={category} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
  },
});

export default Page;
