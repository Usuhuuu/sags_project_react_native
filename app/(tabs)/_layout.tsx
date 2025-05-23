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
import Colors from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import ExploreHeader from "@/components/ExploreHeader"; // Import your ExploreHeader component
import InfoScreen from "@/components/InfoScreen"; // Example drawer screen
import Dtraining from "@/components/training";
import CustomDrawerContent from "@/components/CostumDrawerContent";
import {
  AntDesign,
  Entypo,
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
import { auth_swr } from "../../hooks/useswr";
import FriendReqModal from "../(modals)/friendReqModal";
import RegisterZaal from "@/components/profileScreens/contractorScreen/register_zaal";
import MailComponent from "@/components/profileScreens/drawerScreen/mail";
import { useSharedValue } from "react-native-reanimated";
// Create a Drawer Navigator
export const TabsLayout = () => {
  const { t } = useTranslation();
  const { LoginStatus } = useAuth();
  const bottomSheetY = useSharedValue(0);

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.dark,
        tabBarActiveTintColor: Colors.light,
        tabBarStyle: {
          borderColor: Colors.primary,
        },

        tabBarBackground: () => (
          <LinearGradient
            colors={[Colors.secondary, Colors.primary]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("home"),
          header: () => (
            <ExploreHeader
              onCategoryChanged={(category) => console.log(category)
              }
               bottomSheetY={bottomSheetY}
            />
          ),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.light : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/home.png")}
                style={{
                  width: 26,
                  height: 26,
                }}
                accessibilityLabel="Home Tab"
                accessibilityHint="Navigates to the home screen"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarLabel: t("together"),
          headerTitle: t("together"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },

          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  //router.push("/(modals)/createGroup");
                }}
                style={{ marginRight: 10 }}
              >
                <AntDesign
                  name="pluscircleo"
                  size={30}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            );
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.light : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/teamwork.png")}
                style={{ width: 26, height: 26 }}
                accessibilityLabel="Inbox Tab"
                accessibilityHint="Navigates to the inbox screen"
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="friend"
        options={{
          tabBarLabel: `${t("Friends")}`,
          headerTitle: "Friends",
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
                backgroundColor: focused ? Colors.light : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/friends.png")}
                style={{ width: 28, height: 28 }}
                accessibilityLabel="Explore Tab"
                accessibilityHint="Navigates to the explore screen"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: `${t("chat")}`,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.light : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/chat.png")}
                style={{ width: 30, height: 30 }}
                accessibilityLabel="Chat Tab"
                accessibilityHint="Navigates to the chat screen"
              />
            </View>
          ),
          headerShown: true,
          headerTitle: t("chat"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          headerTitleAlign: "left",
          headerRight: () => {
            return (
              <View
                style={{ flexDirection: "row", marginHorizontal: 5, gap: 15 }}
              >
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    name="text-search"
                    size={28}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(modals)/cameraModal");
                  }}
                >
                  <Entypo
                    name="new-message"
                    size={24}
                    color={Colors.primary}
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: `${t("profile")}`, // Profile Tab
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.light : "transparent",
              }}
            >
              <Image
                source={require("../../assets/tab-icons/athlete.png")}
                style={{ width: 28, height: 28 }}
                accessibilityLabel="Profile Tab"
                accessibilityHint="Navigates to the profile screen"
              />
            </View>
          ),
          headerShown: !LoginStatus,
          headerTitle: !LoginStatus ? t("aboutUs.login") : t("profile"),
          headerStyle: {},
          headerTitleStyle: {
            color: Colors.primary,
            fontSize: 24,
          },

          unmountOnBlur: true,
        }}
      />
    </Tabs>
  );
};

const Layout = () => {
  const [userRole, setUserRole] = useState<string>("default");

  const Drawer = createDrawerNavigator();
  const { t } = useTranslation();
  const drawerDef: any = t("DrawerScreen", { returnObjects: true });
  const drawer = Array.isArray(drawerDef) ? drawerDef[0] : [];
  const userDrawerLng = drawer?.userDrawer[0];
  const adminDrawerLng = drawer?.adminDrawer[0];
  const contractorDrawerLng = drawer?.contractorDrawer[0];
  const { LoginStatus, logOut, logIn } = useAuth();

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
        name: "Register Sport Hall",
        component: RegisterZaal,
        icon: "add",
      },
    ],
  };

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = auth_swr({
    item: {
      pathname: "main",
      cacheKey: "RoleAndProfile_main",
      loginStatus: LoginStatus,
    },
  });

  useEffect(() => {
    if (userData) {
      setUserRole(userData.role);
      logIn();
    } else if (userError) {
      //logOut();
      console.log("Error fetching user data:", userError);
    }
  }, [userData, userError]);

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
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
                : undefined,
          }}
        />
      )
    );
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} LoginStatus={LoginStatus} />
      )}
      screenOptions={{
        drawerLabelStyle: {
          marginLeft: -10,
        },
        drawerType: "slide",
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#eefafb",
        },
      }}
    >
      {renderScreens()}
    </Drawer.Navigator>
  );
};

export default Layout;

