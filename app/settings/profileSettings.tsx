import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../(modals)/context/Languages";
import i18n from "@/utils/i18";
import * as SecureStorage from "expo-secure-store";
import { useAuth } from "../(modals)/context/authContext";
import { router } from "expo-router";
import { useTheme } from "../(modals)/context/themeContext";
import Theme_Changer_Modal from "./components/theme_change";
import Change_Language_Modal from "./components/language_change";
import { flush_regular_swr } from "@/hooks/useswr";

const ProfileSettings: React.FC = () => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: Colors.themeColorTextPure,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "400",
      color: Colors.themeColorTextSecondary,
    },
    section: {
      paddingTop: 12,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      paddingBottom: 12,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#a7a7a7",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    rowWrapper: {
      paddingLeft: 24,
      backgroundColor: Colors.containerColor,
    },
    row: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingRight: 24,
    },
    rowlabel: {
      fontSize: 16,
      color: Colors.themeColorTextPure,
    },
  });

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [forceRerender, setForceRerender] = useState(false);
  const [themeModelVisible, setThemeModelVisible] = useState<boolean>(false);
  const { logOut } = useAuth();

  const { t } = useTranslation();
  const settingsDet: any = t("settings", { returnObjects: true });
  const settings = Array.isArray(settingsDet) ? settingsDet[0] : [];

  const preferences = settings?.preferences[0] || [];
  const helpSupport = settings?.helpSupport[0] || [];
  const accountSupport = settings?.accountDetails[0] || [];
  const socialMedia = settings?.socialMedia[0] || [];
  const Sections = [
    {
      header: `${preferences.headerPreferences}`,
      items: [
        {
          id: "language",
          icon: `${preferences.iconLocationSettings}`,
          label: `${preferences.language}`,
          type: "select",
        },
        {
          id: "theme",
          icon: `${preferences.iconLocationTheme}`,
          label: `${preferences.theme}`,
          type: "select",
        },
        {
          id: "notifications",
          icon: "notifications",
          label: `${preferences.notification}`,
          type: "toggle",
        },
        {
          id: "about",
          icon: `${preferences.iconLocationAbout}`,
          label: preferences.about,
          type: "link",
        },
      ],
    },
    {
      header: `${helpSupport.helpSupport}`,
      items: [
        {
          id: "contact",
          icon: `${helpSupport.iconLocationContractUs}`,
          label: `${helpSupport.contractUs}`,
          type: "link",
        },
        {
          id: "faq",
          icon: `${helpSupport.iconLocationFAQ}`,
          label: `${helpSupport.FAQ}`,
          type: "link",
        },
        {
          id: "terms",
          icon: "document",
          label: `${helpSupport.termsConditions}`,
          type: "link",
        },
        {
          id: "privacy",
          icon: `${helpSupport.iconLocationPrivacyPolicy}`,
          label: `${helpSupport.privacyPolicy}`,
          type: "link",
        },
      ],
    },
    {
      header: `${accountSupport.account}`,
      items: [
        {
          id: "profile",
          icon: `${accountSupport.iconLocationProfile}`,
          label: `${accountSupport.profile}`,
          type: "link",
        },
        {
          id: "password",
          icon: `${accountSupport.iconLocationChangePassword}`,
          label: `${accountSupport.changePassword}`,
          type: "link",
        },
        {
          id: "delete",
          icon: `${accountSupport.iconLocationdeleteAccount}`,
          label: `${accountSupport.deleteAccount}`,
          type: "link",
        },
        {
          id: "logout",
          icon: `${accountSupport.iconLocationLogout}`,
          label: `${accountSupport.logout}`,
          type: "link",
        },
      ],
    },
    {
      header: socialMedia.socialMedia,
      items: [
        {
          id: "facebook",
          icon: `${socialMedia.iconLocationFacebook}`,
          label: `${socialMedia.facebook}`,
          type: "link",
        },
        {
          id: "twitter",
          icon: `${socialMedia.iconLocationTwitter}`,
          label: `${socialMedia.twitter}`,
          type: "link",
        },
        {
          id: "instagram",
          icon: `${socialMedia.iconLocationInstagram}`,
          label: `${socialMedia.instagram}`,
          type: "link",
        },
      ],
    },
  ];

  const { changeLanguage } = useLanguage();

  const handleLng = (lang: string) => {
    changeLanguage(lang);
    i18n.changeLanguage(lang);
    setModalVisible(false);
  };
  const logoutHandle = async () => {
    SecureStorage.deleteItemAsync("Tokens")
      .then(() => {
        Alert.alert(
          t("userLogout.logoutAlert"),
          t("userLogout.logoutMessage"),
          [
            {
              text: t("userLogout.cancel"),
              style: "cancel",
            },
            {
              text: t("userLogout.yes"),
              onPress: () => {
                logOut();
                router.replace("..");
                setForceRerender(!forceRerender);
                flush_regular_swr();
              },
            },
          ]
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: Colors.containerColor }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{settings?.settingsDetails}</Text>
          <Text style={styles.subtitle}>{settings?.settingSubtitle}</Text>
        </View>
        {Sections.map(({ header, items }) => (
          <View style={styles.section} key={header}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{header}</Text>
            </View>
            {items.map(({ label, id, icon }, index) => (
              <View
                key={id} // Ensure unique key for each item
                style={[
                  styles.rowWrapper,
                  index === 0 && { borderTopWidth: 0 }, // Remove top border for first item
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (id == "language") {
                      setModalVisible(true);
                    } else if (id == "logout") {
                      logoutHandle();
                    } else if (id === "theme") {
                      setThemeModelVisible(true);
                    }
                  }}
                >
                  <View style={styles.row}>
                    <Ionicons name={icon as any} color={"#616161"} size={24} />
                    <Text style={styles.rowlabel}> {label}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <Change_Language_Modal
        languageModal={modalVisible}
        setLanguageModals={setModalVisible}
        changeLanguage={changeLanguage}
        handleLng={handleLng}
      />
      <Theme_Changer_Modal
        themeModalVisible={themeModelVisible}
        setThemeModalVisible={setThemeModelVisible}
      />
    </>
  );
};

export default ProfileSettings;
