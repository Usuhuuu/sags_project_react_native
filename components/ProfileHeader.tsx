import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Share,
  TouchableOpacity,
  Image,
} from "react-native";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";

import { router, useNavigation } from "expo-router";
import Animated, {
  SlideInDown,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import ProfileData from "./profileData";

import Colors from "../constants/Colors";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { FriendProfileType } from "@/app/(tabs)/friend";
import { useTranslation } from "react-i18next";

const IMG_HEIGHT = 200;
const { width } = Dimensions.get("window");

interface SavedCourt {
  id: string;
  name: string;
  image: any;
  location: string;
}
interface ProfileHeaderProps {
  userData: FriendProfileType;
}
function CarouselItem({
  item,
  index,
  scrollX,
}: {
  item: any;
  index: number;
  scrollX: any;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];
    const scale = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7]);
    const rotateY = interpolate(scrollX.value, inputRange, [30, 0, -30]);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20]);

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { translateY },
      ],
    };
  });

  return (
    <Animated.View style={[styles.menuItem, animatedStyle]}>
      <Image source={item.icon} style={{ width: 50, height: 50 }} />
      <Text style={styles.titleText}>{item.name}</Text>
    </Animated.View>
  );
}

const _itemSize = width / 3;
const _spacing = 10;
const _itemTotalSize = _itemSize + _spacing;

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
  const flatListRef = useRef<FlatList>(null);

  const scrollref = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollref);
  const navigation = useNavigation();

  const scrollX = useSharedValue(0);

  const { t } = useTranslation();
  const profileLanguageData: any = t("profilesdaData", { returnObjects: true });
  const sdaData = Array.isArray(profileLanguageData)
    ? profileLanguageData[0]
    : [];
  const data = sdaData?.profileData[0];
  console.log(data);

  const menu = [
    { name: data.savedHalls, icon: require("@/assets/images/saved.png") },
    {
      name: data.archievements,
      icon: require("@/assets/tab-icons/athlete.png"),
    },
    { name: data.rewards, icon: require("@/assets/tab-icons/athlete.png") },
  ];
  const [selectedItem, setSelectedItem] = useState(menu[1].name); // Default center
  useEffect(() => {
    const loadSavedCourts = async () => {
      try {
        const data = await AsyncStorage.getItem("savedCourts");
        if (data) setSavedCourts(JSON.parse(data));
      } catch (error) {
        console.error("Error loading courts:", error);
      }
    };
    loadSavedCourts();
  }, []);

  const [savedCourts, setSavedCourts] = useState<SavedCourt[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadSavedCourts = async () => {
        try {
          const json = await AsyncStorage.getItem("savedCourts");
          if (json) {
            const courts = JSON.parse(json);
            setSavedCourts(courts);
          } else {
            setSavedCourts([]);
          }
        } catch (e) {
          console.error("Failed to load courts", e);
        }
      };

      loadSavedCourts();
    }, [])
  );

  const handleCourtPress = (court: SavedCourt) => {
    // Navigate to the court details screen or perform any action
    console.log(`Court pressed: ${court.name}`);
    router.push({
      pathname: "/listing/[sportHallID]",
      params: { sportHallID: court.id },
    });
  };
  // Perform any other action you want when a court is pre

  const handleRemove = async (id: string) => {
    const filtered = savedCourts.filter((court) => court.id !== id);
    setSavedCourts(filtered);
    await AsyncStorage.setItem("savedCourts", JSON.stringify(filtered));
  };

  const renderRightActions = (courtId: string) => (
    <TouchableOpacity
      onPress={() => handleRemove(courtId)}
      style={{
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: "90%",
        borderRadius: 10,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>Remove</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: _itemTotalSize * 1,
        animated: false,
      });
      scrollX.value = 1;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x / _itemTotalSize;
  });

  const handleMomentumScrollEnd = (event: any): void => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / _itemTotalSize
    );
    setSelectedItem(menu[index]?.name);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "",
      headerTransparent: true,
      headerTintColor: "transparent",

      headerStyle: {
        backgroundColor: "transparent",
        elevation: 0,
        shadowOpacity: 0,
      },
    });
    navigation.setOptions({
      headerBackground: () => <Animated.View style={[styles.header]} />,
      headerRight: () => (
        <View style={styles.bar}>
          <TouchableOpacity
            onPress={() =>
              Share.share({
                message: "Check out this profile!",
              })
            }
          >
            <Image
              source={require("@/assets/images/listingicons/share.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("@/assets/images/listingicons/arrow.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    // Add your animated style logic here if needed
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75],
            "clamp"
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [1.5, 1, 0.75],
            "clamp"
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e5f0ff", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.ScrollView ref={scrollref} scrollEventThrottle={16}>
        <Animated.Image
          source={require("../assets/images/profileIcons/profile.jpg")}
          style={[styles.image, imageAnimatedStyle]}
          resizeMode="cover"
        />

        {/* Use a marginTop instead of position: 'absolute' */}

        <Animated.View
          entering={SlideInDown}
          style={{
            marginTop: -20, // slight overlap if desired
            marginHorizontal: 20,
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            borderWidth: 2,
            borderColor: Colors.primary,
          }}
        >
          <Text style={styles.headerTitle}>{data.profile}</Text>
          <Text style={styles.titleText}>{data.userName} :</Text>
          <Text style={styles.subHeader}>{userData?.unique_user_ID}</Text>
          <Text style={styles.titleText}>{data.name} :</Text>
          <Text style={styles.subHeader}>
            {userData?.userNames?.firstName} {userData?.userNames?.lastName}
          </Text>
          <Text style={styles.titleText}>{data.email} :</Text>
          <Text style={styles.subHeader}>{userData?.email}</Text>
        </Animated.View>

        {/* Carousel Section */}
        <Animated.View
          entering={SlideInDown}
          style={[styles.menuContainer, { marginTop: 30 }]}
        >
          <Animated.FlatList
            ref={flatListRef}
            data={menu}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <CarouselItem item={item} index={index} scrollX={scrollX} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            snapToInterval={_itemTotalSize}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: width / 2 - _itemSize / 2,
              height: 200,
            }}
            style={{ flexGrow: 0, paddingVertical: 10 }}
          />
        </Animated.View>

        {/* Dynamic Section */}
        <Animated.View style={{ marginTop: 30, paddingHorizontal: 20 }}>
          {selectedItem === data.savedHalls && (
            <ScrollView
              style={styles.savedListContainer}
              contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
            >
              {savedCourts.length > 0 ? (
                savedCourts.map((court) => (
                  <Swipeable
                    key={court.id}
                    renderRightActions={() => renderRightActions(court.id)}
                  >
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => handleCourtPress(court)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: court.image }}
                        style={styles.cardImage}
                      />
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>{court.name}</Text>
                        <Text style={styles.cardSubtitle}>
                          {court.location}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                ))
              ) : (
                <Text style={styles.dynamicText}>No saved courts yet.</Text>
              )}
            </ScrollView>
          )}
          {selectedItem === data.archievements && <ProfileData />}
          {selectedItem === data.rewards && (
            <Text style={styles.dynamicText}>
              🎁 Rewards or statistics shown here.
            </Text>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    marginTop: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary,
  },
  subHeader: {
    fontSize: 24,
    color: "#666",
  },
  titleText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  menuItem: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
    width: _itemSize + 10,
    height: _itemSize + 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: Colors.light,
    borderWidth: 1,
  },
  savedListContainer: {
    maxHeight: 300, // You can adjust based on your layout
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 10,
  },

  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderTopStartRadius: 500,
    borderBottomEndRadius: 500,
    borderTopEndRadius: 200,
    borderBottomStartRadius: 200,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 100,
    height: 200,
  },
  dynamicText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.dark,
    backgroundColor: Colors.light,
    padding: 15,
    borderRadius: 10,
  },

  image: {
    height: IMG_HEIGHT,
    width: width,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginRight: 20,
  },
  header: {
    backgroundColor: "transparent",
    height: 80,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "gray",
  },
});

export default ProfileHeader;
