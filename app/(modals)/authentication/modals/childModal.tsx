import Colors from "@/constants/Colors";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Avatar, Switch } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChangeNameModal from "./innerModals/changeNameModal";
import MemberModal from "./innerModals/memberModal";
import { GroupChat } from "@/app/(tabs)/chat";
import * as Notification from "expo-notifications";
import { useTranslation } from "react-i18next";

type childModalNested = {
  id: string;
  title: string;
  icon: any;
  onPress: () => void;
};

interface ChildModalProps {
  MemberData: GroupChat[];
}

const ChildModal: React.FC<ChildModalProps> = ({ MemberData }) => {
  const [memberModalVisible, setMemberModalVisible] = useState<boolean>(false);
  const [notificationsState, setNotificationsState] = useState<boolean>(false);
  const [changeNameModalVisible, setChangeNameModalVisible] =
    useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>(
    MemberData.length > 0 ? MemberData[0].group_chat_name : ""
  );
  const [baseModalVisible, setBaseModalVisible] = useState<boolean>(false);
  const { t } = useTranslation();
  const childModalLanguage: any = t("groupChatSettings", {
    returnObjects: true,
  });
  const childModalNested: childModalNested[] = [
    {
      id: "1",
      title: childModalLanguage.changeGroupName,
      icon: <Feather name="edit" size={30} color={Colors.primary} />,
      onPress: () => {
        setChangeNameModalVisible(true);
        setBaseModalVisible(true);
      },
    },
    {
      id: "2",
      title: childModalLanguage.members,
      icon: <Ionicons name="people" size={30} color={Colors.primary} />,
      onPress: () => {
        setMemberModalVisible(true);
        setBaseModalVisible(true);
      },
    },
    {
      id: "3",
      title: childModalLanguage.searchInChannel,
      icon: <Ionicons name="search" size={30} color={Colors.primary} />,
      onPress: () => {
        setMemberModalVisible(true);
        setBaseModalVisible(true);
      },
    },
    {
      id: "4",
      title: childModalLanguage.notifications,
      icon: <Ionicons name="notifications" size={30} color={Colors.primary} />,
      onPress: () => {
        setMemberModalVisible(true);
        setBaseModalVisible(true);
      },
    },
    {
      id: "5",
      title: childModalLanguage.leaveGroup,
      icon: <Ionicons name="exit" size={30} color={Colors.primary} />,
      onPress: () => {
        setMemberModalVisible(true);
        setBaseModalVisible(true);
      },
    },
    {
      id: "6",
      title: childModalLanguage.reportGroup,
      icon: <Ionicons name="flag" size={30} color={Colors.primary} />,
      onPress: () => {
        setMemberModalVisible(true);
        setBaseModalVisible(true);
      },
    },
  ];
  useEffect(() => {
    const getNotificaitonState = async () => {
      const { status } = await Notification.getPermissionsAsync();
      if (status === "granted") {
        setNotificationsState(true);
      } else {
        setNotificationsState(false);
      }
    };
    getNotificaitonState();
  }, []);

  const handleNotificationToggle = (state: boolean) => {
    setNotificationsState(!notificationsState);
  };

  const height = Dimensions.get("window").height;
  const headerHeight = useHeaderHeight();
  const { bottom, top } = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: Colors.lightGrey,
        height: height - headerHeight / 1 - bottom,
      }}
    >
      <View>
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 50 }}>
          <Avatar.Image
            source={{ uri: MemberData[0].chat_image }}
            size={100}
            theme={{
              colors: {
                primary: Colors.white,
              },
            }}
          />
        </View>
        <FlatList
          data={childModalNested}
          style={{
            maxHeight: "95%",
            maxWidth: "95%",
            marginHorizontal: 20,
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                padding: 20,
                gap: 10,
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: Colors.light,
              }}
            >
              {item.icon}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <TouchableOpacity
                  onPress={item.onPress}
                  style={{ flexDirection: "row", gap: 10 }}
                >
                  <Text style={{ fontSize: 20 }}>{item.title}</Text>
                </TouchableOpacity>
                <View>
                  {item.id === "2" && (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Text
                        style={{
                          alignSelf: "flex-end",
                          fontSize: 20,
                          color: Colors.primary,
                        }}
                      >
                        {MemberData[0].members.length}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.primary}
                        style={{ alignSelf: "flex-end" }}
                      />
                    </View>
                  )}
                  {item.id === "4" && (
                    <Switch
                      value={notificationsState}
                      onValueChange={handleNotificationToggle}
                      color={Colors.primary}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
        />
      </View>
      {/* Modals */}
      <View>
        <Modal
          animationType="slide"
          presentationStyle={"pageSheet"}
          visible={baseModalVisible}
          onRequestClose={() => {
            setBaseModalVisible(false);
            setChangeNameModalVisible(false);
            setMemberModalVisible(false);
          }}
        >
          <View
            style={[
              styles.modalHeader,
              {
                height: top,
                borderBottomColor: Colors.grey,
                borderBottomWidth: 1,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setBaseModalVisible(false);
                setChangeNameModalVisible(false);
                setMemberModalVisible(false);
              }}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            ></View>
          </View>
          <View style={styles.modalBody}>
            {changeNameModalVisible && (
              <ChangeNameModal
                changeNameModalVisible={changeNameModalVisible}
                setChangeNameModalVisible={setChangeNameModalVisible}
                groupName={groupName}
                setGroupName={setGroupName}
                MemberData={MemberData}
              />
            )}
            {memberModalVisible && (
              <MemberModal
                memberModalVisible={memberModalVisible}
                setMemberModalVisible={setMemberModalVisible}
                memberData={MemberData}
              />
            )}
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: Colors.light,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  modalBody: {
    flex: 1,
  },
});

export default ChildModal;
