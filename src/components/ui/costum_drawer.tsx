import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { Ionicons, Fontisto, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/context/auth_context";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { useAuthQuery } from "@/hooks/useQuery";
import ProfileAvatar from "@/components/ui/profile_avatar";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "expo-router/drawer";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  unique_user_ID: string;
  userImage: string | null;
}

function CustomDrawerContext(props: DrawerContentComponentProps) {
  const { colors: Colors, theme } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const { LoginStatus } = useAuth();
  const { width } = useWindowDimensions();

  const { data } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  const userData = useMemo<UserData | null>(() => {
    if (!data?.profileData) return null;
    try {
      const parsed =
        typeof data.profileData === "string"
          ? JSON.parse(data.profileData)
          : data.profileData;
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      return null;
    }
  }, [data?.profileData]);

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
            style={[
              styles.headerSection,
              {
                borderBottomColor: Colors.primary,
                backgroundColor: Colors.backgroundColor,
              },
            ]}
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
              onPress={() => router.push("/auth/login")}
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
            style={[
              styles.headerSection,
              {
                borderBottomColor: Colors.primary,
                backgroundColor: Colors.backgroundColor,
              },
            ]}
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
                name="customer-service"
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
          style={[
            styles.socialRow,
            {
              backgroundColor:
                theme === "dark" ? Colors.containerLittleGrey : Colors.grey,
            },
          ]}
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
}

export default React.memo(CustomDrawerContext);

const styles = StyleSheet.create({
  container: {},

  headerSection: {
    padding: 10,
    borderBottomWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    maxWidth: "100%",
  },
  socialRow: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },

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
