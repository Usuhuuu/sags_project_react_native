import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import "@/utils/i18";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withTiming,
  useSharedValue,
  interpolateColor,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import type { SharedValue } from "react-native-reanimated";
import { useNotificationStore } from "@/src/context/store/notificationStore";
import { useTheme } from "@/src/context/themeContext";
import LottieView from "lottie-react-native";
import { HallCategoryValue } from "@/interfaces/listing";
import { Feather, Ionicons } from "@expo/vector-icons";

// ICON MAP
const iconMap: { [key: string]: any } = {
  basketball: require("../assets/sport-icons/basketball.png"),
  football: require("../assets/sport-icons/football.png"),
  volleyball: require("../assets/sport-icons/volleyball.png"),
  tennis: require("../assets/sport-icons/table-tennis.png"),
  bowling: require("../assets/sport-icons/lanes.png"),
  golf: require("../assets/sport-icons/golf.png"),
  desktopComputer: require("../assets/sport-icons/pc.png"),
  gameController: require("../assets/sport-icons/playstation.png"),
};

interface Props {
  onCategoryChanged: (category: HallCategoryValue) => void;
  bottomSheetY: SharedValue<number>;
}

const ExploreHeader = ({ onCategoryChanged, bottomSheetY }: Props) => {
  const { colors: Colors } = useTheme();
  const { width, height } = Dimensions.get("screen");

  const expandedY = height * 0.1;
  const fadeStart = height * 0.28;

  const styles = useMemo(() => createStyles(Colors, height), [Colors]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { t } = useTranslation();
  const sportDetail: any = t("sportTextIcons", { returnObjects: true });

  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  );
  const notifications = useNotificationStore((state) => state.notifications);
  const notificationAnimationRef = useRef<LottieView>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // If you want to track count:
  useEffect(() => {
    const tempCount = notifications.filter((n) => n.seen !== true);
    setNotificationCount(tempCount.length);
    if (notifications.length > 0) {
      notificationAnimationRef.current?.reset();
      notificationAnimationRef.current?.play();
    }
  }, [notifications]);

  // Animate icons wrapper up as sheet moves
  const animatedIconAction = useAnimatedStyle(() => {
    const translateYValue = interpolate(
      bottomSheetY.value,
      [0, height * 0.5],
      [-80, 0],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{ translateY: translateYValue }],
    };
  });

  // Background fades in with sheet movement
  const animatedIconSectionStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bottomSheetY.value,
      [fadeStart, expandedY],
      ["transparent", Colors.backgroundColor],
    );
    return {
      backgroundColor,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bottomSheetY.value,
      [height, 0],
      [Colors.backgroundColor, "transparent"],
    );
    return { backgroundColor };
  });

  const badgeScale = useSharedValue(0);
  useEffect(() => {
    if (notificationCount > 0) {
      badgeScale.value = withSpring(1, { damping: 2, stiffness: 100 });
    } else {
      badgeScale.value = withTiming(0, { duration: 200 });
    }
  }, [notificationCount]);

  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: badgeScale.value }],
      opacity: badgeScale.value,
    };
  });

  const itemsRef = useRef<(View | null)[]>([]);

  const selectCategory = (index: number) => {
    const selected = itemsRef.current[index];
    setActiveIndex(index);
    if (selected) {
      (selected as unknown as View).measure(
        (_fx, fy, width, height, px, py) => {
          scrollRef.current?.scrollTo({ x: px - 16, animated: true });
        },
      );
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategoryChanged(sportDetail[index].id);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.backgroundColor, flex: 1 }}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Action Row */}
        <View style={[styles.actionRowWrapper]}>
          <TouchableOpacity style={styles.search}>
            <Feather name="search" size={24} color={Colors.darkGrey} />
            <TextInput
              placeholder="Search sports or facilities"
              placeholderTextColor={Colors.darkGrey}
            />
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            style={[styles.notification]}
            onPress={() => router.push("/listing/notification/notification")}
          >
            <LottieView
              ref={notificationAnimationRef}
              loop={false}
              source={require("../assets/sport-icons/animated/notification.json")}
              style={{ width: 70, height: 70 }}
            />
            {notificationCount > 0 && (
              <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity style={styles.notification} onPress={openDrawer}>
            <Image
              source={require("../assets/sport-icons/menu.png")}
              style={{
                width: 24,
                height: 24,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Icons Section */}
        <Animated.View
          style={[
            styles.iconsWrapper,
            animatedIconAction,
            animatedIconSectionStyle,
          ]}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.scrollViewContent]}
          >
            {sportDetail?.map((item: any, index: number) => {
              const itemWidth = width / Object.keys(iconMap).length;
              return (
                <TouchableOpacity
                  key={index}
                  ref={(el) => (itemsRef.current[index] = el)}
                  style={[
                    activeIndex === index
                      ? styles.categoriesBtnActive
                      : styles.categoriesBtn,
                    {
                      width: itemWidth,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: Colors.backgroundColor,
                      shadowColor: Colors.shadowColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      borderRadius: 25,
                      borderWidth: 1,
                      borderColor:
                        activeIndex === index
                          ? Colors.primary
                          : Colors.themeContainerGrey,
                    },
                  ]}
                  onPress={() => selectCategory(index)}
                >
                  <Image
                    source={iconMap[item.icon]}
                    style={{
                      width: 25,
                      height: 25,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const createStyles = (Colors: any, height: number) =>
  StyleSheet.create({
    container: {
      overflow: "visible",
      height: height * 0.15,
    },
    actionRowWrapper: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingTop: 10,
      paddingHorizontal: 10,
    },
    search: {
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      width: 250,
      height: 40,
      backgroundColor: Colors.themeContainerGrey,
      borderColor: Colors.containerColor,
      borderWidth: 2,
      borderRadius: 20,
      elevation: 10,
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: { width: 0.3, height: 0.3 },
    },
    notification: {
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.containerColor,
      borderColor: Colors.containerColor,
      elevation: 10,
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },

    badgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    iconsWrapper: {
      position: "absolute",
      top: 70,
      left: 0,
      right: 0,
    },
    scrollViewContent: {
      flexDirection: "row",
      gap: 10,
      paddingLeft: 10,
    },
    categoriesBtn: {
      alignItems: "center",
      paddingBottom: 6,
    },
    categoriesBtnActive: {
      alignItems: "center",
      borderColor: Colors.primary,
      borderWidth: 1.5,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.light,
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    titleText: {
      color: Colors.themeColorTextPure,
      fontWeight: "500",
      alignItems: "center",
      justifyContent: "center",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 12,
    },

    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1E293B",
      height: 48,
      borderRadius: 24,
      paddingHorizontal: 16,
      marginRight: 12,
    },

    searchPlaceholder: {
      color: "#94A3B8",
      fontSize: 14,
    },

    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#1E293B",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },

    badge: {
      position: "absolute",
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
  });

export default ExploreHeader;
