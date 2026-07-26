import { useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  interpolateColor,
} from "react-native-reanimated";
import { router } from "expo-router";
import type { SharedValue } from "react-native-reanimated";
import { useNotificationStore } from "@/context/store/notification_store";
import { useTheme } from "@/context/theme_context";
import { HallCategoryValue } from "@/types/hall_info_type";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  DrawerActions,
  useNavigation,
} from "expo-router/build/react-navigation";

// Render the right icon component based on the map entry
const SportIcon = ({
  iconKey,
  size,
  color,
}: {
  iconKey: string;
  size: number;
  color: string;
}) => {
  const icon = iconMap[iconKey];
  if (!icon) return null;

  const props = { size, color };

  switch (icon.family) {
    case "Ionicons":
      return <Ionicons name={icon.name as any} {...props} />;
    case "FontAwesome6":
      return <FontAwesome6 name={icon.name as any} {...props} />;
    case "Feather":
      return <Feather name={icon.name as any} {...props} />;
    case "MaterialIcons":
      return <MaterialIcons name={icon.name as any} {...props} />;
    default:
      return <MaterialCommunityIcons name={icon.name as any} {...props} />;
  }
};
const iconMap: { [key: string]: { family: string; name: string } } = {
  basketball: { family: "MaterialCommunityIcons", name: "basketball" },
  football: { family: "Ionicons", name: "football" },
  volleyball: { family: "MaterialCommunityIcons", name: "volleyball" },
  tennis: { family: "MaterialCommunityIcons", name: "table-tennis" },
  bowling: { family: "MaterialCommunityIcons", name: "bowling" },
  golf: { family: "MaterialCommunityIcons", name: "golf-tee" },
  desktopComputer: {
    family: "MaterialIcons",
    name: "desktop-mac",
  },
  gameController: { family: "MaterialCommunityIcons", name: "gamepad-variant" },
};
interface Props {
  onCategoryChanged: (category: HallCategoryValue) => void;
  bottomSheetY: SharedValue<number>;
}

const ExploreHeader = ({ onCategoryChanged, bottomSheetY }: Props) => {
  const { colors: Colors } = useTheme();
  const screenDims = useMemo(() => Dimensions.get("screen"), []);
  const { width, height } = screenDims;

  const expandedY = height * 0.1;
  const fadeStart = height * 0.28;

  const styles = useMemo(() => createStyles(Colors, height), [Colors]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { t } = useTranslation();
  const sportDetail: any = useMemo(
    () => t("sportTextIcons", { returnObjects: true }),
    [t],
  );

  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  );
  const notifications = useNotificationStore((state) => state.notifications);
  const navigation = useNavigation();

  useEffect(() => {
    loadNotifications();
  }, []);

  // Track unread count
  useEffect(() => {
    const tempCount = notifications.filter((n) => n.seen !== true);
    setNotificationCount(tempCount.length);
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

  const itemsRef = useRef<(View | null)[]>([]);
  const pendingIndex = useRef(0);
  const scrollEndFired = useRef(false);

  const selectCategory = (index: number) => {
    const selected = itemsRef.current[index];
    pendingIndex.current = index;
    setActiveIndex(index);
    scrollEndFired.current = false;

    // Scroll first
    selected?.measure((_fx, _fy, _w, _h, px) => {
      scrollRef.current?.scrollTo({ x: px - 16, animated: true });
    });

    // Do NOT call onCategoryChanged here — wait for scroll to finish
  };

  const onScrollEnd = () => {
    // Only fire when scroll animation completes
    if (!scrollEndFired.current) {
      scrollEndFired.current = true;
      onCategoryChanged(sportDetail[pendingIndex.current]?.id);
    }
  };

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.backgroundColor, flex: 1 }}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Action Row */}
        <View style={[styles.actionRowWrapper]}>
          {/* Search Bar */}
          <TouchableOpacity style={styles.search} activeOpacity={0.8}>
            <Feather name="search" size={18} color={Colors.outline} />
            <TextInput
              placeholder="Search sports or facilities"
              placeholderTextColor={Colors.outline}
              style={styles.searchInput}
            />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            {/* Notification */}
            <TouchableOpacity
              style={[
                styles.iconButtonCircle,
                notificationCount > 0 && styles.iconButtonCircleActive,
              ]}
              onPress={() => router.push("/notification/notification")}
            >
              <View style={styles.notificationIconWrapper}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={
                    notificationCount > 0 ? Colors.primary : Colors.onSurface
                  }
                />
              </View>
              {notificationCount > 0 && (
                <View style={[styles.badge]}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Menu */}
            <TouchableOpacity
              style={styles.iconButtonCircle}
              onPress={openMenu}
            >
              <Ionicons
                name="menu-outline"
                size={22}
                color={Colors.onSurface}
              />
            </TouchableOpacity>
          </View>
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
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={16}
          >
            {(() => {
              const itemWidth = width / Object.keys(iconMap).length;
              return sportDetail?.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id ?? index}
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  style={[
                    {
                      width: itemWidth,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: Colors.containerColor,
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
                  <SportIcon
                    iconKey={item.icon}
                    size={25}
                    color={
                      activeIndex === index ? Colors.primary : Colors.outline
                    }
                  />
                  {activeIndex === index && (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: Colors.primary,
                        position: "absolute",
                        bottom: 6,
                      }}
                    />
                  )}
                </TouchableOpacity>
              ));
            })()}
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
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 10,
    },
    search: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      height: 42,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 21,
      paddingHorizontal: 16,
      elevation: 2,
      shadowColor: Colors.shadowColor,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.onSurface,
      paddingVertical: 0,
    },
    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButtonCircle: {
      justifyContent: "center",
      alignItems: "center",
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      elevation: 2,
      shadowColor: Colors.shadowColor,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    iconButtonCircleActive: {
      backgroundColor: Colors.accentPrimaryGlow,
      borderColor: Colors.accentPrimaryBorder,
    },
    notificationIconWrapper: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
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
