import React, { useRef, useState, useEffect } from "react";
import {
  StatusBar,
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
import { useNotificationStore } from "@/app/(modals)/context/store/notificationStore";
import { useTheme } from "@/app/(modals)/context/themeContext";

// ICON MAP
const iconMap: { [key: string]: any } = {
  basketball: require("../assets/sport-icons/basketball.png"),
  football: require("../assets/sport-icons/football.png"),
  volleyball: require("../assets/sport-icons/volleyball.png"),
  tennis: require("../assets/sport-icons/table-tennis.png"),
  bowling: require("../assets/sport-icons/lanes.png"),
  golf: require("../assets/sport-icons/golf.png"),
};

interface Props {
  onCategoryChanged: (category: string) => void;
  bottomSheetY: SharedValue<number>;
}

const ExploreHeader = ({ onCategoryChanged, bottomSheetY }: Props) => {
  const { colors: Colors, theme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      height: 170,
      overflow: "visible",
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
      alignItems: "center",
      width: 250,
      height: 40,
      backgroundColor: Colors.themeColorTextPure,
      borderColor: Colors.primary,
      borderWidth: 2,
      borderRadius: 20,
      elevation: 10,
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    notification: {
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.themeColorTextPure,
      elevation: 10,
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -2,
      backgroundColor: "red",
      borderRadius: 10,
      paddingHorizontal: 5,
      minWidth: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
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
      borderBottomColor: Colors.primary,
      borderBottomWidth: 2,
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
  });
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { t } = useTranslation();
  const sportDetail: any = t("sportTextIcons", { returnObjects: true });
  const windowHeight = Dimensions.get("window").height;

  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications
  );
  const notifications = useNotificationStore((state) => state.notifications);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // If you want to track count:
  useEffect(() => {
    setNotificationCount(notifications.length);
  }, [notifications]);

  // Animate icons wrapper up as sheet moves
  const animatedIconStyle = useAnimatedStyle(() => {
    const translateYValue = interpolate(
      bottomSheetY.value,
      [0, windowHeight * 0.5],
      [-80, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: translateYValue }],
    };
  });

  // Background fades in with sheet movement
  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bottomSheetY.value,
      [windowHeight * 0.00001, 0],
      ["transparent", Colors.backgroundColor]
    );
    return { backgroundColor: backgroundColor };
  });

  // Notification badge animation
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
        }
      );
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategoryChanged(sportDetail[index].id);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const { width } = Dimensions.get("screen");
  return (
    <SafeAreaView style={{ backgroundColor: Colors.backgroundColor, flex: 1 }}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#61b3fa" /> */}
      <View style={styles.container}>
        {/* Action Row */}
        <View style={styles.actionRowWrapper}>
          <TouchableOpacity style={styles.search}>
            <Image
              source={require("../assets/images/ranking.png")}
              style={{ width: 30, height: 30, right: 100 }}
            />
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            style={styles.notification}
            onPress={() => router.push("/listing/notification")}
          >
            <Image
              source={require("../assets/sport-icons/notification.png")}
              style={{ width: 30, height: 30 }}
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
            animatedIconStyle,
            animatedContainerStyle,
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
                    { width: itemWidth, height: "auto" },
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
                  <Text
                    style={[
                      styles.titleText,
                      { lineHeight: 18, textAlign: "center" },
                    ]}
                    numberOfLines={2} // limit to max 2 lines
                    ellipsizeMode="tail" // optional: truncate if too long
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default ExploreHeader;
