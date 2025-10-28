import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";

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
          <Text>close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FriendReqModal;
