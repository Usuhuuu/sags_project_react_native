import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactElement,
} from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ListRenderItem,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { EsportHallDataType, SportHallDataType } from "@/interfaces/listing";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

interface Props {
  listings: (SportHallDataType | EsportHallDataType)[];
  category: string;
  refresh: number;
}

const ListingComponent = ({ listings: items, category }: Props) => {
  const { colors: Colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 5,
      paddingHorizontal: 16,
    },
    itemContainer: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: "hidden",
    },
    backgroundImage: {
      width: "100%",
      height: 200,
      justifyContent: "flex-end",
      resizeMode: "cover",
    },
    detailsContainer: {
      padding: 20,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      width: "100%",
    },
    text: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },
    placeholderImage: {
      width: 20,
      height: 20,
      marginRight: 8,
    },
    flatListContent: {},
    icon: {
      width: 23,
      height: 23,
    },

    categoryButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
    },

    viewButton: {
      backgroundColor: "rgba(97, 179, 250, 0) ",
      height: 200,
      width: 40,
      position: "absolute",
      right: 0,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  const [loading, setLoading] = useState(false);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleCategoryPress = (label: string): void => {
    setSelected(label);
  };
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [category, items]);

  const handlePress = useCallback(
    (sportHallID: string) => {
      router.push(`/listing/${sportHallID}`);
    },
    [router],
  );

  const isSportHall = (
    it: SportHallDataType | EsportHallDataType,
  ): it is SportHallDataType => {
    return !!(it as SportHallDataType).hall_details?.hall_price?.oneHour;
  };

  const ListingItem = React.memo(
    ({
      item,
      onPress,
    }: {
      item: SportHallDataType | EsportHallDataType;
      onPress: (id: string) => void;
    }) => {
      return (
        <TouchableOpacity
          onPress={() => onPress(item.sportHallID)}
          style={styles.itemContainer}
        >
          <ImageBackground
            source={require("../assets/images/listingicons/1.png")}
            style={styles.backgroundImage}
          >
            <View style={styles.detailsContainer}>
              <Text style={styles.text}>
                {item.hall_details?.hall_name ?? "Hall Name"}
              </Text>

              <View style={styles.ratingContainer}>
                <MaterialIcons name="sports-score" size={24} color="red" />
                {/* <Text style={styles.text}>
                  {item.review_scores_rating / 20}
                </Text> */}
              </View>

              <View style={styles.locationContainer}>
                <Image
                  source={require("../assets/images/placeholder.png")}
                  style={styles.placeholderImage}
                />
                {/* <Text style={styles.text}>{item.city}</Text>
                <Text style={styles.text}>{item.neighbourhood}</Text> */}
              </View>

              {/* {"price" in item ? (
                <AppText>{item.price.oneHour} / hr</AppText>
              ) : "prices" in item ? (
                <Text style={styles.text}>
                  ${item.prices.regularPc.oneHour} / hr
                </Text>
              ) : null} */}

              {isSportHall(item) ? (
                <AppText>{item.hall_details.hall_price.oneHour} / hr</AppText>
              ) : null}

              <TouchableOpacity style={styles.viewButton}>
                <Image
                  source={require("../assets/images/listingicons/right.png")}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    },
    (prevProps, nextProps) => prevProps.item === nextProps.item,
  );

  const renderRow: ListRenderItem<SportHallDataType | EsportHallDataType> =
    useCallback(
      ({ item }) => {
        return <ListingItem item={item} onPress={handlePress} />;
      },
      [handlePress],
    );

  const CategoryButton = ({
    label,
    selected,
    onPress,
  }: {
    label: ReactElement<any, any>;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryButton,
        selected && {
          backgroundColor: Colors.primary,
          borderRadius: 10,
          elevation: 5,
        }, // Selected button styling
      ]}
    >
      <Text
        style={[
          selected && {
            fontSize: 18,
            fontWeight: "bold",
            color: Colors.themeColorTextPure,
          }, // Change text color to white when selected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[Colors.backgroundColor, Colors.primary]}
      start={[0, 0]}
      end={[0, 1]}
      style={[styles.container, { flex: 1 }]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: Colors.backgroundColor,
          borderRadius: 20,
          paddingVertical: 8,
          marginVertical: 10,
          borderColor: Colors.primary,
          borderWidth: 1,
          elevation: 10,
          shadowOpacity: 0.3,
        }}
      >
        {["ойрхон ", "шилдэг", "зөвлөx"].map((label) => (
          <CategoryButton
            key={label}
            label={<AppText>{label}</AppText>}
            selected={selected === label}
            onPress={() => handleCategoryPress(label)}
          />
        ))}
      </View>

      {loading ? (
        <OwnActivaterIndicator />
      ) : (
        <BottomSheetFlatList
          ref={listRef}
          data={items}
          renderItem={renderRow}
          keyExtractor={(item) => item.sportHallID}
          contentContainerStyle={styles.flatListContent}
          onEndReached={() => console.log("end reached")}
          onEndReachedThreshold={0.1}
          initialNumToRender={10}
          windowSize={5}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      )}
    </LinearGradient>
  );
};

export default ListingComponent;
