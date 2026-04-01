import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { useAuthQuery, useRegularQuery } from "@/hooks/useQuery";
import { useAuth } from "@/app/(modals)/context/authContext";
import ProfileAvatar from "../profile_avatar";
import OwnActivaterIndicator from "@/constants/loaderAnimation";

interface NormalUserProps {
  formData: any;
  copyToClipboard: () => void;
}

const NormalUser: React.FC<NormalUserProps> = ({ formData }) => {
  const { colors, theme } = useTheme();
  const { LoginStatus } = useAuth();
  const { width } = Dimensions.get("screen");
  const [userData, setUserData] = useState<{
    email: string;
    phoneNumber: string;
    unique_user_ID: string;
    userImage: string | null;
    userNames: {
      firstName: string;
      lastName: string;
    };
  }>();

  const { data, error, isLoading, isError } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: [`auth_status`] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
      staleTime: 1_000,
      retry: 0,
    },
  );

  const {
    data: statData,
    error: statErr,
    isLoading: statLoading,
  } = useRegularQuery(
    {
      pathname: "/auth/esport/stat",
      cacheKey: ["esport_stat"],
      loginStatus: LoginStatus,
    },
    {},
  );
  useEffect(() => {
    if (data) {
      setUserData(data.profileData);
    }
  }, [data, error]);

  const stats = [
    { label: "WINS", value: "1,284" },
    { label: "HOURS", value: "4.2k" },
    { label: "K/D", value: "2.41" },
  ];
  if (isLoading) {
    return <OwnActivaterIndicator />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View
            style={{
              width: 140,
              height: 140,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={["transparent", colors.primary]}
              style={{
                position: "absolute",
                width: 150,
                height: 150,
                borderRadius: 75,
                borderWidth: 2,
                borderColor: colors.primary,
                opacity: 0.6,
              }}
            />
            <ProfileAvatar
              width={width * 0.2}
              userName={userData?.unique_user_ID}
              imageUrl={userData?.userImage}
            />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                backgroundColor: colors.primary,
                paddingHorizontal: 8,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                LVL 99
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: colors.themeColorTextPure,
              fontSize: 28,
              fontWeight: "bold",
              marginTop: 15,
            }}
          >
            {userData?.unique_user_ID ?? "UNKNOWN"}
          </Text>
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontWeight: "800",
              letterSpacing: 1,
              marginTop: 4,
            }}
          >
            PRO LEAGUE VANGUARD
          </Text>

          {/* Stats Bar */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              alignItems: "center",
            }}
          >
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <View style={{ alignItems: "center", paddingHorizontal: 15 }}>
                  <Text
                    style={{ color: "#666", fontSize: 11, fontWeight: "bold" }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                  >
                    {stat.value}
                  </Text>
                </View>
                {index < stats.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Esports Status */}
        <Text style={styles.sectionTitle}>ESPORTS STATUS</Text>
        <View style={styles.row}>
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name="star-four-points"
                size={32}
                color="#a855f7"
              />
            }
            game="DOTA 2"
            rank="Immortal"
          />
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name="star-four-points"
                size={32}
                color="#a855f7"
              />
            }
            game="DOTA 2"
            rank="Immortal"
          />
        </View>

        {/* Sports Status */}
        <Text style={styles.sectionTitle}>SPORTS STATUS</Text>
        <View style={styles.row}>
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name="basketball"
                size={32}
                color="#00e5ff"
              />
            }
            game="BASKETBALL"
            rank="All-Star"
          />
          <StatusCard
            icon={
              <MaterialCommunityIcons
                name="volleyball"
                size={32}
                color="#a855f7"
              />
            }
            game="VOLLEYBALL"
            rank="Pro League"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.historyButton}>
          <Text style={styles.historyButtonText}>VIEW PLAY HISTORY</Text>
          <MaterialCommunityIcons
            name="history"
            size={18}
            color="#00e5ff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        {/* Live Sessions */}
        <View style={styles.liveHeader}>
          <Text style={styles.sectionTitle}>LIVE SESSIONS</Text>
          <View style={styles.activeDot} />
        </View>
        <View style={styles.liveCard}>
          <View style={styles.accentBorder} />
          <View style={styles.liveCardContent}>
            <View style={styles.liveRow}>
              <Text style={styles.stationName}>Station 14 - VIP Hall</Text>
              <Text style={styles.timerText}>00:42:15</Text>
            </View>
            <Text style={styles.sessionSubtext}>
              Valorant • 42 mins remaining
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Sub-component for rank cards
const StatusCard = ({ icon, game, rank }: any) => (
  <View style={styles.card}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.cardGame}>{game}</Text>
    <Text style={styles.cardRank}>{rank}</Text>
  </View>
);

const styles = StyleSheet.create({
  divider: { width: 1, height: 30, backgroundColor: "#222" },
  sectionTitle: {
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
    letterSpacing: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    backgroundColor: "#0a0a0a",
    width: "48%",
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111",
  },
  iconContainer: {
    backgroundColor: "#151515",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardGame: {
    color: "#666",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardRank: { color: "white", fontSize: 16, fontWeight: "bold" },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 30,
  },
  historyButtonText: { color: "#00e5ff", fontWeight: "bold", fontSize: 14 },
  liveHeader: { flexDirection: "row", alignItems: "center" },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00e5ff",
    marginLeft: 8,
    marginTop: 15,
  },
  liveCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBorder: { width: 3, backgroundColor: "#00e5ff" },
  liveCardContent: { flex: 1, padding: 16 },
  liveRow: { flexDirection: "row", justifyContent: "space-between" },
  stationName: { color: "white", fontWeight: "bold", fontSize: 15 },
  timerText: { color: "#00e5ff", fontWeight: "bold" },
  sessionSubtext: { color: "#666", fontSize: 12, marginTop: 4 },
});

export default NormalUser;
