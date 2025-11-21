import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { SetStateAction } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { usePathname } from "expo-router";

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
}

const Confirm_Modal = ({
  confirmModal,
  setConfirmModal,
  confirmationDetails,
  addToCalendar,
}: Confirm_Modal_Props) => {
  const { colors } = useTheme();
  const router = useRouter();
  console.log(usePathname());
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
            <Ionicons
              name="checkmark-circle-outline"
              size={100}
              color={colors.green}
              style={{
                textShadowColor: colors.green,
                textShadowRadius: 10,
                textShadowOffset: { width: 0, height: 0 },
              }}
            />
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
                  color={colors.themeColorTextPure}
                />
                <AppText style={{ textAlign: "center" }}>
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
                onPress={() => router.navigate("/order")}
              >
                <FontAwesome6
                  name="ticket"
                  size={24}
                  color={colors.themeColorTextPure}
                />
                <AppText style={{ textAlign: "center" }}>
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
