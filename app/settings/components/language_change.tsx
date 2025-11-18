import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { SetStateAction } from "react";
import { useTheme } from "@/app/(modals)/context/themeContext";

interface Change_Language_Modal_Props {
  languageModal: boolean;
  setLanguageModals: React.Dispatch<SetStateAction<boolean>>;
  changeLanguage: (lang: string) => void;
  handleLng: (lang: string) => void;
}

const Change_Language_Modal = ({
  languageModal,
  setLanguageModals,
  changeLanguage,
  handleLng,
}: Change_Language_Modal_Props) => {
  const { colors: Colors, theme } = useTheme();
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      padding: 24,
      borderRadius: 8,
      width: "80%",
      alignItems: "center",
      backgroundColor: theme === "dark" ? Colors.containerColor : Colors.white,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: Colors.themeColorTextPure,
    },
    modelText: {
      color: Colors.themeColorTextPure,
    },
  });

  return (
    <Modal
      visible={languageModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setLanguageModals(false)}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor:
              theme === "dark" ? Colors.backgroundColor : Colors.shadowColor,
          },
        ]}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <TouchableOpacity
            style={styles.modalContent}
            onPress={() => {
              changeLanguage("en");
              setLanguageModals(false);
            }}
          >
            <Text style={styles.modelText}>🇺🇸 English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalContent}
            onPress={() => {
              changeLanguage("mn");
              setLanguageModals(false);
            }}
          >
            <Text style={styles.modelText}>🇲🇳 Монгол хэл</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalContent}
            onPress={() => {
              handleLng("kr");
            }}
          >
            <Text style={styles.modelText}>🇰🇷 한국어</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              width: "40%",
              borderRadius: 10,
              padding: 10,
              alignItems: "center",
            }}
            onPress={() => {
              setLanguageModals(false);
            }}
          >
            <Text style={[styles.modelText, { color: Colors.white }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Change_Language_Modal;
