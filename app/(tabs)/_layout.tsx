import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router, Tabs } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import ExploreHeader from "@/components/ExploreHeader";
import InfoScreen from "@/components/InfoScreen";
import Dtraining from "@/components/training";
import CustomDrawerContent from "@/components/CostumDrawerContent";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import ProfileNotification from "@/components/profileScreens/drawerScreen/notification";
import ProfileStatistical from "@/components/profileScreens/contractorScreen/statistical";
import UserInfoScreen from "@/components/profileScreens/drawerScreen/userInfoScreen";
import { useTranslation } from "react-i18next";
import ProfileSettings from "../settings/profileSettings";
import { useAuth } from "../(modals)/context/authContext";
import FriendReqModal from "../(modals)/friendReqModal";
import RegisterZaal from "@/components/profileScreens/contractorScreen/register_zaal";
import MailComponent from "@/components/profileScreens/drawerScreen/mail";
import { useSharedValue } from "react-native-reanimated";
import BookingCheck from "@/components/profileScreens/contractorScreen/booking_check";
import { useCalendar } from "@/app/(modals)/context/CalendarContext";
import { Animated, Easing } from "react-native";
import { useTheme } from "../(modals)/context/themeContext";
import { ApiError, useAuthQuery } from "@/hooks/useQuery";
import ServerErrorScreen from "@/app/servererror";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { queryClient } from "@/hooks/queryClient";

export const TabsLayout = () => {
  const { colors: Colors, theme } = useTheme();
  const { t } = useTranslation();
  const { LoginStatus } = useAuth();
  const bottomSheetY = useSharedValue(0);

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.themeColorTextSecondary,
        tabBarActiveTintColor: Colors.themeColorTextPure,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.containerColor,
          borderTopWidth: theme === "dark" ? 0 : 1,
          borderTopColor: Colors.containerColor,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarBackground: () => (
          <LinearGradient
            colors={[Colors.backgroundColor, Colors.primary]}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),

        headerStyle: {
          backgroundColor: Colors.backgroundColor,
        },
        headerTintColor: Colors.themeColorTextPure,
        headerTitleStyle: { color: Colors.primary },
      }}
    >
      {/* ------------ HOME TAB ----------- */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("home"),
          headerShadowVisible: false,
          header: () => (
            <ExploreHeader
              onCategoryChanged={(category) => console.log(category)}
              bottomSheetY={bottomSheetY}
            />
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/home.png")}
                style={{ width: 26, height: 26 }}
              />
            </View>
          ),
        }}
      />

      {/* ------------ INBOX TAB ----------- */}
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarLabel: t("together"),
          headerTitle: t("together"),
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          headerRight: () => (
            <Image
              source={require("../../assets/tab-icons/teamwork.png")}
              style={{ width: 26, height: 26, marginRight: 10 }}
            />
          ),

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/teamwork.png")}
                style={{ width: 26, height: 26 }}
              />
            </View>
          ),
        }}
      />

      {/* ------------ ORDER TAB ----------- */}
      <Tabs.Screen
        name="order"
        options={{
          tabBarLabel: t("myBookings"),
          headerTitle: t("myBookings"),
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerTitleStyle: { color: Colors.primary, fontSize: 28 },
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons
                name="filter-circle-outline"
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>
          ),

          tabBarIcon: () => (
            <FontAwesome
              name="address-book-o"
              size={24}
              color={Colors.primary}
            />
          ),
        }}
      />

      {/* ------------ FRIEND TAB ----------- */}
      <Tabs.Screen
        name="friend"
        options={{
          tabBarLabel: t("friends"),
          headerTitle: t("friends"),
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },

          headerRight: () => {
            const [modalVisible, setModalVisible] = useState(false);
            return (
              <TouchableOpacity
                style={{ marginRight: 10 }}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <MaterialIcons
                  name="person-add"
                  size={30}
                  color={Colors.primary}
                />
                <FriendReqModal
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                />
              </TouchableOpacity>
            );
          },

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/friends.png")}
                style={{ width: 28, height: 28 }}
              />
            </View>
          ),
        }}
      />

      {/* ------------ CHAT TAB ----------- */}
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: t("chat"),
          headerTitle: t("chat"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          headerTitleAlign: "left",

          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 15, marginRight: 10 }}>
              <MaterialCommunityIcons
                name="text-search"
                size={28}
                color={Colors.primary}
              />
              <TouchableOpacity
                onPress={() => router.push("/(modals)/cameraModal")}
              >
                <Entypo name="new-message" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/chat.png")}
                style={{ width: 30, height: 30 }}
              />
            </View>
          ),
        }}
      />

      {/* ------------ PROFILE TAB ----------- */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: t("profile"),
          headerShown: !LoginStatus,
          headerTitle: !LoginStatus ? t("aboutUs.login") : t("profile"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },

          unmountOnBlur: true,

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/athlete.png")}
                style={{ width: 28, height: 28 }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const Layout = () => {
  const { colors: Colors } = useTheme();

  const [userRole, setUserRole] = useState<string>("default");
  const Drawer = createDrawerNavigator();
  const { t } = useTranslation();
  const drawerDef: any = t("DrawerScreen", { returnObjects: true });
  const drawer = Array.isArray(drawerDef) ? drawerDef[0] : [];
  const userDrawerLng = drawer?.userDrawer[0];
  const adminDrawerLng = drawer?.adminDrawer[0];
  const contractorDrawerLng = drawer?.contractorDrawer[0];
  const { LoginStatus, logIn, logOut } = useAuth();
  const { triggerCalendar } = useCalendar();

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    bounceLoop.start();

    // Optional cleanup to stop animation on unmount
    return () => bounceLoop.stop();
  }, [scaleAnim]);

  const drawerScreens: any = {
    default: [
      { name: userDrawerLng.home, component: TabsLayout, icon: "home" },
      {
        name: userDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
    ],
    user: [
      { name: userDrawerLng.home, component: TabsLayout, icon: "home" },
      { name: userDrawerLng.news, component: InfoScreen, icon: "newspaper" },
      { name: userDrawerLng.academy, component: Dtraining, icon: "newspaper" },
      {
        name: userDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
    ],
    admin: [
      { name: adminDrawerLng.adminPage, component: TabsLayout, icon: "home" },
      {
        name: adminDrawerLng.userInfo,
        component: UserInfoScreen,
        icon: "person",
      },
      {
        name: adminDrawerLng.notificationPage,
        component: ProfileNotification,
        icon: "notifications",
      },
      {
        name: "mail",
        component: MailComponent,
        icon: "mail",
      },

      {
        name: adminDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
    ],
    contractor: [
      {
        name: contractorDrawerLng.contractorPage,
        component: TabsLayout,
        icon: "home",
      },
      {
        name: contractorDrawerLng.statisticalPage,
        component: ProfileStatistical,
        icon: "checkmark-circle",
      },
      {
        name: contractorDrawerLng.userInfo,
        component: UserInfoScreen,
        icon: "person",
      },
      {
        name: contractorDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
      {
        name: contractorDrawerLng.registerSportHall,
        component: RegisterZaal,
        icon: "add",
      },
      {
        name: contractorDrawerLng.bookCheck,
        component: BookingCheck,
        icon: "calendar",
      },
    ],
  };

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    isFetching,
    isError,
  } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      staleTime: 1000,
      enabled: LoginStatus,
      retry: 3,
    },
  );

  useEffect(() => {
    if (userData) {
      setUserRole(userData.role);
      logIn();
    } else if (userError) {
      //logOut();
      console.log("Error fetching user data:", userError);
    }
  }, [userData, userError]);

  const showLoading = (userLoading || isFetching) && !isError;
  // if (!showLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <OwnActivaterIndicator />
  //     </View>
  //   );
  // }
  const noHeadRender = ["Home", "Нүүр хуудас", "홈"];

  const renderScreens = () => {
    const screensToRender = LoginStatus
      ? drawerScreens[userRole] || drawerScreens.default
      : drawerScreens.default;
    return screensToRender?.map(
      ({
        name,
        component,
        icon,
      }: {
        name: string;
        component: React.FC;
        icon: string;
      }) => (
        <Drawer.Screen
          key={name}
          name={name}
          component={component}
          options={{
            drawerActiveTintColor: Colors.primary,
            drawerInactiveTintColor: Colors.themeColorTextPure,
            drawerLabel: name,

            headerShown: noHeadRender.includes(name) ? false : true,
            drawerIcon: () => (
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={Colors.primary}
              />
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={Colors.primary}
                  style={{
                    marginLeft: 15,
                  }}
                />
              </TouchableOpacity>
            ),
            headerRight:
              name === contractorDrawerLng.userInfo
                ? () => (
                    <TouchableOpacity
                      onPress={() => console.log("Edit Profile")}
                    >
                      <Ionicons
                        name="create-outline"
                        size={24}
                        color={Colors.primary}
                        style={{ marginRight: 15 }}
                      />
                    </TouchableOpacity>
                  )
                : name === "Booking check"
                  ? () => (
                      <TouchableOpacity onPress={() => triggerCalendar()}>
                        <Animated.View
                          style={{ transform: [{ scale: scaleAnim }] }}
                        >
                          <Image
                            source={require("../../assets/sport-icons/calendar.png")}
                            style={{ width: 24, height: 24, marginRight: 15 }}
                            accessibilityLabel="Calendar Icon"
                            accessibilityHint="Opens the calendar"
                          />
                        </Animated.View>
                      </TouchableOpacity>
                    )
                  : undefined,
            headerTitle: name,
            headerTitleStyle: {
              color: Colors.primary,
              fontSize: 24,
            },
            headerStyle: {
              backgroundColor: Colors.backgroundColor,
            },
            headerShadowVisible: false,
          }}
        />
      ),
    );
  };
  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent {...props} LoginStatus={LoginStatus} />
        )}
        screenOptions={{
          drawerLabelStyle: { marginLeft: -10 },
          drawerType: "slide",
          headerShown: false,
        }}
      >
        {renderScreens()}
      </Drawer.Navigator>
    </>
  );
};

export default Layout;
