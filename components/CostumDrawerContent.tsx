import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { Ionicons, Fontisto, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/app/(modals)/context/authContext";
import { requestTrackingPermission } from "react-native-tracking-transparency";
import { notificationPermission } from "@/hooks/permissions";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { useAuthQuery } from "@/hooks/useQuery";
import ProfileAvatar from "./profile_avatar";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  unique_user_ID: string;
  userImage: string | null;
}
const CustomDrawerContent = (props: any) => {
  const { colors: Colors, theme } = useTheme();

  const [userData, setUserData] = useState<UserData | null>(null);
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const { LoginStatus, logIn } = useAuth();

  const router = useRouter();
  const { data, error } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  useEffect(() => {
    notificationPermission();
  }, []);

  useEffect(() => {
    const requestTracking = async () => {
      await requestTrackingPermission();
    };
    requestTracking();
  });

  useEffect(() => {
    if (data) {
      const parsedData =
        typeof data.profileData == "string"
          ? JSON.parse(data.profileData)
          : data.profileData;
      const result = Array.isArray(parsedData) ? parsedData[0] : parsedData;
      setUserData(result);
      logIn();
    } else if (error) {
      //logOut();
      console.log("Error fetching user data: Pisda", error);
    }
  }, [data, error]);
  const { width, height } = Dimensions.get("screen");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
        maxWidth: "100%",
      }}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.container}
      >
        {!LoginStatus ? (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: Colors.primary,
              alignItems: "center",
              flexDirection: "row",
              backgroundColor: Colors.backgroundColor,
              maxWidth: "100%",
            }}
          >
            <TouchableOpacity style={styles.headerTouchable}>
              <Image
                source={{
                  uri: "https://via.placeholder.com/150",
                }}
                style={{}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerTouchable}
              onPress={() => router.push("/(modals)/authentication/login")}
            >
              <AppText
                style={[
                  styles.headerText,
                  {
                    color: Colors.primary,
                  },
                ]}
              >
                {t("aboutUs.login")}
              </AppText>
            </TouchableOpacity>
            <AppText
              style={[
                styles.headerText,
                {
                  color: Colors.primary,
                },
              ]}
            >
              &
            </AppText>
            <TouchableOpacity style={styles.headerTouchable}>
              <AppText
                style={[
                  styles.headerText,
                  {
                    color: Colors.primary,
                  },
                ]}
              >
                {t("aboutUs.register")}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: Colors.primary,
              alignItems: "center",
              flexDirection: "row",
              backgroundColor: Colors.backgroundColor,
              maxWidth: "100%",
            }}
          >
            <TouchableOpacity style={styles.headerTouchable}>
              <ProfileAvatar
                imageUrl={userData?.userImage}
                width={width * 0.23}
                userName={userData?.unique_user_ID}
              />
            </TouchableOpacity>
            <View style={{ width: width / 2.2 }}>
              <AppText
                style={{
                  color: Colors.primary,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {userData?.unique_user_ID}
              </AppText>
              <AppText style={styles.userDataContainer}>
                {userData?.email}
              </AppText>
            </View>
          </View>
        )}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View>
        <View
          style={[
            styles.log,
            {
              backgroundColor:
                theme === "dark" ? Colors.containerLittleGrey : Colors.grey,
            },
          ]}
        >
          <View style={styles.logInside}>
            <TouchableOpacity style={styles.logInsideTouchable}>
              <Ionicons name="people" size={24} color={Colors.darkGrey} />
              <AppText
                style={[
                  styles.logText,
                  {
                    color: Colors.darkGrey,
                  },
                ]}
              >
                {t("aboutUs.aboutUs")}
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.logInside}>
            <TouchableOpacity style={styles.logInsideTouchable}>
              <Ionicons name="help" size={24} color={Colors.darkGrey} />
              <AppText
                style={[
                  styles.logText,
                  {
                    color: Colors.darkGrey,
                  },
                ]}
              >
                {t("aboutUs.helps")}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.logInside}>
            <TouchableOpacity style={styles.logInsideTouchable}>
              <AntDesign
                name="customerservice"
                size={24}
                color={Colors.darkGrey}
              />
              <AppText
                style={[
                  styles.logText,
                  {
                    color: Colors.darkGrey,
                  },
                ]}
              >
                {t("aboutUs.contactUs")}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            padding: 20,
            backgroundColor:
              theme === "dark" ? Colors.containerLittleGrey : Colors.grey,
            flexDirection: "row",
            justifyContent: "center",
            gap: 30,
          }}
        >
          <TouchableOpacity>
            <FontAwesome
              name="facebook-official"
              size={27}
              color={Colors.darkGrey}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="instagram" size={27} color={Colors.darkGrey} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Fontisto name="email" size={27} color={Colors.darkGrey} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: 20 + bottom,
            backgroundColor:
              theme === "dark" ? Colors.containerLittleGrey : Colors.grey,
          },
        ]}
      >
        <FontAwesome name="copyright" size={24} color="black" />
        <AppText style={styles.rightsText}>All rights reserved</AppText>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {},

  headerTouchable: {
    padding: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "cursive",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
  },
  userDataContainer: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9acffd",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    paddingBottom: 20,
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  log: {
    justifyContent: "center",
  },
  logInside: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  logInsideTouchable: {
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  logText: {
    paddingHorizontal: 20,
  },
  footerButton: {
    marginVertical: 10,
    borderRadius: 8,
  },
  drawerItemLabel: {
    fontWeight: "bold",
    color: "#78909C",
  },
  rightsText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
});

export default CustomDrawerContent;
