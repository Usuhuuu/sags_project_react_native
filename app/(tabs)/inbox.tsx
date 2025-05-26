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
  Button,
   LayoutAnimation,
  
  UIManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  withDelay,
} from "react-native-reanimated";
import CalendarStrip from "react-native-calendar-strip";

import { GestureDetector, Gesture, FlatList } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { SportHallDataType } from "@/interfaces/listing";
import SportHall from "@/assets/Data/sportHall.json";
import CallWaveButton from "@/components/CallWaveButton";


const { width } = Dimensions.get("window");
const SWIPE_WIDTH = width - 170;
const BUTTON_WIDTH = 40;

if (Platform.OS === 'android') {
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
    backgroundColor: '#ccc',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  

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
  down:{
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.light,
    alignItems: "center",
    justifyContent: "center",
    width:"100%"
  }
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
   const [visibleSportHalls, setVisibleSportHalls] = useState<SportHallDataType[]>([]);
   const [page, setPage] = useState(1);
  const pageSize = 5;

 
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  

   useEffect(() => {
    loadMoreItems();
  }, [sportHalls]);

   const loadMoreItems = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    if (!sportHalls) return;
    const nextItems = sportHalls.slice(startIndex, endIndex);

    // Only load if there are more items
    if (nextItems.length > 0) {
      setVisibleSportHalls((prev) => [...prev, ...nextItems]);
      setPage((prev) => prev + 1);
    }
  };


 
  const handleJoin = (sportHallID: string) => {
    console.log("Joining sport hall with ID:", sportHallID);
    // Add your join logic here
    setModalJoin(false); // Close the modal after joining
  };


  const sortOptions = [
    { label: "Distance", children: ["Nearest First", "Farthest First"] },
    { label: "Rating", children: ["Highest First", "Lowest First"] },
    { label: "Price", children: ["Lowest First", "Highest First"] },
  ];

  const sortSlotGiver = (date: Date) => {
    setIsLoading(true);

    try {
      const selectedDateStr = date.toISOString().split("T")[0];
      setToday(selectedDateStr);

      // Filter halls with available slots on the selected date AND looking for partner
      const filtered = SportHall.filter(
        (hall) =>
          hall.lookingForPartner === false && // only halls looking for partner
          hall.availableTimeSlots.some((slot) =>
            slot.start_time.startsWith(selectedDateStr)
          )
      );

      setSportHalls(
        filtered.map((hall) => ({
          ...hall,
          price:
            typeof hall.price === "object"
              ? `One Hour: ${hall.price.oneHour}, Whole Day: ${hall.price.wholeDay}`
              : hall.price,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    setSportHalls(
      SportHall.map((hall) => ({
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
    // Reset filters and reload data
    setIsLoading(true);

    setTimeout(() => {
      // Reset to full unfiltered list
      setSportHalls(
        SportHall.map((hall) => ({
          ...hall,
          price:
            typeof hall.price === "object"
              ? `One Hour: ${hall.price.oneHour}, Whole Day: ${hall.price.wholeDay}`
              : hall.price,
        }))
      );
      setToday(new Date().toISOString());
      setIsLoading(false);
    }, 500); // simulate network delay or update
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

  const sortSportHalls = (option: string) => {
    // option example: "Distance:Nearest First"
    const [parent, child] = option.split(":");
    const sorted = [...(sportHalls || [])]; // copy current list

    switch (parent) {
      case "Distance":
        sorted.sort((a, b) =>
          child === "Farthest First"
            ? (b.distance ?? 0) - (a.distance ?? 0)
            : (a.distance ?? 0) - (b.distance ?? 0)
        );
        break;

      case "Rating":
        sorted.sort((a, b) =>
          child === "Lowest First"
            ? (a.rating ?? 0) - (b.rating ?? 0)
            : (b.rating ?? 0) - (a.rating ?? 0)
        );
        break;

      case "Price":
        sorted.sort((a, b) =>
          child === "Highest First"
            ? (b.price ?? 0) - (a.price ?? 0)
            : (a.price ?? 0) - (b.price ?? 0)
        );
        break;

      default:
        break;
    }

    setSportHalls(sorted); // update the state to re-render list
    setSelectedSort(option); // optionally store the selected sort option
    setModalVisible(false); // close the sort modal
    setSelectedParent(null); // reset sort sub-menu if any
  };

  function openGoogleMaps(
    arg0: number,
    arg1: number,
    address: string
  ): void {
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
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
};
  return (
  <FlatList
    data={ visibleSportHalls}
    keyExtractor={(item) => item.sportHallID.toString()}
    contentContainerStyle={styles.container}
    
    // ✅ List header content (shown once at the top)
    ListHeaderComponent={
      <>
        <Animated.Text style={[styles.swipet, bounceStyle]}>
          Swipe to find partner
        </Animated.Text>
        <Text style={styles.text}>
          Swipe right to show unfiltered orders sport hall.
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
              <Text style={styles.sortText}>Sort by</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔽 Sort Modal (rendered only once, not inside renderItem) */}
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
              <Text style={styles.modalTitle}>Sort by</Text>
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
                        : sortSportHalls(option.label)
                    }
                  >
                    <Text style={styles.optionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <>
                  <TouchableOpacity onPress={() => setSelectedParent(null)}>
                    <Text style={{ color: Colors.primary, marginBottom: 10 }}>
                      ← Back
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
                          onPress={() =>
                            sortSportHalls(`${selectedParent}:${child}`)
                          }
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

    // ✅ Item render
    
    renderItem={({ item }) => (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpandedId(
              expandedId === item.sportHallID ? null : item.sportHallID
            );
          }}>

        <View style={{ flexDirection: "row", alignItems: "center", }}>
           <Image
          source={{ uri: item.imageUrls[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={{ flex: 1, justifyContent: "center"}}>
          <Text style={styles.title}>{item.name}</Text>

          <CallWaveButton
            partnersLookingFor={item.partnersLookingFor ?? 0}
            playersNeeded={item.playersNeeded ?? 0}
            
          />

         
          </View>
        </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
          {expandedId === item.sportHallID && (
            <View style={styles.content}>
            

               <View>
                 <Text style={styles.subTitle}>Features:</Text>
                    < View style={styles.featuresContainer}>
                         {Object.entries(item.feature)
                    .filter(([_, value]) => value === true)
                      .map(([key], index) => (
                     <View key={index} style={styles.featureBadge}>
                     <Text style={styles.featureText}>{formatFeatureName(key)}</Text>
                   </View>
                      ))}
                      </View>

              <TouchableOpacity
                onPress={() =>
                  openGoogleMaps(
                    parseFloat(item.location.latitude),
                parseFloat(item.location.longitude),
                item.address
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

                <Text style={{ color: Colors.primary, fontSize: 16 }}>
                  📍 Open in Maps
                </Text>
              </TouchableOpacity>
              </View>
              <View style={styles.down}>
                <Text> 
                  Do you want to join this sport hall?
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>

               <TouchableOpacity onPress={() => handleJoin(item.sportHallID)} style={styles.joinButton}>
                         <Text style={styles.buttonText}>Join</Text>
                              </TouchableOpacity>

                       <TouchableOpacity onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpandedId(
              expandedId === item.sportHallID ? null : item.sportHallID
            );
          }}style={styles.cancelButton}>
                             <Text style={styles.buttonText}>Cancel</Text>
                                 </TouchableOpacity>
                            </View>

                   </View>
             </View>
            
                 )}
        </View>
        </TouchableOpacity>
          </View>
       
       )}
       
    onEndReached={loadMoreItems}
    onEndReachedThreshold={0.5}
  />

  );
};

export default Page;