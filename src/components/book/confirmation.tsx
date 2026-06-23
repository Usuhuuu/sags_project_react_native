import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { SetStateAction } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

interface Confirm_Modal_Props {
  confirmModal: boolean;
  setConfirmModal: React.Dispatch<SetStateAction<boolean>>;
  confirmationDetails: {
    label: string;
    value?: string | number | undefined;
    icon: React.JSX.Element;
    resolve?: (index: number) => string | number | undefined;
  }[];
  addToCalendar: () => void;
  hasScheduled: boolean;
}

const Confirm_Modal = ({
  confirmModal,
  setConfirmModal,
  confirmationDetails,
  addToCalendar,
  hasScheduled,
}: Confirm_Modal_Props) => {
  const { colors, theme } = useTheme();
  return (
    <Modal visible={confirmModal} transparent animationType="fade">
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: colors.shadowColor,
        }}
      >
        <View
          style={{
            width: "80%",
            height: "auto",
            backgroundColor: colors.backgroundColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
          }}
        >
          <View style={{ alignItems: "flex-end", margin: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setConfirmModal(!confirmModal);
                router.replace("/");
              }}
            >
              <FontAwesome5
                name="times-circle"
                size={24}
                color={colors.themeColorTextPure}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.backgroundColor,
              padding: 20,
            }}
          >
            <View
              style={{
                width: 150,
                height: 150,
                shadowColor: colors.green,
                shadowOpacity: 0.6,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
                elevation: 12,
              }}
            >
              <LottieView
                source={require("@/assets/images/book/success.json")}
                autoPlay
                loop={false}
                style={{ width: 150, height: 150 }}
              />
            </View>
            <AppText style={{ fontSize: 28 }}>Booking Confirmed!</AppText>
          </View>

          <View
            style={{
              backgroundColor: colors.containerColor,
              padding: 20,
              borderRadius: 10,
              margin: 10,
            }}
          >
            {confirmationDetails.map((item, index: number) => {
              const value = item.value ?? item.resolve?.(index);

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    marginBottom: 10,
                    width: "100%",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      width: "50%",
                      gap: 5,
                    }}
                  >
                    {item.icon}
                    <AppText>{item.label}</AppText>
                  </View>

                  <View style={{ flex: 1, width: "50%" }}>
                    <AppText style={{ flexShrink: 1 }}>{value}</AppText>
                  </View>
                </View>
              );
            })}
          </View>
          <View
            style={{
              backgroundColor: colors.backgroundColor,
              width: "100%",
              padding: 20,
            }}
          >
            <View style={{ width: "100%", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.green,
                  padding: 10,
                  borderRadius: 10,
                  width: "90%",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                }}
                onPress={() => {
                  console.log("PISDa");
                  addToCalendar();
                }}
              >
                <FontAwesome
                  name="calendar"
                  size={24}
                  color={
                    theme === "light" ? colors.white : colors.themeColorTextPure
                  }
                />
                <AppText
                  style={{
                    textAlign: "center",
                    color:
                      theme === "light"
                        ? colors.white
                        : colors.themeColorTextPure,
                  }}
                >
                  Add To Calendar
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 10,
                  borderRadius: 10,
                  width: "90%",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                }}
                onPress={() => {
                  router.push("/order");
                  hasScheduled && setConfirmModal(!confirmModal);
                }}
              >
                <FontAwesome6
                  name="ticket"
                  size={24}
                  color={
                    theme === "light" ? colors.white : colors.themeColorTextPure
                  }
                />
                <AppText
                  style={{
                    textAlign: "center",
                    color:
                      theme === "light"
                        ? colors.white
                        : colors.themeColorTextPure,
                  }}
                >
                  View My Bookings
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default Confirm_Modal;
