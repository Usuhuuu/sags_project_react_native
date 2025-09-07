import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Linking,
  LayoutAnimation,
  UIManager,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import CalendarStrip from "react-native-calendar-strip";
import {
  GestureDetector,
  Gesture,
  FlatList,
} from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { SportHallDataType } from "@/interfaces/listing";
import SportHall from "@/assets/Data/sportHall.json";
import CallWaveButton from "../listing/book/CallWaveButton";
import axiosInstance, { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { format } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { mutate } from "swr";
import { useAuth } from "../(modals)/context/authContext";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const SWIPE_WIDTH = width - 170;
const BUTTON_WIDTH = 40;

export type PartnerBlock = {
  end_time: any;
  start_time: any;
  totalPrice: string;
  current_player: string;
  num_players: string;
  time_slots: string[];
  _id: string;
};
type PartnerDataType = {
  zaal_ID: string;
  day: string[];
  blocks: PartnerBlock[];
  hallData: SportHallDataType;
};

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "column",
  },

  rail: {
    width: SWIPE_WIDTH,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  swipet: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  swipeButton: {
    width: BUTTON_WIDTH,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
  },
  box: {
    width: 60,
    height: 60,
    backgroundColor: "#ccc",
    margin: 5,
    borderRadius: 8,
  },
  calendars: {
    height: "20%",
    width: "100%",
    marginBottom: 40,
  },
  swipeText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: "40%",
    height: 100,
    borderRadius: 10,
    marginBottom: 12,
  },
  toggleText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
  },

  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#212121",
    textAlign: "center",
  },
  subTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  text: {
    fontSize: 14,
    color: "#555",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  featureBadge: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  featureText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "500",
  },
  animatedSort: {
    marginTop: 8,
    marginBottom: 8,
  },
  containermodal: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  joinButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  wave: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(33, 150, 243, 0.3)", // blueish wave
  },
  sortButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sortText: {
    fontSize: 16,
    color: Colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#444",
  },
  down: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.light,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

const Page = () => {
  const [sportHalls, setSportHalls] = useState<SportHallDataType[] | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [today, setToday] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [showList, setShowList] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [partnerLookingData, setPartnerLookingData] = useState<{
    findPartner: PartnerDataType[];
  }>();
  const [sortedMergedData, setSortedMergedData] = useState<PartnerDataType[]>(
    []
  );
  const [mergedData, setMergedData] = useState<PartnerDataType[] | null>(null);
  const visibleSportHallsMap = SportHall.reduce<
    Record<string, SportHallDataType>
  >((acc, hall) => {
    acc[hall.sportHallID] = {
      ...hall,
      price: {
        oneHour: String(hall.price.oneHour),
        wholeDay: String(hall.price.wholeDay),
      },
    };
    return acc;
  }, {});
  const { LoginStatus } = useAuth();

  const fetchPartnerSearching = async () => {
    try {
      const [year, month, day] = today.split("T")[0].split("-");
      const response = await axiosInstanceRegular.get(
        `/timeslots/partner/${year}/${month}/${day}?page=${page}`,
        { timeout: 500 }
      );
      console.log(response.data);
      setPartnerLookingData((prev) => ({
        ...prev,
        findPartner: [
          ...(prev?.findPartner || []),
          ...(response.data.findPartner || []),
        ],
      }));
      if (response.data.message === "last") {
        console.log("Reached last page, not incrementing page anymore.");
        return;
      }

      setShowList(true);
    } catch (err: any) {
      console.log(err);
    } finally {
      setShowList(true);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchPartnerSearching();
    }, [page])
  );
  useEffect(() => {
    if (partnerLookingData?.findPartner?.length) {
      const seen = new Set();

      const merged = partnerLookingData.findPartner.flatMap((partner) => {
        const hall = visibleSportHallsMap[partner.zaal_ID];

        return partner.blocks
          .filter((block) => {
            const key = `${partner.zaal_ID}_${block.start_time}_${block.end_time}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((block) => ({
            zaal_ID: partner.zaal_ID,
            day: partner.day,
            blocks: [block],
            hallData: hall || null,
          }));
      });

      setMergedData(merged);
    }
  }, [partnerLookingData]);

  const handleJoin = async (roomId: string) => {
    try {
      router.push("/chat");
      const response = await axiosInstance.post(
        `/auth/sporthall/join/${roomId}`
      );
      console.log(response.data);
      if (response.status === 200 && response.data.success) {
        Alert.alert(
          "Successfully joined group chat",
          "You can process payment"
        );
        mutate(["group_chat", LoginStatus], undefined, { revalidate: true });
        router.push("/chat");
      } else if (response.status === 409 && !response.data.success) {
        Alert.alert(PartnerLanguage.alreadyJoined);
      }
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 409) {
        Alert.alert(PartnerLanguage.alreadyJoined);
      }
    }
  };
  const { t } = useTranslation();
  const PartnerLanguage: any = t("togetherScreen", {
    returnObjects: true,
  });

  const sortOptions = [
    {
      label: PartnerLanguage.rating,
      children: ["Highest First", "Lowest First"],
    },
    {
      label: PartnerLanguage.price,
      children: ["Lowest First", "Highest First"],
    },
  ];

  const sortSlotGiver = (date: Date) => {};
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    setSportHalls(
      SportHall.map((hall: any) => ({
        ...hall,
        price:
          typeof hall.price === "object"
            ? `One Hour: ${hall.price.oneHour}, Whole Day: ${hall.price.wholeDay}`
            : hall.price,
      }))
    );
  }, []);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 1000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const handleCompleteSwipe = () => {
    setIsLoading(true);
    setPage(1); // Reset pagination
    setSportHalls(null); // Clear list temporarily
    setExpandedIndex(null); // Collapse all cards
    setSelectedSort(null); // Clear sorting
    setSelectedParent(null); // Clear sorting category
    setModalVisible(false); // Close modal if open

    const todayStr = new Date().toISOString().split("T")[0];
    setToday(todayStr); // Reset calendar to today
    setPartnerLookingData({ findPartner: [] }); // Clear partner list

    // Repopulate halls from original SportHall list
    setSportHalls(
      SportHall.map((hall: any) => ({
        ...hall,
        price:
          typeof hall.price === "object"
            ? `One Hour: ${hall.price.oneHour}, Whole Day: ${hall.price.wholeDay}`
            : hall.price,
      }))
    ); // Restore full list from SportHall data

    // Optionally delay to simulate load time
    setTimeout(() => {
      setIsLoading(false);
      setShowList(true); // ensure list shows up
    }, 500);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isSwiping.value = true;
    })
    .onUpdate((e) => {
      if (e.translationX >= 0 && e.translationX <= SWIPE_WIDTH - BUTTON_WIDTH) {
        translateX.value = e.translationX;
      }
    })
    .onEnd(() => {
      isSwiping.value = false;
      if (translateX.value > SWIPE_WIDTH - BUTTON_WIDTH - 20) {
        runOnJS(handleCompleteSwipe)();
      }
      translateX.value = withSpring(0);
    });

  const bounceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isSwiping.value ? 1 : 1.2, {
            damping: 5,
            stiffness: 100,
          }),
        },
        {
          translateY: withSpring(isSwiping.value ? 0 : -5, {
            damping: 5,
            stiffness: 100,
          }),
        },
      ],
      color: isSwiping.value ? Colors.primary : Colors.darkGrey,
    };
  });

  const railAnimatedStyle = useAnimatedStyle(() => {
    const progress = translateX.value / (SWIPE_WIDTH - BUTTON_WIDTH);
    const startColor = [224, 224, 224];
    const endColor = [33, 150, 243];

    const r = startColor[0] + (endColor[0] - startColor[0]) * progress;
    const g = startColor[1] + (endColor[1] - startColor[1]) * progress;
    const b = startColor[2] + (endColor[2] - startColor[2]) * progress;

    return {
      borderColor: `rgb(${r}, ${g}, ${b})`,
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor:
      translateX.value > SWIPE_WIDTH - BUTTON_WIDTH - 20
        ? Colors.primary
        : Colors.secondary,
    borderRadius: 20,
    width: BUTTON_WIDTH,
    height: 40,
    justifyContent: "center",
  }));
  const sortMergedByPrice = (order: "lowest" | "highest") => {
    const sorted = [...(mergedData || [])].sort((a, b) => {
      const priceA = parseInt(a?.blocks?.[0]?.totalPrice || "", 10);
      const priceB = parseInt(b?.blocks?.[0]?.totalPrice || "", 10);

      console.log(
        `Comparing A: zaal_ID=${a?.zaal_ID}, price=${priceA} with B: zaal_ID=${b?.zaal_ID}, price=${priceB}`
      );

      const isANaN = isNaN(priceA);
      const isBNaN = isNaN(priceB);

      if (isANaN && isBNaN) return 0;
      if (isANaN) return 1; // A is invalid, B is valid → A goes last
      if (isBNaN) return -1; // B is invalid, A is valid → B goes last

      return order === "lowest" ? priceA - priceB : priceB - priceA;
    });
    console.log(
      "Sorted result:",
      sorted.map((item) => ({
        zaal_ID: item.zaal_ID,
        price: item?.blocks?.[0]?.totalPrice,
      }))
    );

    setSortedMergedData(sorted);
    setSelectedSort(
      `Price:${order === "lowest" ? "Lowest First" : "Highest First"}`
    );
    setSelectedParent("Price");
    setModalVisible(false);
  };
  function openGoogleMaps(arg0: number, arg1: number, address: string): void {
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });

    const latLng = `${arg0},${arg1}`;
    const query = address ? `${address}@${latLng}` : latLng;
    const url = `${scheme}${encodeURIComponent(query)}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  }
  const formatFeatureName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <>
      {showList ? (
        <FlatList
          data={sortedMergedData.length ? sortedMergedData : mergedData}
          extraData={mergedData}
          keyExtractor={(item, index) => {
            return `${item.zaal_ID}-${index}-${item.blocks[0].totalPrice}`;
          }}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <>
              <Animated.Text style={[styles.swipet, bounceStyle]}>
                {PartnerLanguage.swipeToPartner}
              </Animated.Text>
              <Text style={styles.text}>
                {PartnerLanguage.swipeDescription}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Animated.View style={[styles.rail, railAnimatedStyle]}>
                  <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.swipeButton, animatedStyle]}>
                      <Text style={styles.swipeText}>→</Text>
                    </Animated.View>
                  </GestureDetector>
                </Animated.View>

                <View style={styles.containermodal}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.sortButton}
                  >
                    <Text style={styles.sortText}>
                      {PartnerLanguage.sortBy}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => {
                  setModalVisible(false);
                  setSelectedParent(null);
                }}
              >
                <Pressable
                  style={styles.overlay}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedParent(null);
                  }}
                >
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      {PartnerLanguage.sortBy}
                    </Text>
                    <CalendarStrip
                      style={styles.calendars}
                      selectedDate={new Date(today)}
                      calendarAnimation={{ type: "parallel", duration: 30 }}
                      onDateSelected={(date) => sortSlotGiver(date)}
                      dateNumberStyle={{
                        fontSize: 18,
                        fontWeight: "400",
                        color: "#464646",
                      }}
                      dateNameStyle={{
                        fontSize: 10,
                        fontWeight: "400",
                        color: Colors.littleDark,
                      }}
                      calendarHeaderStyle={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: Colors.littleDark,
                      }}
                      calendarHeaderContainerStyle={{
                        width: "100%",
                        height: "30%",
                      }}
                    />

                    {!selectedParent ? (
                      sortOptions.map((option) => (
                        <TouchableOpacity
                          key={option.label}
                          style={styles.option}
                          onPress={() =>
                            option.children.length > 0
                              ? setSelectedParent(option.label)
                              : sortMergedByPrice("highest")
                          }
                        >
                          <Text style={styles.optionText}>{option.label}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => setSelectedParent(null)}
                        >
                          <Text
                            style={{ color: Colors.primary, marginBottom: 10 }}
                          >
                            ← {PartnerLanguage.back}
                          </Text>
                        </TouchableOpacity>
                        {sortOptions
                          .find((opt) => opt.label === selectedParent)
                          ?.children.map((child, index) => (
                            <Animated.View
                              key={child}
                              entering={FadeIn.duration(300).delay(index * 100)}
                            >
                              <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                  sortMergedByPrice("lowest");
                                }}
                              >
                                <Text style={styles.optionText}>{child}</Text>
                              </TouchableOpacity>
                            </Animated.View>
                          ))}
                      </>
                    )}
                  </View>
                </Pressable>
              </Modal>
            </>
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item, index }) => {
            const uniqueKey = `${item.zaal_ID}-${item.day[0]}-${index}`;
            const startTime = item.blocks[0].time_slots[0].split("~")[0];
            const length = item.blocks[0].time_slots.length;
            const endTime = item.blocks[0].time_slots[length - 1].split("~")[0];
            const wholeDay = item.blocks[0].time_slots?.some((time_slot) =>
              time_slot.includes("wholeDay") ? true : false
            );
            return (
              <>
                {!showList ? (
                  <>
                    <ActivityIndicator />
                  </>
                ) : (
                  <View key={uniqueKey} style={styles.card}>
                    <TouchableOpacity
                      onPress={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut
                        );
                        setExpandedIndex((prevIndex) =>
                          prevIndex === index ? null : index
                        );
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Image
                          source={{ uri: item.hallData?.imageUrls[0] }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1, justifyContent: "center" }}>
                          <Text style={styles.title}>
                            {item.hallData?.name}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 10,
                            }}
                          >
                            <Text
                              style={[styles.title, { textAlign: "center" }]}
                            >
                              {format(new Date(item.day[0]), "MMMM d, yyyy")}
                            </Text>
                            <Text
                              style={[styles.title, { textAlign: "center" }]}
                            >
                              {wholeDay ? (
                                <Text>{PartnerLanguage.wholeDay}</Text>
                              ) : (
                                <Text>
                                  {startTime}-{endTime}
                                </Text>
                              )}
                            </Text>
                          </View>
                          <Text style={[styles.title, { textAlign: "center" }]}>
                            {wholeDay ? <></> : `₮${item.blocks[0].totalPrice}`}
                          </Text>
                          <CallWaveButton
                            time_slot={item.blocks?.[0]?.time_slots}
                            playersNeeded={item.blocks?.[0]?.num_players}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, justifyContent: "center" }}>
                        {expandedIndex === index && (
                          <View style={styles.content}>
                            <View>
                              <Text style={styles.subTitle}>
                                {PartnerLanguage.feature}:
                              </Text>
                              <View style={styles.featuresContainer}>
                                {Object.entries(item.hallData?.feature)
                                  .filter(([_, value]) => value === true)
                                  .map(([key], index) => (
                                    <View
                                      key={index}
                                      style={styles.featureBadge}
                                    >
                                      <Text style={styles.featureText}>
                                        {formatFeatureName(key)}
                                      </Text>
                                    </View>
                                  ))}
                              </View>

                              <TouchableOpacity
                                onPress={() =>
                                  openGoogleMaps(
                                    parseFloat(
                                      item.hallData?.location.latitude ?? "0"
                                    ),
                                    parseFloat(
                                      item.hallData?.location?.longitude ?? "0"
                                    ),
                                    item.hallData?.address ?? ""
                                  )
                                }
                                style={{
                                  marginBottom: 10,
                                  marginTop: 10,
                                  padding: 10,
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  borderColor: Colors.primary,
                                  backgroundColor: Colors.light,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color: Colors.primary,
                                    fontSize: 16,
                                  }}
                                >
                                  📍 {PartnerLanguage.openInMap}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {/* --------- Add Partners Section --------- */}
                            <View style={{ marginTop: 15 }}>
                              <Text
                                style={[styles.subTitle, { marginBottom: 10 }]}
                              >
                                {PartnerLanguage.partnerLookingForThisHall}:
                              </Text>
                            </View>

                            <View style={styles.down}>
                              <Text>
                                {PartnerLanguage.doYouWantJoinThisHall}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  gap: 10,
                                  marginTop: 10,
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => handleJoin(item.blocks[0]._id)}
                                  style={styles.joinButton}
                                >
                                  <Text style={styles.buttonText}>
                                    {PartnerLanguage.join}
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => {
                                    LayoutAnimation.configureNext(
                                      LayoutAnimation.Presets.easeInEaseOut
                                    );
                                    setExpandedIndex(
                                      expandedIndex === index ? null : index
                                    );
                                  }}
                                  style={styles.cancelButton}
                                >
                                  <Text style={styles.buttonText}>
                                    {PartnerLanguage.cancel}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            );
          }}
          onEndReached={() => setPage(page + 1)}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={true}
        />
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignSelf: "center",
            flex: 1,
          }}
        >
          <ActivityIndicator
            size={"large"}
            color={Colors.primary}
            style={{ justifyContent: "center", alignSelf: "center" }}
          />
        </View>
      )}
    </>
  );
};

export default Page;
