import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language_context";
import i18n from "@/hooks/i18n_instance";
import * as SecureStorage from "expo-secure-store";
import { useAuth } from "@/context/auth_context";
import { router } from "expo-router";
import { useTheme } from "@/context/theme_context";
import Change_Language_Modal from "@/components/settings/language_change";
import AppText from "@/components/ui/app_text";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { flushRegularQuery } from "@/hooks/useQuery";
import axiosInstance from "@/hooks/axiosInstance";

const ProfileSettings: React.FC = () => {
  const { colors: Colors, theme, changeTheme } = useTheme();
  const { logOut } = useAuth();
  const { changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);

  const settingsDet: any = t("settings", { returnObjects: true });
  const settings = Array.isArray(settingsDet) ? settingsDet[0] : [];

  const preferences = settings?.preferences[0] || {};
  const helpSupport = settings?.helpSupport[0] || {};
  const accountSupport = settings?.accountDetails[0] || {};
  const socialMedia = settings?.socialMedia[0] || {};

  interface SettingsItem {
    id: string;
    icon: any;
    label: any;
    value?: string;
    iconBg: string;
    iconColor: string;
    onPress?: () => void;
    danger?: boolean;
    component?: React.ReactNode;
  }
  const Sections: Array<{ header: string; items: SettingsItem[] }> = [
    {
      header: preferences.headerPreferences,
      items: [
        {
          id: "language",
          icon: preferences.iconLocationSettings,
          label: preferences.language,
          value: i18n.language === "en" ? "English" : i18n.language,
          iconBg: "#E0F2FE",
          iconColor: "#0284C7",
        },
        {
          id: "theme",
          icon: preferences.iconLocationTheme,
          label: preferences.theme,
          component: (
            <Theme_Changer_Toggle value={theme} onToggle={changeTheme} />
          ),
          iconBg: "#F3E8FF",
          iconColor: "#7C3AED",
        },
        {
          id: "notifications",
          icon: "notifications",
          label: preferences.notification,
          iconBg: "#FEE2E2",
          iconColor: "#DC2626",
          onPress: () =>
            router.push(
              "/(drawer)/(user)/(sub_settings)/settings_notification",
            ),
        },
        {
          id: "about",
          icon: preferences.iconLocationAbout,
          label: preferences.about,
          iconBg: "#E5E7EB",
          iconColor: "#374151",
        },
      ],
    },
    {
      header: helpSupport.helpSupport,
      items: [
        {
          id: "contact",
          icon: helpSupport.iconLocationContractUs,
          label: helpSupport.contractUs,
          iconBg: "#DCFCE7",
          iconColor: "#16A34A",
          onPress: () => {
            testadmin();
          },
        },
        {
          id: "faq",
          icon: helpSupport.iconLocationFAQ,
          label: helpSupport.FAQ,
          iconBg: "#FEF9C3",
          iconColor: "#CA8A04",
        },
        {
          id: "terms",
          icon: "document",
          label: helpSupport.termsConditions,
          iconBg: "#E0E7FF",
          iconColor: "#4F46E5",
        },
        {
          id: "privacy",
          icon: helpSupport.iconLocationPrivacyPolicy,
          label: helpSupport.privacyPolicy,
          iconBg: "#ECFEFF",
          iconColor: "#0891B2",
        },
      ],
    },
    {
      header: accountSupport.account,
      items: [
        {
          id: "profile",
          icon: accountSupport.iconLocationProfile,
          label: accountSupport.profile,
          iconBg: "#EEF2FF",
          iconColor: "#4338CA",
        },
        {
          id: "password",
          icon: accountSupport.iconLocationChangePassword,
          label: accountSupport.changePassword,
          iconBg: "#FFF7ED",
          iconColor: "#EA580C",
        },
        {
          id: "delete",
          icon: accountSupport.iconLocationdeleteAccount,
          label: accountSupport.deleteAccount,
          danger: true,
          iconBg: "#FEE2E2",
          iconColor: "#DC2626",
        },
        {
          id: "logout",
          icon: accountSupport.iconLocationLogout,
          label: accountSupport.logout,
          iconBg: "#E5E7EB",
          iconColor: "#374151",
        },
      ],
    },
    {
      header: socialMedia.socialMedia,
      items: [
        {
          id: "facebook",
          icon: socialMedia.iconLocationFacebook,
          label: socialMedia.facebook,
          iconBg: "#DBEAFE",
          iconColor: "#1877F2",
        },
        {
          id: "twitter",
          icon: socialMedia.iconLocationTwitter,
          label: socialMedia.twitter,
          iconBg: "#E0F2FE",
          iconColor: "#1DA1F2",
        },
        {
          id: "instagram",
          icon: socialMedia.iconLocationInstagram,
          label: socialMedia.instagram,
          iconBg: "#FCE7F3",
          iconColor: "#E1306C",
        },
      ],
    },
  ];

  const testadmin = async () => {
    try {
      const response = await axiosInstance.post("/admin/hall", {
        hall_version: "1.0.0",
      });
      console.log(response.status);
    } catch (err) {
      console.log(err);
    }
  };
  const logoutHandle = async () => {
    Alert.alert(t("userLogout.logoutAlert"), t("userLogout.logoutMessage"), [
      { text: t("userLogout.cancel"), style: "cancel" },
      {
        text: t("userLogout.yes"),
        onPress: async () => {
          await SecureStorage.deleteItemAsync("Tokens");
          logOut();
          flushRegularQuery();
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <AppText style={[styles.title, { color: Colors.themeColorTextPure }]}>
            {settings?.settingsDetails}
          </AppText>
          <Text
            style={[styles.subtitle, { color: Colors.themeColorTextSecondary }]}
          >
            {settings?.settingSubtitle}
          </Text>
        </View>

        {/* SECTIONS */}
        {Sections.map((section) => (
          <View key={section.header} style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>{section.header}</Text>

            <View
              style={[styles.card, { backgroundColor: Colors.containerColor }]}
            >
              {section.items.map((item, index) => {
                const isLast = index === section.items.length - 1;
                const RowWrapper =
                  item.id === "theme" ? View : TouchableOpacity;
                return (
                  <React.Fragment key={item.id}>
                    <RowWrapper
                      {...(item.id !== "theme"
                        ? {
                            activeOpacity: 0.7,
                            onPress: () => {
                              if (item.id === "language") setModalVisible(true);
                              else if (item.id === "logout") logoutHandle();
                              else if (item.onPress) item.onPress();
                            },
                          }
                        : {})}
                    >
                      <View style={styles.row}>
                        {/* ICON */}
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: item.iconBg ?? "#f1f5f9" },
                          ]}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={item.iconColor}
                          />
                        </View>

                        {/* LABEL */}
                        {item.label && (
                          <AppText
                            style={[
                              styles.label,
                              item.danger && { color: "#dc2626" },
                            ]}
                          >
                            {item.label}
                          </AppText>
                        )}

                        {/* RIGHT CONTENT */}
                        <View style={{ marginLeft: "auto" }}>
                          {item.value && (
                            <AppText style={styles.value}>{item.value}</AppText>
                          )}
                          {item.component}
                        </View>

                        {/* CHEVRON */}
                        {item.id !== "theme" && (
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9ca3af"
                          />
                        )}
                      </View>
                    </RowWrapper>

                    {!isLast && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODALS */}
      <Change_Language_Modal
        languageModal={modalVisible}
        setLanguageModals={setModalVisible}
        changeLanguage={changeLanguage}
        handleLng={(lng) => {
          changeLanguage(lng);
          i18n.changeLanguage(lng);
          setModalVisible(false);
        }}
      />
    </>
  );
};

export default ProfileSettings;

interface ThemeToggleProps {
  value: "light" | "dark";
  onToggle: (theme: "light" | "dark") => void;
}
const WIDTH = 72;
const HEIGHT = 36;
const KNOB_SIZE = 30;
const PADDING = 3;

const Theme_Changer_Toggle: React.FC<ThemeToggleProps> = ({
  value,
  onToggle,
}) => {
  const progress = useSharedValue(value === "dark" ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value === "dark" ? 1 : 0, {
      duration: 280,
    });
  }, [value]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [1, 0],
      ["#62c1e5", "#3b4a5a"],
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(
          progress.value === 1 ? WIDTH - KNOB_SIZE - PADDING * 2 : 0,
          { duration: 280 },
        ),
      },
    ],
  }));

  const sunStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 1 - progress.value * 0.2 }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 0.8 + progress.value * 0.2 }],
  }));

  return (
    <Pressable onPressIn={() => onToggle(value === "dark" ? "light" : "dark")}>
      <Animated.View
        style={[
          {
            width: WIDTH,
            height: HEIGHT,
            borderRadius: HEIGHT / 2,
            padding: PADDING,
            justifyContent: "center",
          },
          containerStyle,
        ]}
      >
        {/* SUN */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 5,
            },
            sunStyle,
          ]}
        >
          <Ionicons name="sunny" size={25} color="#facc15" />
        </Animated.View>

        {/* MOON */}
        <Animated.View
          style={[
            {
              position: "absolute",
              right: 5,
            },
            moonStyle,
          ]}
        >
          <Ionicons name="moon" size={25} color="#fde68a" />
        </Animated.View>

        {/* KNOB */}
        <Animated.View
          style={[
            {
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
              backgroundColor: "#ffffff",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  sectionTitle: {
    marginLeft: 24,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    letterSpacing: 1,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  label: {
    flex: 1,
    fontSize: 15,
  },

  value: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: 56,
  },
});
