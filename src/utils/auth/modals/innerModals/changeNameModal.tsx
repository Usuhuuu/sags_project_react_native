import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axiosInstance from "@/hooks/axiosInstance";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";

interface ChangeNameModalProps {
  changeNameModalVisible: boolean;
  setChangeNameModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  MemberData?: any;
}

const ChangeNameModal: React.FC<ChangeNameModalProps> = ({
  groupName,
  setGroupName,
  MemberData,
}) => {
  const { colors: Colors } = useTheme();

  const [chatName, setChatName] = React.useState<string>("");
  const numericValue = chatName.length;
  const hasError = isNaN(numericValue) || numericValue >= 100;

  useEffect(() => {
    if (MemberData?.length > 0) {
      const generatedName = `${MemberData[0]?.sportHallName ?? ""} ${
        MemberData[0]?.date ?? ""
      } ${MemberData[0]?.startTime ?? ""} - ${MemberData[0]?.endTime ?? ""}`;
      setChatName(groupName || generatedName);
    }
  }, [MemberData, groupName]);

  const { bottom } = useSafeAreaInsets();

  const handleNameChange = async () => {
    if (chatName.length < 100) {
      const response = await axiosInstance.post(
        "/auth/chat-update-group-name",
        {
          groupId: MemberData[0]?.group_ID,
          groupName: chatName,
        },
      );
      if (response.status === 200 && response.data.success) {
        setGroupName(chatName);
        router.replace("/");
        Notifier.showNotification({
          title: "Updated Successfully",
          description: "Group name updated successfully",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
      } else {
        Notifier.showNotification({
          title: "Failed to update group name",
          description: "Please try again later",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    }
  };
  const { t } = useTranslation();
  const groupChatSettings: any = t("groupChatSettings", {
    returnObjects: true,
  });

  return (
    <View
      style={{
        backgroundColor: Colors.lightGrey,
        flex: 1,
        height: "100%",
        marginBottom: bottom,
        justifyContent: "center",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ marginHorizontal: 20, gap: 10, marginTop: 40 }}>
          <Text
            style={{ alignSelf: "center", fontSize: 24, fontWeight: "500" }}
          >
            {groupChatSettings.editGroupName}
          </Text>
          <View>
            <TextInput
              value={chatName}
              onChangeText={(e) => setChatName(e)}
              multiline
              style={{
                backgroundColor: Colors.white,
              }}
              error={hasError}
              theme={{
                colors: {
                  primary: Colors.white,
                },
              }}
            />
            {hasError && (
              <HelperText
                type="error"
                visible={hasError}
                style={{ marginLeft: 10 }}
              >
                {groupChatSettings.nameMustbeLessThan100}
              </HelperText>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <AppText style={{ color: "grey" }}>
              {groupChatSettings.thisNameWillBeVisibleToAll}
            </AppText>
            <AppText style={{ color: "grey" }}>{chatName.length}/100</AppText>
          </View>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: Colors.white,
              padding: 10,
              justifyContent: "space-between",
              borderRadius: 10,
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              style={[
                styles.buttons,
                {
                  borderWidth: 1,
                  borderColor: Colors.grey,
                  padding: 10,
                  width: "48%",
                  alignItems: "center",
                },
              ]}
            >
              <AppText style={{ fontSize: 20, fontWeight: "400" }}>
                {groupChatSettings.cancel}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttons,
                {
                  padding: 10,
                  backgroundColor: Colors.primary,
                  width: "48%",
                  alignItems: "center",
                  borderRadius: 10,
                },
              ]}
              onPress={handleNameChange}
            >
              <Text
                style={{ color: Colors.white, fontSize: 20, fontWeight: "500" }}
              >
                {groupChatSettings.save}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {},
});

export default ChangeNameModal;
