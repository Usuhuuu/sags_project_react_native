import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import React, { useMemo, useRef } from "react";
import Listings from "@/components/hall_components/listing";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  EsportHallDataType,
  HallCategoryValue,
  SportHallDataType,
} from "@/types/hall_info_type";
import { Ionicons } from "@expo/vector-icons";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedReaction } from "react-native-reanimated";
import { useTheme } from "@/context/theme_context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";

interface ListingBottomSheetProps {
  listing: (SportHallDataType | EsportHallDataType)[];
  category: HallCategoryValue;
  bottomSheetY: SharedValue<number>;
}

const ListingBottomSheet = ({
  listing,
  category,
  bottomSheetY,
}: ListingBottomSheetProps) => {
  const { colors: Colors } = useTheme();
  const { height } = Dimensions.get("window");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const insets = useSafeAreaInsets();
  const unabledHeight = height - insets.bottom - insets.top;
  const snapPoints = useMemo(
    () => [unabledHeight * 0.04, unabledHeight * 0.85],
    [unabledHeight],
  );

  const showMap = () => {
    bottomSheetRef.current?.collapse();
  };

  useAnimatedReaction(
    () => bottomSheetY.value <= unabledHeight * 0.8,
    (shouldExpand, previous) => {
      if (shouldExpand !== previous) {
        runOnJS(setIsExpanded)(shouldExpand);
      }
    },
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableOverDrag={false}
      index={isExpanded ? 1 : 0}
      animatedPosition={bottomSheetY}
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
          flex: 1,
        }}
      >
        <Listings
          listings={listing}
          category={category}
          isExpanded={isExpanded}
        />

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
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ListingBottomSheet;
