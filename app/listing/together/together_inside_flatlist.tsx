import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

type Post = {
  id: string;
  user: string;
  badge: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  joinable: boolean;
};
interface TogetherInsideFlatListProps {
  data: Post[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TogetherInsideFlatList = ({
  data,
  loading,
  setLoading,
}: TogetherInsideFlatListProps) => {
  const { colors, theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <View
        style={[
          {
            backgroundColor: colors.containerColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 4, height: 2 },
            shadowOpacity: theme === "dark" ? 0.7 : 0.1,
            shadowRadius: 4,
            borderRadius: 16,
            marginBottom: 16,
            marginHorizontal: 6,
          },
        ]}
      >
        <View
          style={[
            {
              backgroundColor: colors.containerColor,

              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#1c1c1c",
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 14, fontWeight: "500" }}>
                {item.user}
              </AppText>
              <AppText
                style={{ color: colors.darkGrey, fontSize: 11, marginTop: 2 }}
              >
                {item.badge}
              </AppText>
            </View>
            <AppText style={{ color: colors.darkGrey, fontSize: 11 }}>
              {item.time}
            </AppText>
          </View>

          <AppText style={{ fontSize: 14, lineHeight: 20, marginVertical: 10 }}>
            {item.text}
          </AppText>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={14}
                color={colors.darkGrey}
              />
              <AppText
                style={{
                  color: colors.darkGrey,
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                {item.comments}
              </AppText>

              <Ionicons
                name="heart-outline"
                size={14}
                color={colors.darkGrey}
                style={{ marginLeft: 12 }}
              />
              <AppText
                style={{
                  color: colors.darkGrey,
                  fontSize: 12,
                  marginLeft: 4,
                }}
              >
                {item.likes}
              </AppText>
            </View>

            {item.joinable && (
              <TouchableOpacity
                style={{
                  borderColor: colors.primary,
                  paddingHorizontal: 14,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AppText
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Join
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    ),
    []
  );

  return (
    <View style={{ backgroundColor: colors.backgroundColor, flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Floating Action */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.themeColorTextPure,
          justifyContent: "center",
          alignItems: "center",
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={26} color={colors.backgroundColor} />
      </TouchableOpacity>
    </View>
  );
};

export default TogetherInsideFlatList;
