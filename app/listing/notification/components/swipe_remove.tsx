import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { differenceInMinutes, format } from "date-fns";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Checkbox } from "react-native-paper";

type SwipeableRowProps = {
  item: {
    id: string | number;
    message: {
      title: string;
      body: string;
    };
    time: string;
  };
  onDelete: (id: string | number) => void;
  setSelectReady: React.Dispatch<React.SetStateAction<boolean>>;
  selectReady: boolean;
  selectedList: string[];
  setSelectedList: React.Dispatch<React.SetStateAction<string[]>>;
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  item,
  onDelete,
  selectReady,
  selectedList,
  setSelectedList,
}) => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    notificationItem: {
      backgroundColor: Colors.containerColor,
      borderRadius: 8,
      marginHorizontal: 20,
      marginVertical: 8,
      padding: 16,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 3,
    },

    notificationContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    notificationText: {
      flex: 1,
      paddingRight: 10,
    },

    notificationMessage: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors.themeColorTextPure,
    },

    notificationTime: {
      fontSize: 12,
      marginTop: 4,
      color: Colors.darkGrey,
    },

    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },

    badge: {
      backgroundColor: "#1e3a5f",
      color: "#4da3ff",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      fontSize: 12,
      fontWeight: "700",
    },

    deleteAction: {
      backgroundColor: "#ff1515",
      padding: 15,
      marginVertical: 8,
      marginRight: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const diffMinut = differenceInMinutes(new Date(), new Date(item.time));

  /** Animation state */
  const expanded = useSharedValue(false);
  const bodyHeight = useSharedValue(0);

  const animatedBodyStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(expanded.value ? bodyHeight.value : 0, {
        duration: 250,
      }),
      opacity: withTiming(expanded.value ? 1 : 0, {
        duration: 200,
      }),
    };
  });
  const { width } = Dimensions.get("window");
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="close" size={24} color={Colors.themeColorTextPure} />
        </TouchableOpacity>
      )}
    >
      <View
        style={{
          width: "100%",
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: selectReady ? 10 : 0,
        }}
      >
        {selectReady && (
          <View
            style={{ backgroundColor: Colors.containerColor, borderRadius: 25 }}
          >
            <Checkbox
              status={
                selectedList?.includes(item.id.toString())
                  ? "checked"
                  : "unchecked"
              }
              onPress={() => {
                {
                  setSelectedList?.((prev) => {
                    if (prev.includes(item.id.toString())) {
                      return prev.filter((id) => id !== item.id.toString());
                    } else {
                      return [...prev, item.id.toString()];
                    }
                  });
                }
              }}
              color={Colors.primary}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={() => (expanded.value = !expanded.value)}
          style={{ flex: 1, width: selectReady ? width * 0.85 : width }}
        >
          <View
            style={[
              styles.notificationItem,
              {
                borderWidth: 1,
                borderColor:
                  diffMinut < 5 ? Colors.primary : Colors.containerColor,
              },
            ]}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationText}>
                {/* BADGE */}
                {diffMinut < 5 && (
                  <View style={styles.badgeRow}>
                    <AppText style={styles.badge}>NEW</AppText>
                    <AppText style={styles.notificationTime}>
                      {diffMinut < 60
                        ? `${diffMinut} minutes ago`
                        : format(new Date(item.time), "HH:mm")}
                    </AppText>
                  </View>
                )}

                {/* TITLE */}
                <AppText style={styles.notificationMessage}>
                  {item.message.title}
                </AppText>

                {/* INVISIBLE MEASUREMENT (NOT CLIPPED) */}
                <View
                  style={{ position: "absolute", opacity: 0, zIndex: -1 }}
                  onLayout={(e) => {
                    if (bodyHeight.value === 0) {
                      bodyHeight.value = e.nativeEvent.layout.height;
                    }
                  }}
                >
                  <AppText style={styles.notificationMessage}>
                    {item.message.body}
                  </AppText>

                  {diffMinut >= 5 && (
                    <AppText style={styles.notificationTime}>
                      {format(new Date(item.time), "PPp")}
                    </AppText>
                  )}
                </View>

                {/* ANIMATED BODY (CLIPPED) */}
                <Animated.View
                  style={[
                    { overflow: "hidden", paddingTop: 8 },
                    animatedBodyStyle,
                  ]}
                >
                  <AppText
                    style={[
                      styles.notificationMessage,
                      {
                        color: Colors.darkGrey,
                      },
                    ]}
                  >
                    {item.message.body}
                  </AppText>
                </Animated.View>
                {diffMinut >= 5 && (
                  <AppText style={styles.notificationTime}>
                    {format(new Date(item.time), "PPp")}
                  </AppText>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default SwipeableRow;
