import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Avatar } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import axiosInstance from "@/hooks/axiosInstance";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "@/src/context/authContext";
import { GroupChat } from "@/interfaces/chatType";
import { useTranslation } from "react-i18next";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/src/context/themeContext";
import { useRegularQuery } from "@/hooks/useQuery";

interface MemberModalProps {
  memberModalVisible: boolean;
  setMemberModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  memberData: GroupChat[];
}

interface Members {
  email: string;
  unique_user_ID: string;
  userImage: string;
}

const MemberModal: React.FC<MemberModalProps> = ({ memberData }) => {
  const { colors: Colors } = useTheme();
  const styles = StyleSheet.create({
    modalBody: {
      marginHorizontal: 20,
      padding: 20,
    },
    headerText: {
      color: Colors.dark,
      fontWeight: "600",
      fontSize: 20,
      paddingBottom: 10,
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomColor: Colors.grey,
      borderBottomWidth: 1,
      padding: 10,
    },
    seeAllText: {
      textAlign: "center",
      color: Colors.primary,
      paddingVertical: 10,
      fontWeight: "600",
    },
    addButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      padding: 10,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    plusIconContainer: {
      borderRadius: 50,
      backgroundColor: Colors.grey,
      padding: 15,
    },
    addButtonText: {
      color: Colors.dark,
      fontSize: 21,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    qrPopup: {
      backgroundColor: Colors.light,
      padding: 20,
      borderRadius: 16,
      alignItems: "center",
      elevation: 5, // Android shadow
      shadowColor: "#000", // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  const [showAll, setShowAll] = useState(false);
  const [qrLink, setQrLink] = useState<string | null>(null);
  const { LoginStatus } = useAuth();

  const snapPoints = useMemo(() => ["10%"], ["40%"]);

  const { data } = useRegularQuery(
    {
      pathname: `/auth/profile/${memberData[0].group_ID}?page=${1}&limit=${10}`,
      cacheKey: `${memberData[0].group_ID}_group_members`,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    },
  );

  const fetched_member: Members[] = data?.userData?.members || [];
  const displayedMembers = showAll
    ? fetched_member
    : fetched_member.slice(0, 3);

  const handleAddMember = async () => {
    try {
      const generateLink = await axiosInstance.post(
        "/auth/chat-link-generate",
        {
          group_ID: memberData[0].group_ID,
        },
        {
          timeout: 10 * 1000,
        },
      );
      if (generateLink.status === 200 && generateLink.data.success) {
        const { link } = generateLink.data;
        setQrLink(link);
      } else if (generateLink.status === 400 && !generateLink.data.success) {
        Notifier.showNotification({
          title: `Failed`,
          description: generateLink.data.message,
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };
  const handleCopyLink = async () => {
    if (qrLink) {
      await Clipboard.setStringAsync(qrLink);
      Notifier.showNotification({
        title: "Successfully copied link",
        Component: NotifierComponents.Notification,
      });
    }
  };
  const { t } = useTranslation();
  const groupChatSettings: any = t("groupChatSettings", {
    returnObjects: true,
  });

  return (
    <View style={{ backgroundColor: Colors.light, flex: 1 }}>
      <View style={styles.modalBody}>
        <Text style={styles.headerText}>{groupChatSettings.chatMembers}</Text>
        <FlatList
          data={displayedMembers}
          keyExtractor={(item) => item.unique_user_ID}
          renderItem={({ item }: { item: Members }) => (
            <View style={styles.memberRow}>
              <Avatar.Icon
                size={60}
                icon="account"
                style={{
                  backgroundColor: Colors.lightGrey,
                  borderRadius: 50,
                  borderWidth: 0.5,
                }}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: "600", fontSize: 15 }}>
                  {item.unique_user_ID}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "300" }}>
                  {item.email}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            fetched_member.length > 3 ? (
              <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                <Text style={styles.seeAllText}>
                  {showAll ? "Close All" : "See All"}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <View style={styles.plusIconContainer}>
              <AntDesign name="plus" size={30} color="#3f3f3f" />
            </View>
            <Text style={styles.addButtonText}>
              {groupChatSettings.addMembers}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={qrLink !== null}
        animationType="fade"
        onDismiss={() => setQrLink(null)}
        transparent={true}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrPopup}>
            {qrLink && <QRCode value={qrLink} size={200} />}
            <View
              style={{
                alignItems: "center",
                padding: 10,
              }}
            >
              <TouchableOpacity
                onPress={handleCopyLink}
                style={{
                  padding: 10,
                  backgroundColor: Colors.primary,
                  marginTop: 10,
                  width: 200,
                  alignItems: "center",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    color: Colors.lightGrey,
                    fontSize: 15,
                  }}
                >
                  {groupChatSettings.copyLink}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setQrLink(null)}>
                <Text style={{ color: "red", marginTop: 10 }}>
                  {groupChatSettings.close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MemberModal;
