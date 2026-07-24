import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth_context";
import { useTheme } from "@/context/theme_context";
import { useAuthQuery } from "@/hooks/useQuery";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";
import { Feather } from "@expo/vector-icons";

// --- Types ---
interface UserData {
  unique_user_ID: string;
  userNames: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phoneNumber: string;
  userImage: string;
}
// --- Data ---
const PROFILE_STATS_CONFIG: {
  label: string;
  value: string;
  iconName: string;
}[] = [
  { label: "Total Venues:", value: "3", iconName: "map-pin" },
  { label: "Staff Members:", value: "12", iconName: "users" },
  { label: "Years Active:", value: "5", iconName: "calendar" },
];

const MENU_ITEMS_CONFIG: { title: string; iconName: string }[] = [
  { title: "Personal Information", iconName: "user" },
  { title: "Business Credentials", iconName: "briefcase" },
  { title: "Payment Methods", iconName: "credit-card" },
  { title: "Security", iconName: "shield" },
];

const screenWidth = Dimensions.get("window").width;

const ContractorProfile = () => {
  const { logOut, LoginStatus } = useAuth();
  const { colors, theme } = useTheme();
  const [userData, setUserData] = useState<UserData>();
  const { data, error, isLoading, isFetching } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"],
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );
  useEffect(() => {
    if (!data?.profileData) return;
    setUserData(data.profileData);
  }, [data]);
  if (isLoading) {
    return <OwnActivaterIndicator />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Section */}
        <View
          style={{
            padding: 20,
            backgroundColor: colors.containerColor,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 4, width: 0 },
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: colors.themeColorTextPure,
              marginBottom: 20,
            }}
          >
            Profile
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.containerColor,
              borderRadius: 12,
              paddingHorizontal: 15,
              height: 45,
              borderWidth: 0.8,
              borderColor: colors.darkGrey,
            }}
          >
            <Feather name="search" size={18} color={colors.darkGrey} />
            <TextInput
              placeholder="Search users or zones..."
              placeholderTextColor={colors.darkGrey}
              style={{
                flex: 1,
                color: colors.darkGrey,
                marginLeft: 10,
              }}
            />
          </View>
        </View>

        {/* Profile Info */}
        <View
          style={{
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <View
            style={{
              width: 130,
              height: 130,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                ...StyleSheet.absoluteFill,
                borderRadius: 65,
                borderWidth: 2,
                borderColor: "#4dabff",
                shadowColor: "#4dabff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
              }}
            />
            <Image
              source={{ uri: "https://i.imgur.com/8Km9tLL.png" }} // Placeholder for Marc Andreessen
              style={{
                width: 115,
                height: 115,
                borderRadius: 57.5,
              }}
            />
          </View>
          <Text
            style={{
              color: colors.themeColorTextPure,
              fontSize: 24,
              fontWeight: "bold",
              marginTop: 15,
            }}
          >
            {userData?.userNames?.firstName} {userData?.userNames?.lastName}
          </Text>
          <Text
            style={{
              color: colors.darkGrey,
              fontSize: 16,
              marginTop: 4,
            }}
          >
            Senior Hall Manager
          </Text>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.containerColor,
            marginHorizontal: 20,
            marginTop: 25,
            borderRadius: 20,
            paddingVertical: 15,
            shadowColor: colors.shadowColor,
            shadowOpacity: 0.4,
            shadowOffset: { height: 4, width: 4 },
          }}
        >
          {PROFILE_STATS_CONFIG.map((item, index) => (
            <View key={index} style={{ flex: 1, alignItems: "center" }}>
              <Feather name={item.iconName as any} size={18} color="#4dabff" />
              <Text
                style={{
                  color: colors.themeColorTextPure,
                  fontSize: 10,
                  marginTop: 8,
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  color: colors.darkGrey,
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings Menu */}
        <View
          style={{
            backgroundColor: colors.containerColor,
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 20,
            shadowColor: colors.shadowColor,
            shadowOffset: { height: 4, width: 1 },
            shadowOpacity: 0.4,
          }}
        >
          {MENU_ITEMS_CONFIG.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 18,
                  borderBottomWidth: 0.2,
                  borderBottomColor: colors.darkGrey,
                },
                index === MENU_ITEMS_CONFIG.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Feather name={item.iconName as any} size={24} color="black" />
                <Text
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 16,
                    marginLeft: 15,
                  }}
                >
                  {item.title}
                </Text>
              </View>
              <Feather name="arrow-right-circle" size={20} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            margin: 20,
            height: 55,
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            borderColor: "rgba(255, 107, 107, 0.3)",
            shadowColor: "rgba(255, 107, 107, 0.3)",
            shadowOpacity: 1,
            shadowOffset: { height: 4, width: 0 },
          }}
          onPress={() =>
            Alert.alert(
              "Confirm Action",
              "Are you sure you want to Log Out?",
              [
                {
                  text: "No",
                  onPress: () => console.log("CANCEL"),
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => logOut(),
                },
              ],
              { cancelable: false },
            )
          }
        >
          <Text
            style={{
              color: "#ff6b6b",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContractorProfile;
