import React from "react";
import { useTheme } from "@/src/context/themeContext";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/src/context/authContext";

import InfoScreen from "@/components/InfoScreen";
import Dtraining from "@/components/training";
import CustomDrawerContent from "@/components/CostumDrawerContent";
import ProfileNotification from "@/components/profileScreens/drawerScreen/notification";
import ProfileStatistical from "@/components/profileScreens/contractorScreen/statistical";
import UserInfoScreen from "@/components/profileScreens/drawerScreen/userInfoScreen";
import RegisterZaal from "@/components/profileScreens/contractorScreen/register_zaal";
import MailComponent from "@/components/profileScreens/drawerScreen/mail";
import BookingCheck from "@/components/profileScreens/contractorScreen/booking_check";
import { useCalendar } from "@/src/context/CalendarContext";
import { Animated, Easing, Image, TouchableOpacity } from "react-native";
import { useAuthQuery } from "@/hooks/useQuery";
import ProfileSettings from "@/app/settings/profileSettings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DrawerLayout() {
  const { colors: Colors } = useTheme();
  console.log("DRAWER PAGE RENDERING");

  const [userRole, setUserRole] = React.useState<string>("default");
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

  React.useEffect(() => {
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
      {
        name: userDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
    ],
    user: [
      { name: userDrawerLng.news, component: InfoScreen, icon: "newspaper" },
      { name: userDrawerLng.academy, component: Dtraining, icon: "newspaper" },
      {
        name: userDrawerLng.settings,
        component: ProfileSettings,
        icon: "settings",
      },
    ],
    admin: [
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

  React.useEffect(() => {
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

  console.log("DRAWER PAGE RENDERING");
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
                            source={require("@/assets/sport-icons/calendar.png")}
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
        drawerContent={(props: any) => (
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
}
