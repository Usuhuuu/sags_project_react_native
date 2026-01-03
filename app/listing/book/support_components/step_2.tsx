import { SportBookingData } from "@/app/(modals)/context/store/bookStore";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import React, { SetStateAction } from "react";
import { ScrollView, TouchableOpacity, View, ViewStyle } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

interface Step_Two_Props {
  wholeDay: boolean;
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
  bookingDetails: SportBookingData | null;
  selectedTimeSlots: string[][];
  wholeDayPeople: number;
  setWholeDayPeople: React.Dispatch<SetStateAction<number>>;
  playersNeeded: { [key: number]: number };
  setPlayersNeeded: React.Dispatch<SetStateAction<{ [key: number]: number }>>;
}

const Step_Two = ({
  selectedTimeSlots,
  setSteps,
  steps,
  wholeDay,
  bookingDetails,
  wholeDayPeople,
  setWholeDayPeople,
  playersNeeded,
  setPlayersNeeded,
}: Step_Two_Props) => {
  const { colors, theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.backgroundColor,
        flex: 1,
        alignItems: "center",
        gap: 20,
        marginTop: 20,
      }}
    >
      <View
        style={{
          width: "90%",
          gap: 10,
          padding: 5,
          shadowColor: colors.shadowColor,
          shadowOpacity: 1,
          shadowOffset: { height: 0, width: 0 },
        }}
      >
        {wholeDay ? (
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 10,
              gap: 5,
              borderWidth: 1,
              borderColor: colors.littleDark,
              borderRadius: 5,
            }}
          >
            <AppText
              style={{
                fontSize: 18,
                fontWeight: 300,
                color: colors.themeColorTextPure,
              }}
            >
              {bookingDetails?.workTime}
            </AppText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                padding: 5,
                borderColor: colors.littleDark,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <MaterialIcons
                  name="people-alt"
                  size={24}
                  color={colors.themeColorTextPure}
                />
                <AppText style={{ color: colors.themeColorTextPure }}>
                  Peoples Needed
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (wholeDayPeople < 20) {
                      setWholeDayPeople(wholeDayPeople + 1);
                    } else {
                      Notifier.showNotification({
                        title: "Oops",
                        description: "Needed people must be belov 20",
                        Component: NotifierComponents.Alert,
                        componentProps: { alertType: "warn" },
                      });
                    }
                  }}
                >
                  <AntDesign
                    name="plus"
                    size={20}
                    color={colors.themeColorTextPure}
                  />
                </TouchableOpacity>
                <AppText style={{ fontSize: 20 }}>{wholeDayPeople}</AppText>
                <TouchableOpacity
                  onPress={() => {
                    if (wholeDayPeople > 0)
                      setWholeDayPeople(wholeDayPeople - 1);
                  }}
                >
                  <AntDesign
                    name="minus"
                    size={20}
                    color={colors.themeColorTextPure}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            {selectedTimeSlots.map((group, index) => {
              const startTime = group[0].split("~")[0];
              const endTime = group[group.length - 1].split("~")[1];
              return (
                <ScrollView
                  key={index}
                  style={{
                    flexDirection: "column",
                    padding: 15,
                    borderRadius: 10,
                    backgroundColor: colors.containerColor,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    Session {index + 1}
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 300,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    {startTime} – {endTime}
                  </AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderWidth: 1,
                      padding: 5,
                      borderColor: colors.littleDark,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <MaterialIcons
                        name="people-alt"
                        size={24}
                        color={colors.themeColorTextPure}
                      />
                      <AppText style={{ color: colors.themeColorTextPure }}>
                        Peoples Needed
                      </AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        maxWidth: "20%",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            playersNeeded[index] < 20 ||
                            (playersNeeded[index] ?? 0) === 0
                          ) {
                            setPlayersNeeded((prev) => ({
                              ...prev,
                              [index]: (prev[index] || 0) + 1,
                            }));
                          } else {
                            Notifier.showNotification({
                              title: "Oops",
                              description: "Needed people must be belov 20",
                              Component: NotifierComponents.Alert,
                              componentProps: { alertType: "warn" },
                            });
                          }
                        }}
                        style={{
                          maxWidth: "30%",
                        }}
                      >
                        <AntDesign
                          name="plus"
                          size={20}
                          color={colors.themeColorTextPure}
                        />
                      </TouchableOpacity>
                      <AppText
                        style={{
                          fontSize: 20,
                          color: colors.themeColorTextPure,
                          maxWidth: "40%",
                        }}
                      >
                        {playersNeeded[index] ?? 0}{" "}
                      </AppText>
                      <TouchableOpacity
                        onPress={() => {
                          setPlayersNeeded((prev) => ({
                            ...prev,
                            [index]: Math.max((prev[index] || 0) - 1, 0),
                          }));
                        }}
                      >
                        <AntDesign
                          name="minus"
                          size={20}
                          color={colors.themeColorTextPure}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              );
            })}
          </>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          justifyContent: "center",
          gap: 20,
          alignItems: "center",
          flex: 1,
        }}
      >
        <TouchableOpacity
          style={{
            width: "45%",
            alignItems: "center",
            padding: 10,
            borderWidth: 1,
            gap: 10,
            borderColor: colors.darkGrey,
            borderRadius: 5,
          }}
          onPress={() => setSteps(steps - 1)}
        >
          <AppText style={{ color: colors.themeColorTextPure }}>
            Preview
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            width: "45%",
            alignItems: "center",
            padding: 10,
            borderWidth: 1,
            gap: 10,
            borderColor: colors.darkGrey,
            borderRadius: 5,
          }}
          onPress={() => setSteps(steps + 1)}
        >
          <AppText style={{ color: colors.white }}>Next</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step_Two;
