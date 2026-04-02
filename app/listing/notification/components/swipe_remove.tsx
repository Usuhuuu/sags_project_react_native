import React, { SetStateAction } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { differenceInMinutes, format } from "date-fns";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Checkbox } from "react-native-paper";
import { NotificationItem } from "../notification";
import { FontAwesome } from "@expo/vector-icons";

type SwipeableRowProps = {
  item: NotificationItem;
  itemSave: (id: string) => Promise<void>;
  onDelete: (id: string | number) => void;
  setSelectReady: React.Dispatch<React.SetStateAction<boolean>>;
  selectReady: boolean;
  selectedList: string[];
  setSelectedList: React.Dispatch<React.SetStateAction<string[]>>;
};

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  item,
  itemSave,
  onDelete,
  selectReady,
  selectedList,
  setSelectedList,
}) => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    notificationItem: {
      borderRadius: 8,
      padding: 16,
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
          onPress={() => {
            item.seen = true;
            itemSave(item.id);
            return (expanded.value = !expanded.value);
          }}
          style={{
            flex: 1,
            width: selectReady ? width * 0.85 : width,
          }}
        >
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 8,
              borderRadius: 8,
              backgroundColor: Colors.containerColor,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 3,
            }}
          >
            <View
              style={[
                styles.notificationItem,
                {
                  borderWidth: 1,
                  borderColor:
                    diffMinut < 5 ? Colors.primary : Colors.containerColor,
                  backgroundColor: item.seen
                    ? "#151a2060"
                    : Colors.containerColor,
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
                  <AppText
                    style={[
                      styles.notificationMessage,
                      {
                        opacity: item.seen ? 0.4 : 1,
                      },
                    ]}
                  >
                    {item.message?.title}
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
                    <AppText
                      style={[
                        styles.notificationMessage,
                        {
                          opacity: item.seen ? 0.4 : 1,
                        },
                      ]}
                    >
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
                          opacity: item.seen ? 0.4 : 1,
                        },
                      ]}
                    >
                      {item.message.body}
                    </AppText>
                  </Animated.View>
                  {diffMinut >= 5 && (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 5,
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <FontAwesome
                        name="check-circle"
                        size={16}
                        color={Colors.darkGrey}
                      />
                      <AppText
                        style={[
                          styles.notificationTime,
                          {
                            marginTop: 0,
                          },
                        ]}
                      >
                        {format(new Date(item.time), "PPp")}
                      </AppText>
                    </View>
                  )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default SwipeableRow;
