import {
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/src/context/themeContext";
import { useNavigation } from "@react-navigation/native";
import AppText from "@/constants/appTextDefault";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Notifier, NotifierComponents } from "react-native-notifier";
import PostModalOptions from "@/src/utils/together/components/option_modal";
import { ULAANBAATAR_DISTRICTS_MAP } from "@/assets/Data/ub_location";
import { SPORT_INDICATOR } from "@/assets/Data/sport_indicator";
import { MonthCalendar } from "@/src/utils/book/calendar_strip";
import axiosInstance from "@/hooks/axiosInstance";

const PostCreate = () => {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [postText, setPostText] = useState<string>("");
  const [optionModal, setOptionModal] = useState<boolean>(false);
  const [calendarModal, setCalendarModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<
    "location" | "game_type" | "date"
  >("location");
  const [optionData, setOptionData] = useState<
    Record<"location" | "game_type" | "date", any>
  >({
    location: null,
    game_type: null,
    date: null,
  });

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 5,
            borderRadius: 10,
            width: 50,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            if (postText.length > 3) {
              handleSendPost();
            } else {
              Notifier.showNotification({
                title: "Post text is too short",
                description: "Please write at least 4 characters.",
                duration: 1000,
                Component: NotifierComponents.Alert,
                componentProps: {
                  alertType: "warn",
                },
              });
            }
          }}
        >
          <AppText style={{ fontWeight: "600" }}>Post</AppText>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign name="left" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  });
  const snapPoints = useMemo(() => ["10%", "60%"], []);

  const PostSettingsDetail: Array<{
    id: "location" | "date" | "game_type";
    label: string;
  }> = [
    {
      id: "location",
      label: "Location",
    },
    {
      id: "date",
      label: "Date",
    },
    {
      id: "game_type",
      label: "Game Type",
    },
  ];

  const getOptionLabel = (
    settingId: "location" | "date" | "game_type",
    value: string | undefined,
  ): string | undefined => {
    if (!value) return undefined;

    if (settingId === "location") {
      return ULAANBAATAR_DISTRICTS_MAP[value]?.name;
    }

    if (settingId === "game_type") {
      return SPORT_INDICATOR[value]?.name;
    }
    if (settingId === "date") {
      return (
        optionData["date"]?.start.toDateString() +
        " - " +
        optionData["date"]?.end.toDateString()
      );
    }

    return undefined;
  };
  const selectCalendarDate = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {
    setOptionData((prev) => ({
      ...prev,
      ["date"]: {
        start: startDate,
        end: endDate,
      },
    }));
  };
  const handleSendPost = async () => {
    try {
      if (!optionData.game_type || !optionData.date || !optionData.location) {
        Notifier.showNotification({
          title: "Incomplete Post Settings",
          description: "Please set all post settings before posting.",
          duration: 1000,
          Component: NotifierComponents.Alert,
          componentProps: {
            alertType: "warn",
          },
        });
        return;
      }
      const response = await axiosInstance.post("/post/create", {
        postText: postText,
        sport_types: optionData.game_type,
        date: optionData.date,
        location: optionData.location,
      });
    } catch (err) {
      console.log("Post Create Error: ", err);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundColor }}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Header Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 16,
              marginTop: 16,
              gap: 12,
            }}
          >
            <TextInput
              placeholder="What's on your mind?"
              placeholderTextColor={colors.darkGrey}
              style={{ flex: 1, padding: 10, color: colors.themeColorTextPure }}
              value={postText}
              onChangeText={(text) => setPostText(text)}
            />
          </View>

          {/* Bottom Sheet */}

          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{ backgroundColor: colors.backgroundColor }}
            handleIndicatorStyle={{
              backgroundColor: colors.primary,
            }}
            handleStyle={{
              borderTopColor: colors.primary,
              borderTopWidth: 1,
              borderRadius: 10,
            }}
          >
            <BottomSheetScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16 }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <AppText
                  style={{
                    color: colors.themeColorTextPure,
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Post Settings
                </AppText>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#fff",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 14,
                  }}
                >
                  <AppText style={{ color: "#000", fontWeight: "600" }}>
                    Apply
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Main Options */}

              {PostSettingsDetail.map((item) => {
                const optionLabel = getOptionLabel(
                  item.id,
                  optionData[item.id],
                );
                return (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 14,
                      borderBottomWidth: 0.5,
                      borderBottomColor: "#2a2a2a",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (item.id === "date") {
                        setCalendarModal(true);
                      } else {
                        setOptionModal(true);
                      }
                      setSelectedOption(item.id);
                    }}
                    key={item.id}
                  >
                    <AppText style={{ color: "#fff", fontSize: 16 }}>
                      {item.id}
                    </AppText>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <AppText>{optionLabel ?? "None"}</AppText>
                      <AppText style={{ color: "#666", fontSize: 18 }}>
                        ›
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Advanced */}
              <AppText
                style={{
                  color: colors.darkGrey,
                  marginTop: 20,
                  marginBottom: 8,
                  fontSize: 13,
                }}
              >
                Advanced Controls
              </AppText>

              <ToggleRow label="Comments Allowed" value={true} />
              <ToggleRow label="Private Post" value={false} />
              <ToggleRow label="Schedule" value={true} />
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      </KeyboardAvoidingView>
      <PostModalOptions
        visible={optionModal}
        setVisible={setOptionModal}
        settingsId={selectedOption}
        optionData={optionData}
        setOptionData={setOptionData}
      />
      <MonthCalendar
        calendarModalVisible={calendarModal}
        setCalendarModalVisible={setCalendarModal}
        initDate={new Date()}
        handleMonthFilter={selectCalendarDate}
        selectDateRange={1}
      />
    </SafeAreaView>
  );
};

function ToggleRow({
  label,
  value: initial,
}: {
  label: string;
  value: boolean;
}) {
  const [value, setValue] = useState(initial);

  return (
    <View
      style={{
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: "#2a2a2a",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <AppText style={{ color: "#fff", fontSize: 16 }}>{label}</AppText>
      <Switch
        value={value}
        onValueChange={setValue}
        trackColor={{ false: "#333", true: "#0A84FF" }}
        thumbColor="#fff"
      />
    </View>
  );
}
export default PostCreate;
