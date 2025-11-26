import React, { useEffect, useLayoutEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  View,
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
import Animated, {
  SlideInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import OrderScreen, { FormData } from "./detail";
import { SportHallDataType } from "@/interfaces/listing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 500;
const bottompadding = width * 0.1;

const DetailsPage = () => {
  const { colors: Colors } = useTheme();
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
      color: Colors.themeColorTextPure,
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
      fontSize: 20,
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
      borderColor: Colors.themeColorTextPure,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      height: 40,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: Colors.shadowColor,
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
    iconColor: {
      color: Colors.themeColorTextPure,
    },
  });

  const featureIcons = {
    changingRoom: {
      icon: (
        <MaterialCommunityIcons
          name="ceiling-light"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Хувцас солих өрөө",
    },
    shower: {
      icon: (
        <FontAwesome
          name="shower"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Душ",
    },
    lighting: {
      icon: (
        <MaterialCommunityIcons
          name="ceiling-light"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Гэрэлтүүлэг",
    },
    spectatorSeats: {
      icon: (
        <MaterialCommunityIcons
          name="ceiling-light"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Үзэгчдийн суудал",
    },
    parking: {
      icon: (
        <FontAwesome5
          name="parking"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Зогсоол",
    },
    freeWifi: {
      icon: (
        <AntDesign name="wifi" size={24} color={Colors.themeColorTextPure} />
      ),
      label: "Free WiFi",
    },
    scoreboard: {
      icon: (
        <MaterialCommunityIcons
          name="ceiling-light"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Онооны самбар",
    },
    speaker: {
      icon: (
        <FontAwesome
          name="volume-up"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Чанга яригч",
    },
    microphone: {
      icon: (
        <FontAwesome
          name="microphone"
          size={24}
          color={Colors.themeColorTextPure}
        />
      ),
      label: "Микрофон",
    },
    // tennis: { icon: "tennis-ball", label: "Теннис" },
    // billiards: { icon: "circle", label: "Билльярд" },
    // darts: { icon: "target", label: "Дартс" },
  };

  const [isOrderScreenVisible, setIsOrderScreenVisible] =
    useState<boolean>(false);
  const [infoHeight, setInfoHeight] = useState(0);
  const [iconsOverflow, setIconsOverflow] = useState<boolean>(false);
  const [footerBgColor, setFooterBgColor] = useState(Colors.backgroundColor);
  const [formData, setFormData] = useState<FormData>({
    sportHallID: "",
    date: "",
    name: "",
    price: {
      oneHour: "",
      wholeDay: "",
    },
    image: [],
    location: {
      latitude: "",
      longitude: "",
      smart_location: "",
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

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const newColor = Math.max(0, Math.min(1, 1 - scrollY / 200));
    setFooterBgColor(hexToRgba(Colors.backgroundColor, newColor));
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
    workTime: string | undefined,
    imageUrls: string[] | undefined,
    location?: {
      latitude: string;
      longitude: string;
      smart_location?: string | undefined;
    }
  ) => {
    setFormData((prev) => ({
      ...prev,
      sport_hall_id: input,
      name: name,
      price: price,
      workTime: workTime,
      image: imageUrls,
      location: location ? location : prev.location,
    }));
  };

  useEffect(() => {
    handleZaalId(
      sportHallID,
      listing?.name,
      listing?.price,
      `${listing?.workTime.startTime}~${listing?.workTime.endTime}`,
      listing?.imageUrls,
      listing?.location
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
        <AppText>{listing?.sportHallID}</AppText>
        <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setInfoHeight(height); // Update state with calculated height
          }}
          style={styles.infoContainer}
        >
          <LinearGradient
            colors={[Colors.backgroundColor, Colors.primary]}
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
            <AppText style={styles.name}>{listing?.name}</AppText>
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
                <AppText style={{ color: "white", fontSize: 12 }}>
                  Zvg chig
                </AppText>
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
              <AppText style={{ fontSize: 10 }}>
                {listing?.location.smart_location}
              </AppText>
            </View>

            {/* Rating container */}
            <View
              style={{
                flex: iconsOverflow ? 0.25 : 0.3,
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
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 5,
                }}
              >
                <MaterialIcons name="sports-score" size={18} color="red" />
                <TouchableOpacity onPress={handleViewReviews}>
                  <AppText style={styles.ratings}>total review</AppText>
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
              <AppText style={styles.rooms}>Facilities</AppText>
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
            <AppText style={styles.description}>{listing?.address}</AppText>
            <AppText>{listing?.phoneNumber}</AppText>
            <AppText>
              {listing?.workTime.startTime}
              {listing?.workTime.endTime}
            </AppText>
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
            <AppText style={styles.footerPrice}>
              €{listing?.price.oneHour}
            </AppText>
            <AppText style={styles.footerPrice}>/ 1 tsag</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsOrderScreenVisible(true)}
            style={[styles.btn, { paddingRight: 20, paddingLeft: 20 }]}
          >
            <AppText
              style={{
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              Zahialga
            </AppText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal
        animationType="slide"
        visible={isOrderScreenVisible}
        transparent
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

export default DetailsPage;
