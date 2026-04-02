import AppText from "@/constants/appTextDefault";
import React from "react";
import { View, TouchableOpacity, Modal } from "react-native";

interface FriendReqModalProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const FriendReqModal: React.FC<FriendReqModalProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  return (
    <Modal
      visible={modalVisible}
      presentationStyle="formSheet"
      animationType="slide"
    >
      <View>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <AppText>close</AppText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FriendReqModal;
