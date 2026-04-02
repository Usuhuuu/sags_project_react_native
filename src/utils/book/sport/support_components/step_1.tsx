import {
  EsportBookingData,
  SportBookingData,
} from "@/src/context/store/bookStore";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import React, { SetStateAction } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { format, isValid } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Step_One_Props {
  bookingDetails: SportBookingData | null;
  wholeDay: boolean;
  selectedTimeSlots: string[][];
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
}

const Step_One = ({
  bookingDetails,
  wholeDay,
  selectedTimeSlots,
  steps,
  setSteps,
}: Step_One_Props) => {
  const { colors } = useTheme();
  const updateSessions = {
    booking_summary: [
      {
        label: "Sport Hall",
        value: bookingDetails?.name,
      },
      { label: "Location", value: bookingDetails?.location.smart_location },
    ],
    booking_summary_second: [
      {
        label: "Date",
        value: bookingDetails?.date,
      },
      {
        label: "Time",
        value: bookingDetails?.selectedTimeSlots,
      },
    ],
  };
  const renderValue = (value: any) => {
    const formatDate = (v: any) => {
      const d = new Date(v);
      console.log(d);
      return isValid(d) ? format(d, "EEE, dd MMMM") : String(v);
    };

    if (Array.isArray(value)) {
      const flatValues = value.flat();
      return flatValues.map(formatDate).join(", ");
    } else {
      return formatDate(value);
    }
  };
  return (
    <View
      style={{
        backgroundColor: colors.backgroundColor,
        flex: 1,
        gap: 20,
        width: "100%",
      }}
    >
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          paddingHorizontal: 15,
        }}
      >
        <AppText
          style={{
            fontWeight: 800,
            fontSize: 24,
          }}
        >
          Booking Summary
        </AppText>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          gap: 20,
          width: "100%",
        }}
      >
        <View
          style={{
            backgroundColor: colors.containerColor,
            padding: 15,
            width: "90%",
            height: "100%",
            borderRadius: 10,
            shadowColor: colors.shadowColor,
            shadowOpacity: 1,
            shadowOffset: { height: 0, width: 0 },
          }}
        >
          <View
            style={{
              height: "50%",
              width: "100%",
              borderBottomWidth: 1,
              borderBottomColor: colors.darkGrey,
            }}
          >
            <View
              style={{ flexDirection: "row", height: "80%", width: "100%" }}
            >
              <Image
                source={{ uri: bookingDetails?.imageUrls?.[0] ?? "" }}
                style={{ width: "40%", height: "90%", borderRadius: 10 }}
              />
              <View style={{ height: "90%" }}>
                {updateSessions.booking_summary.map((item) => (
                  <View
                    style={{
                      flex: 1,
                      marginHorizontal: 10,
                    }}
                    key={Math.random()}
                  >
                    {item.label !== "Location" ? (
                      <AppText style={{ color: colors.darkGrey, fontSize: 16 }}>
                        {item.label}
                      </AppText>
                    ) : null}
                    {item.label === "Location" ? (
                      <AppText
                        style={{
                          width: "90%",
                          color: colors.darkGrey,
                          fontWeight: 600,
                        }}
                      >
                        {item.value}
                      </AppText>
                    ) : (
                      <AppText
                        style={{
                          width: "65%",
                          fontWeight: 900,
                          fontSize: 20,
                        }}
                      >
                        {item.value}
                      </AppText>
                    )}
                  </View>
                ))}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                height: "10%",
                paddingHorizontal: 10,
              }}
            >
              {!wholeDay && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 5,
                    }}
                  >
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <MaterialCommunityIcons
                        name="clock-time-nine-outline"
                        size={24}
                        color={colors.darkGrey}
                      />
                      <AppText
                        style={{
                          fontSize: 18,
                          fontWeight: 300,
                          color: colors.darkGrey,
                        }}
                      >
                        1 Hour
                      </AppText>
                    </View>
                  </View>
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 300,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    ₮{bookingDetails?.price.oneHour}
                  </AppText>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              flex: 1,
              borderBottomColor: colors.darkGrey,
              borderBottomWidth: 1,
            }}
          >
            <View
              style={{
                paddingVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <AppText
                style={{
                  fontSize: 18,
                  fontWeight: 300,
                  color: colors.darkGrey,
                }}
              >
                Date
              </AppText>
              <AppText style={{ fontSize: 18, fontWeight: 300 }}>
                {bookingDetails?.date
                  ? format(new Date(bookingDetails.date), "EEE, dd LLLL")
                  : ""}
              </AppText>
            </View>
            <View
              style={{
                gap: 5,
              }}
            >
              {wholeDay ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 20,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 300,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    Time
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 300,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    {bookingDetails?.workTime}
                  </AppText>
                </View>
              ) : (
                <>
                  {selectedTimeSlots.map((group, index) => {
                    const startTime = group[0].split("~")[0];
                    const endTime = group[group.length - 1].split("~")[1];
                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",

                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 10,
                        }}
                      >
                        <AppText
                          style={{
                            fontSize: 18,
                            fontWeight: 300,
                            color: colors.darkGrey,
                          }}
                        >
                          Time {index + 1}
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
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            <AppText style={{ color: colors.darkGrey, fontSize: 26 }}>
              TOTAL
            </AppText>
            <AppText
              style={{
                color: colors.themeColorTextPure,
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              ₮
              {wholeDay
                ? bookingDetails?.price?.wholeDay
                : (selectedTimeSlots.length ?? 0) *
                  Number(bookingDetails?.price.oneHour)}
            </AppText>
          </View>
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
    </View>
  );
};

export default Step_One;
