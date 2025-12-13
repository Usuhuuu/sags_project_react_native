import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { PieChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";

const categories = [
  {
    name: "Basketball",
    source: require("../assets/sport-icons/basketball.png"),
    details: { timesPlayed: 5, goal: 10 },
  },
  {
    name: "Volleyball",
    source: require("../assets/sport-icons/volleyball.png"),
    details: { timesPlayed: 8, goal: 15 },
  },
  {
    name: "Football",
    source: require("../assets/sport-icons/football.png"),
    details: { timesPlayed: 12, goal: 20 },
  },
  {
    name: "Tennis",
    source: require("../assets/sport-icons/table-tennis.png"),
    details: { timesPlayed: 3, goal: 5 },
  },
  {
    name: "Bowling",
    source: require("../assets/sport-icons/lanes.png"),
    details: { timesPlayed: 6, goal: 10 },
  },
  {
    name: "Golf",
    source: require("../assets/sport-icons/golf.png"),
    details: { timesPlayed: 9, goal: 15 },
  },
];

const iconMap: { [key: string]: any } = {
  basketball: require("../assets/sport-icons/basketball.png"),
  football: require("../assets/sport-icons/football.png"),
  volleyball: require("../assets/sport-icons/volleyball.png"),
  tennis: require("../assets/sport-icons/table-tennis.png"),
  bowling: require("../assets/sport-icons/lanes.png"),
  golf: require("../assets/sport-icons/golf.png"),
};

const ProfileData = () => {
  const { colors: Colors, theme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      borderRadius: 20,
      padding: 20,
      backgroundColor: Colors.backgroundColor,
      margin: 10,
      elevation: 4,
      shadowColor: Colors.shadowColor,
      shadowOpacity: 0.4,
      shadowOffset: { width: 2, height: 2 },
    },
    gradientBackground: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 20,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    activityTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors.themeColorTextPure,
    },
    categoriesBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 10,
      alignItems: "center",
    },
    categoriesBtnActive: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 10,
      backgroundColor: Colors.primary,
      borderRadius: 8,
      alignItems: "center",
    },
    iconContainer: {
      backgroundColor: theme === "dark" ? Colors.primary : Colors.white,
      padding: 8,
      borderRadius: 30,
      marginBottom: 5,
    },
    titleText: {
      fontSize: 12,
      fontWeight: "bold",
      color: Colors.themeColorTextPure,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    chart: {
      borderRadius: 50,
    },
    detailsContainer: {
      overflow: "hidden",
      marginTop: 10,
    },
    centerOverlay: {
      position: "absolute",
      top: "40%",
      left: "25%",
      right: "25%",
      bottom: "25%",
      justifyContent: "center",
      alignItems: "center",
    },
    centerText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    chartLegend: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendColorBox: {
      width: 10,
      height: 10,
      marginRight: 5,
    },
  });

  const menuScrollRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const menuItemsRef = useRef<(View | null)[]>([]);
  const categoryItemsRef = useRef<(View | null)[]>([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
    null
  );
  const [selectedDetails, setSelectedDetails] = useState<null | {
    timesPlayed: number;
    goal: number;
  }>(null);
  const [showDetails, setShowDetails] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const selectMenu = (index: number) => {
    const selected = menuItemsRef.current[index];
    setActiveMenuIndex(index);
    if (selected) {
      (selected as unknown as View).measure(
        (_fx, fy, width, height, px, py) => {
          menuScrollRef.current?.scrollTo({ x: px - 16, animated: true });
        }
      );
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCategoryPress = (index: number) => {
    const selected = categoryItemsRef.current[index];

    if (activeCategoryIndex === index) {
      // Do nothing if same item is pressed again
      return;
    }

    setActiveCategoryIndex(index);
    setSelectedDetails(categories[index].details);
    setShowDetails(true);

    if (selected) {
      (selected as unknown as View).measure(
        (_fx, _fy, _width, _height, px, _py) => {
          categoryScrollRef.current?.scrollTo({ x: px - 16, animated: true });
        }
      );
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate after short delay to ensure state is applied
    setTimeout(() => {
      Animated.timing(animatedHeight, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 50); // slight delay ensures state is updated
  };

  const doughnutData = [
    {
      population: selectedDetails ? selectedDetails.timesPlayed : 0,
      color: Colors.primary,
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "Played",
    },
    {
      population:
        selectedDetails && selectedDetails.goal - selectedDetails.timesPlayed,
      color: "#ffffff",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
      name: "Remaining",
    },
  ];
  const profileLanguageData: any = t("profilesdaData", { returnObjects: true });
  const sdaData = Array.isArray(profileLanguageData)
    ? profileLanguageData[0]
    : [];
  const data = sdaData.profileData[0];
  const sportDetail: any = t("sportTextIcons", { returnObjects: true });
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.backgroundColor]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1.1 }}
        style={styles.gradientBackground}
      />

      {/* MENU */}

      <View style={styles.header}>
        <Text style={styles.activityTitle}>{data.miniiAmjilt}</Text>
      </View>

      {/* CATEGORIES */}
      <ScrollView
        ref={categoryScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {sportDetail.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            ref={(el) => (categoryItemsRef.current[index] = el)}
            style={
              activeCategoryIndex === index
                ? styles.categoriesBtnActive
                : styles.categoriesBtn
            }
            onPress={() => {
              handleCategoryPress(index);
            }}
          >
            <View style={styles.iconContainer}>
              <Image source={iconMap[item.icon]} style={iconStyles} />
            </View>
            <Text style={styles.titleText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Animated.View
        style={[styles.detailsContainer, { height: animatedHeight }]}
      >
        {showDetails && selectedDetails && (
          <View>
            <View style={styles.chartContainer}>
              <PieChart
                data={doughnutData}
                width={150}
                height={150}
                chartConfig={{
                  color: (opacity = 1) => `rgba(35, 34, 34, ${opacity})`,
                  decimalPlaces: 0,
                }}
                backgroundColor="transparent"
                paddingLeft="25"
                style={styles.chart}
                accessor="population"
                hasLegend={false}
              />
              <View style={styles.centerOverlay}>
                <Text style={styles.centerText}>
                  {selectedDetails.timesPlayed} / {selectedDetails.goal}
                </Text>
              </View>
            </View>
            <View style={styles.chartLegend}>
              {doughnutData.map((data) => (
                <View key={data.name} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColorBox,
                      { backgroundColor: data.color },
                    ]}
                  />
                  <Text>{data.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const iconStyles = {
  width: 26,
  height: 26,
};

export default ProfileData;
