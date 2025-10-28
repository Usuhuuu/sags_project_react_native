import React, { useEffect, useLayoutEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Share,
  Modal,
  ImageBackground,
} from "react-native";
import SportHallData from "@/assets/Data/sportHall.json";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Animated, {
  SlideInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { defaultStyles } from "@/constants/Styles";
import { LinearGradient } from "expo-linear-gradient";
import OrderScreen, { FormData } from "./detail";
import { SportHallDataType } from "@/interfaces/listing";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 500;
const bottompadding = width * 0.1;

const featureIcons = {
  changingRoom: {
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={24} color="black" />
    ),
    label: "Хувцас солих өрөө",
  },
  shower: {
    icon: <FontAwesome name="shower" size={24} color="black" />,
    label: "Душ",
  },
  lighting: {
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={24} color="black" />
    ),
    label: "Гэрэлтүүлэг",
  },
  spectatorSeats: {
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={24} color="black" />
    ),
    label: "Үзэгчдийн суудал",
  },
  parking: {
    icon: <FontAwesome5 name="parking" size={24} color="black" />,
    label: "Зогсоол",
  },
  freeWifi: {
    icon: <AntDesign name="wifi" size={24} color="black" />,
    label: "Free WiFi",
  },
  scoreboard: {
    icon: (
      <MaterialCommunityIcons name="ceiling-light" size={24} color="black" />
    ),
    label: "Онооны самбар",
  },
  speaker: {
    icon: <FontAwesome name="volume-up" size={24} color="black" />,
    label: "Чанга яригч",
  },
  microphone: {
    icon: <FontAwesome name="microphone" size={24} color="black" />,
    label: "Микрофон",
  },
  // tennis: { icon: "tennis-ball", label: "Теннис" },
  // billiards: { icon: "circle", label: "Билльярд" },
  // darts: { icon: "target", label: "Дартс" },
};

const DetailsPage = () => {
  const [isOrderScreenVisible, setIsOrderScreenVisible] =
    useState<boolean>(false);
  const [infoHeight, setInfoHeight] = useState(0);
  const [iconsOverflow, setIconsOverflow] = useState<boolean>(false);
  const [footerBgColor, setFooterBgColor] = useState(`rgba(255, 255, 255, 1)`);
  const [formData, setFormData] = useState<FormData>({
    sportHallID: "",
    date: "",
    name: "",
    price: {
      oneHour: "",
      wholeDay: "",
    },
  });
  const { sportHallID } = useLocalSearchParams();
  const listing = (SportHallData as unknown as SportHallDataType[]).find(
    (item) => item.sportHallID == sportHallID
  );
  const navigation = useNavigation();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    const newColor = Math.max(0, Math.min(1, 1 - scrollY / 200));
    setFooterBgColor(`rgba(255, 255, 255, ${newColor})`);
  };

  const shareListing = async () => {
    try {
      await Share.share({
        title: listing?.name,
        url: listing?.listing_url,
        message: `${listing?.name ?? "Check out this listing!"} ${
          listing?.listing_url ?? ""
        }`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewReviews = () => {
    router.push({
      pathname: `/listing/review/[zaalReview]`,
      params: {
        zaalReview: listing?.sportHallID ?? "",
      },
    });
  };

  const handleSaveCourt = async () => {
    try {
      const existing = await AsyncStorage.getItem("savedCourts");

      // Define the structure of a saved court
      interface SavedCourt {
        id: string;
        name: string;
        image?: string; // optional
        location?: string; // optional
      }

      const saved: SavedCourt[] = existing ? JSON.parse(existing) : [];

      const alreadySaved = saved.some(
        (court) => court.id === listing?.sportHallID
      );

      if (alreadySaved) {
        alert("Court already saved!");
        return;
      }

      const newCourt: SavedCourt = {
        id: listing?.sportHallID ?? "",
        name: listing?.name ?? "Unknown",
        image: Array.isArray(listing?.imageUrls)
          ? listing?.imageUrls[0] ?? ""
          : listing?.imageUrls ?? "", // Add image if available
        location:
          typeof listing?.location === "string"
            ? listing.location
            : listing?.location?.smart_location ?? "", // Add location if available
      };

      const updated = [...saved, newCourt];

      await AsyncStorage.setItem("savedCourts", JSON.stringify(updated));
      alert("Court saved!");
    } catch (error) {
      console.error("Failed to save court:", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTransparent: true,

      headerBackground: () => (
        <Animated.View
          style={[headerAnimatedStyle, styles.header]}
        ></Animated.View>
      ),
      headerRight: () => (
        <View style={styles.bar}>
          <TouchableOpacity onPress={shareListing}>
            <Image
              source={require("@/assets/images/listingicons/share.png")}
              style={styles.headerButton}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveCourt}
            style={styles.roundButton}
          >
            <Image
              source={require("@/assets/images/saved.png")}
              style={styles.headerButton}
            />
          </TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("@/assets/images/listingicons/arrow.png")}
            style={styles.headerButton}
          />
        </TouchableOpacity>
      ),
    });
  }, []);

  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
    };
  }, []);

  const handleZaalId = (
    input: any,
    name: any,
    price: any,
    workTime: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      sport_hall_id: input,
      name: name,
      price: price,
      workTime: workTime,
    }));
  };

  useEffect(() => {
    handleZaalId(
      sportHallID,
      listing?.name,
      listing?.price,
      `${listing?.workTime.startTime}~${listing?.workTime.endTime}`
    );
  }, [sportHallID]);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: bottompadding }}
        ref={scrollRef}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <Animated.Image
          source={{
            uri: Array.isArray(listing?.imageUrls)
              ? listing.imageUrls[0]
              : listing?.imageUrls,
          }}
          style={[styles.image, imageAnimatedStyle]}
          resizeMode="cover"
        />
        <Text>{listing?.sportHallID}</Text>
        <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setInfoHeight(height); // Update state with calculated height
          }}
          style={styles.infoContainer}
        >
          <LinearGradient
            colors={["#f8f9fa", Colors.primary]}
            start={[0, 0]}
            end={[0, 2]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: infoHeight + 60,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
          <View
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setIconsOverflow(width > 120); // Adjust threshold based on icon count
            }}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.name}>{listing?.name}</Text>
            <TouchableOpacity style={styles.hostView}>
              <ImageBackground
                source={require("@/assets/images/listingicons/map.png")}
                style={styles.host}
                imageStyle={{
                  borderRadius: 20,
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: 0,
                }}
              >
                <Ionicons name="location" size={24} color="white" />
                <Text style={{ color: "white", fontSize: 12 }}>Zvg chig</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 5,
              marginTop: 5,
            }}
          >
            {/* Location container */}
            <View
              style={{
                flex: iconsOverflow ? 0.25 : 0.3, // Shrinks width if icons overflow
                alignItems: "center",
                borderColor: Colors.grey,
                borderWidth: 1,
                borderRadius: 20,
                padding: 10,
                marginRight: 5,
              }}
            >
              <Image
                source={require("@/assets/images/placeholder.png")}
                style={styles.placeholderImage}
              />
              <Text style={{ fontSize: 12 }}>
                {listing?.location.smart_location}
              </Text>
            </View>

            {/* Rating container */}
            <View
              style={{
                flex: iconsOverflow ? 0.25 : 0.3, // Shrinks width if icons overflow
                alignItems: "center",
                borderColor: Colors.grey,
                borderWidth: 1,
                borderRadius: 20,
                padding: 10,
                marginLeft: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 5,
                }}
              >
                <MaterialIcons name="sports-score" size={18} color="red" />
                <Text style={{ fontSize: 12 }}>review oruulan sda</Text>
                <TouchableOpacity onPress={handleViewReviews}>
                  <Text style={styles.ratings}>total review sda</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Facilities container */}
            <View
              style={{
                flex: iconsOverflow ? 0.5 : 0.4, // Expands if icons overflow
                alignItems: "center",
                borderColor: Colors.grey,
                borderWidth: 1,
                borderRadius: 20,
                padding: 10,
                marginLeft: 5,
              }}
            >
              <Text style={styles.rooms}>Facilities</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* Icons */}
                {Object.entries(featureIcons).map(([key, { icon, label }]) => (
                  <View key={key}>{icon}</View>
                ))}
              </View>
            </View>
          </View>
          {/* Description data like address hereggui ymnud lalar */}
          <View>
            <Text style={styles.description}>{listing?.address}</Text>
            <Text>{listing?.phoneNumber}</Text>
            <Text>
              {listing?.workTime.startTime}
              {listing?.workTime.endTime}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[styles.footer, { backgroundColor: footerBgColor }]}
        entering={SlideInDown.delay(200)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flex: 1,
          }}
        >
          <TouchableOpacity style={styles.footerText}>
            <Text style={styles.footerPrice}>€{listing?.price.oneHour}</Text>
            <Text>/1 tsag</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsOrderScreenVisible(true)}
            style={[styles.btn, { paddingRight: 20, paddingLeft: 20 }]}
          >
            <Text style={defaultStyles.btnText}>zahialga</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal
        animationType="slide"
        visible={isOrderScreenVisible}
        transparent={true}
        onRequestClose={() => setIsOrderScreenVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <OrderScreen
              formData={formData}
              setFormData={setFormData}
              sportHallID={listing?.sportHallID ?? ""}
              setIsOrderScreenVisible={setIsOrderScreenVisible}
              baseTimeSlot={
                Array.isArray(listing?.availableTimeSlots)
                  ? listing.availableTimeSlots
                      .filter(
                        (slot) =>
                          typeof slot.start_time === "string" &&
                          typeof slot.end_time === "string"
                      )
                      .map((slot) => ({
                        start_time: slot.start_time as string,
                        end_time: slot.end_time as string,
                      }))
                  : []
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    height: IMG_HEIGHT + 100,
    width: width,
    marginBottom: 0,
  },
  infoContainer: {
    padding: 24,
    marginTop: -40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  text: {
    fontFamily: "mon",
  },
  boldText: {
    fontFamily: "mon-sb",
  },
  name: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "mon-sb",
  },
  location: {
    flexDirection: "row",
    fontSize: 18,
    marginTop: 10,
    fontFamily: "mon-sb",
    color: Colors.primary,
  },
  rooms: {
    fontSize: 12,
    color: Colors.dark,
    marginVertical: 4,
  },
  ratings: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: "mon-sb",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.grey,
    marginVertical: 16,
  },
  placeholderImage: {
    width: 20,
    height: 20,
  },
  host: {
    width: 120, // Adjust as needed for image size
    height: 70, // Adjust height to fit the host profile image // Circular image
    justifyContent: "center",
    alignItems: "center",
  },

  hostView: {
    flexDirection: "row",
    alignItems: "center",
    left: 25,
    height: 70,
    width: "auto", // Dynamically adjusts based on content
  },

  footer: {
    position: "absolute",
    padding: 20,
    height: 60,
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    height: 40,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerPrice: {
    fontSize: 18,
    fontFamily: "mon-sb",
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    color: Colors.primary,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  header: {
    backgroundColor: "#fff",
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey,
  },
  description: {
    fontSize: 16,
    marginTop: 10,
  },
  headerButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "black",
    width: 40,
    height: 40,
  },
  btn: {
    borderColor: Colors.dark,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
  modalContent: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    width: "90%",
    height: "90%",
  },
});

export default DetailsPage;
