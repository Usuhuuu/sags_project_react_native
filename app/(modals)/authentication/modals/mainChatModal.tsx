import Colors from "@/constants/Colors";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  FlatList,
  Modal,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ChildModal from "./childModal";
import { Avatar } from "react-native-paper";
import { Socket } from "socket.io-client";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import {
  ActiveUserType,
  GroupChat,
  Message,
  MessageMapState,
} from "@/interfaces/chatType";

interface MainChatModalProps {
  mainModalShow: boolean;
  setmainModalShow: React.Dispatch<React.SetStateAction<boolean>>;
  isitReady: boolean;
  setChildModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  childModalVisible: boolean;
  message: Map<string, MessageMapState>;
  loadOlderMsj: () => void;
  loading: boolean;
  flatListRef: React.RefObject<FlatList>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (message: string) => void;
  renderChatItem: ({ item }: { item: Message }) => JSX.Element;
  groupMap: { [groupId: string]: GroupChat };
  activeUserData: ActiveUserType[];
  socketRef: React.RefObject<Socket | null>;
  groupID: string;
  currentChatId: React.RefObject<string>;
}

const MainChatModal: React.FC<MainChatModalProps> = ({
  mainModalShow,
  setmainModalShow,
  isitReady,
  setChildModalVisible,
  childModalVisible,
  message,
  loadOlderMsj,
  loading,
  flatListRef,
  newMessage,
  setNewMessage,
  sendMessage,
  renderChatItem,
  groupMap,
  activeUserData,
  groupID,
  currentChatId,
}) => {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [activeUserMember, setActiveUserMember] = React.useState<number>(0);
  const width = Dimensions.get("window").width;
  useEffect(() => {
    setActiveUserMember(activeUserData.length);
  }, [activeUserData]);
  const chatInitLang: any = t("chatRoom", { returnObjects: true });
  const groupChatSettingsLang: any = t("groupChatSettings", {
    returnObjects: true,
  });
  const messageData = message.get(currentChatId.current ?? groupID);
  const groupData = groupMap[currentChatId.current ?? groupID];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={mainModalShow}
      style={{ zIndex: 1 }}
      onRequestClose={() => {
        setmainModalShow(false);
      }}
    >
      {isitReady ? (
        <ActivityIndicator color={Colors.primary} size={"large"} />
      ) : (
        <SafeAreaProvider
          style={{
            backgroundColor: Colors.white,
          }}
        >
          <SafeAreaView>
            <View
              style={{
                height: "100%",
              }}
            >
              <View
                style={{
                  height: "10%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottomColor: Colors.lightGrey,
                  borderBottomWidth: 1,
                  maxWidth: "100%",
                  marginHorizontal: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setmainModalShow(false);
                  }}
                >
                  <Ionicons
                    name="arrow-back-sharp"
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {groupMap?.[0]?.chat_image && (
                    <Avatar.Image
                      source={{ uri: groupMap[0].chat_image }}
                      style={{
                        backgroundColor: Colors.light,
                      }}
                    />
                  )}

                  {groupData ? (
                    groupData.sportHallName &&
                    groupData.date &&
                    groupData.startTime &&
                    groupData.endTime ? (
                      <View style={{ width: "80%" }}>
                        <Text style={{ color: Colors.primary, fontSize: 18 }}>
                          {groupData.sportHallName}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <Text
                            style={{ color: Colors.secondary, fontSize: 14 }}
                          >
                            {format(
                              parseISO(groupData.date).toString(),
                              "MMMM dd"
                            )}
                          </Text>
                          <Text
                            style={{ color: Colors.secondary, fontSize: 14 }}
                          >
                            {groupData.startTime} –{groupData.endTime}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 5 }}>
                          <Text style={{ color: "green" }}>
                            online:
                            {activeUserMember}
                          </Text>
                          <Text style={{ color: Colors.darkGrey }}>
                            members: {groupData.members.length}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={{ width: "70%", marginLeft: 8 }}>
                        <Text
                          style={{
                            fontSize: 17,
                            flexWrap: "wrap",
                            writingDirection: "ltr",
                            fontWeight: "700",
                            color: Colors.primary,
                          }}
                        >
                          {groupData.group_chat_name ?? ""}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 5 }}>
                          <Text style={{ color: "green" }}>
                            online:
                            {activeUserMember}
                          </Text>
                          <Text style={{ color: Colors.darkGrey }}>
                            members: {groupData.members.length}
                          </Text>
                        </View>
                      </View>
                    )
                  ) : (
                    <ActivityIndicator size={24} color={Colors.primary} />
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setChildModalVisible(true);
                  }}
                >
                  <Feather
                    name="more-vertical"
                    size={30}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={messageData?.messages}
                style={[
                  {
                    backgroundColor: Colors.lightGrey,
                  },
                ]}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id.toString()}
                inverted={true}
                onEndReached={loadOlderMsj}
                onEndReachedThreshold={0.2}
                ListFooterComponent={loading ? <ActivityIndicator /> : null}
                ref={flatListRef}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                removeClippedSubviews={true}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={100 / 2 + 10}
              >
                <View style={[styles.inputContainer]}>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        setMenuVisible(!menuVisible);
                      }}
                      style={{
                        backgroundColor: Colors.lightGrey,
                        padding: 7,
                        borderRadius: 20,
                      }}
                    >
                      <AntDesign
                        name="plus"
                        size={24}
                        color={Colors.darkGrey}
                      />
                    </TouchableOpacity>
                    {menuVisible && (
                      <View
                        style={{
                          position: "absolute",
                          backgroundColor: "white",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 4,
                          elevation: 5,
                          top: -80,
                          flex: 1,
                          left: 0,
                          right: 0,
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 5,
                          width: 40,
                          gap: 10,
                          borderRadius: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => console.log("Option 1")}
                        >
                          <Ionicons
                            name="camera"
                            size={24}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => console.log("Option 2")}
                        >
                          <Ionicons
                            name="camera"
                            size={24}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.input}>
                    <TextInput
                      placeholder={chatInitLang.enterMessage}
                      value={newMessage}
                      onChangeText={(newMsj) => setNewMessage(newMsj)}
                      maxLength={2000}
                      style={{ flex: 1 }}
                      placeholderTextColor={Colors.darkGrey}
                      clearTextOnFocus={false}
                      multiline
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => sendMessage(newMessage)}
                  >
                    <Ionicons name="send" size={32} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      )}

      <Modal
        animationType="fade"
        visible={childModalVisible}
        style={{ zIndex: 2 }}
      >
        <SafeAreaProvider style={{ backgroundColor: Colors.white }}>
          <SafeAreaView style={{ height: "100%", width: width }}>
            <View
              style={{
                height: "10%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setChildModalVisible(false);
                }}
              >
                <Ionicons
                  name="arrow-back-sharp"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 24, color: Colors.primary }}>
                {groupChatSettingsLang.groupChatSettings}
              </Text>
            </View>
            <ChildModal MemberData={groupData ? [groupData] : []} />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </Modal>
  );
};
export default MainChatModal;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 7,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightGrey,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 10,
  },
  sendButton: {
    padding: 12,
    borderRadius: 25,
    marginLeft: 8,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },

  msjContainer: {},
  msjInside: {
    flexDirection: "column",
    borderWidth: 1,
    padding: 5,
  },
});
