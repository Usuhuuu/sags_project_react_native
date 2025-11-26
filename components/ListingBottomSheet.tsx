import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import React, { useMemo, useRef, useState } from "react";
import Listings from "@/components/Listing";
import BottomSheet from "@gorhom/bottom-sheet";
import { SportHallDataType } from "@/interfaces/listing";
import { Ionicons } from "@expo/vector-icons";
import type { SharedValue } from "react-native-reanimated";
import { useTheme } from "@/app/(modals)/context/themeContext";

interface ListingBottomSheetProps {
  listing: SportHallDataType[];
  category: string;
  bottomSheetY: SharedValue<number>; // Shared value to track bottom sheet position
}

const ListingBottomSheet = ({
  listing,
  category,
  bottomSheetY,
}: ListingBottomSheetProps) => {
  const { colors: Colors } = useTheme();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const [refresh, setrefresh] = useState<number>(0);

  const showMap = () => {
    bottomSheetRef.current?.collapse();
    setrefresh(refresh + 1);
  };

  const snapPoints = useMemo(() => ["5%", "90%"], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableOverDrag={false}
      animatedPosition={bottomSheetY} // Connect shared value hereW
      handleStyle={{
        backgroundColor: Colors.backgroundColor,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.primary,
        width: 60,
        borderRadius: 2,
      }}
      style={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: Colors.backgroundColor,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.backgroundColor,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          flex: 1,
        }}
      >
        <Listings listings={listing} category={category} refresh={refresh} />
        <View style={styles.absoluteBtn}>
          <TouchableOpacity
            onPress={showMap}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 15,
              height: 40,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
              marginRight: 20,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
              bottom: 30,
              gap: 5,
            }}
          >
            <Text style={styles.btnText}>Map</Text>
            <Ionicons name="map" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  absoluteBtn: {
    position: "absolute",
    bottom: 50,
    alignSelf: "flex-end",
    width: "30%",
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ListingBottomSheet;
