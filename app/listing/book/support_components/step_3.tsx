import { SportBookingData } from "@/app/(modals)/context/store/bookStore";
import { useTheme } from "@/app/(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import React, { SetStateAction } from "react";
import { View, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

interface Step_Three_Props {
  bookingDetails: SportBookingData | null;
  wholeDay: boolean;
  selectedTimeSlots: string[][];
  steps: number;
  setSteps: React.Dispatch<SetStateAction<number>>;
  wholeDayPeople: number;
  playersNeeded: { [key: number]: number };
  paymentPerPeopleArray: number[];
  totalBookerPaymentArray: number[];
  handleOrder: () => void;
}

const Step_Three = ({
  bookingDetails,
  wholeDay,
  selectedTimeSlots,
  steps,
  setSteps,
  wholeDayPeople,
  totalBookerPaymentArray,
  paymentPerPeopleArray,
  handleOrder,
  playersNeeded,
}: Step_Three_Props) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.backgroundColor,
        flex: 1,
        alignItems: "center",
        gap: 20,
      }}
    >
      <View
        style={{
          width: "90%",
          gap: 10,
          backgroundColor: colors.containerColor,
          padding: 15,
          borderRadius: 10,
          shadowColor: colors.shadowColor,
          shadowOpacity: 1,
          shadowOffset: { height: 0, width: 0 },
        }}
      >
        <View>
          <AppText
            style={{
              fontSize: 24,
              color: colors.themeColorTextPure,
            }}
          >
            Booking Confirmation
          </AppText>
        </View>

        <View
          style={{
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              padding: 20,
              borderRadius: 5,
              justifyContent: "space-between",
              borderColor: colors.darkGrey,
            }}
          >
            <AppText
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: colors.themeColorTextPure,
              }}
            >
              {bookingDetails?.name}
            </AppText>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              padding: 20,
              borderRadius: 5,
              justifyContent: "space-between",
              borderColor: colors.darkGrey,
            }}
          >
            <AppText
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: colors.darkGrey,
              }}
            >
              Date
            </AppText>
            <AppText
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: colors.themeColorTextPure,
              }}
            >
              {bookingDetails?.date
                ? format(new Date(bookingDetails.date), "EEE, dd LLLL")
                : ""}
            </AppText>
          </View>
        </View>
        <AppText style={{ fontSize: 24, color: colors.themeColorTextPure }}>
          Times & Player Needed
        </AppText>
        <View style={{ gap: 10 }}>
          {wholeDay ? (
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 5,
                borderWidth: 1,
                borderColor: colors.darkGrey,
                borderRadius: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 20,
                  borderBottomWidth: 1,
                  alignItems: "center",
                  borderBottomColor: colors.darkGrey,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="clock-time-nine-outline"
                    size={24}
                    color={colors.themeColorTextPure}
                  />
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    Whole Day
                  </AppText>
                </View>
                <AppText
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: colors.themeColorTextPure,
                  }}
                >
                  ₮{bookingDetails?.price.wholeDay}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 20,
                  borderBottomWidth: 1,
                  alignItems: "center",
                  borderBottomColor: colors.themeColorTextPure,
                }}
              >
                <AppText
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: colors.darkGrey,
                  }}
                >
                  Peoples
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    {wholeDayPeople}
                  </AppText>
                  <MaterialIcons
                    name="people-alt"
                    size={24}
                    color={colors.themeColorTextPure}
                  />
                </View>
              </View>
              <View
                style={{
                  marginTop: 10,
                  padding: 10,
                  gap: 5,
                }}
              >
                <AppText
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center",
                    color: colors.themeColorTextPure,
                  }}
                >
                  Booker's Total: ₮
                  {wholeDayPeople <= 0
                    ? bookingDetails?.price.wholeDay
                    : Number(bookingDetails?.price.wholeDay) / wholeDayPeople}
                </AppText>
              </View>
            </View>
          ) : (
            <>
              <View style={{ gap: 10 }}>
                {selectedTimeSlots.map((group, index) => {
                  const startTime = group[0].split("~")[0];
                  const endTime = group[group.length - 1].split("~")[1];
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 10,
                        gap: 5,
                        borderWidth: 1,
                        borderColor: colors.themeColorTextPure,
                        borderRadius: 5,
                      }}
                    >
                      <AppText
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          color: colors.darkGrey,
                        }}
                      >
                        {startTime} – {endTime}
                      </AppText>
                      <AppText
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          color: colors.themeColorTextPure,
                        }}
                      >
                        {playersNeeded[index] || 0} Person
                      </AppText>
                    </View>
                  );
                })}
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 5,
                  borderWidth: 1,
                  borderColor: colors.themeColorTextPure,
                  borderRadius: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 20,
                    borderBottomWidth: 1,
                    alignItems: "center",
                    borderBottomColor: colors.themeColorTextPure,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="clock-time-nine-outline"
                      size={24}
                      color={colors.darkGrey}
                    />
                    <AppText
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: colors.darkGrey,
                      }}
                    >
                      1 Hour
                    </AppText>
                  </View>
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: colors.themeColorTextPure,
                    }}
                  >
                    ₮{bookingDetails?.price.oneHour}
                  </AppText>
                </View>
                <View>
                  {(() => {
                    return (
                      <>
                        {selectedTimeSlots.map((group, index) => {
                          const startTime = group[0].split("~")[0];
                          const endTime = group[group.length - 1].split("~")[1];

                          const getHour = (time: string) => {
                            const [hourStr] = time.split(":");
                            return parseInt(hourStr, 10);
                          };

                          const startHour = getHour(startTime);
                          const endHour = getHour(endTime);
                          const durationHours = endHour - startHour;

                          const costPerHour = 1000;
                          const totalCost = durationHours * costPerHour;

                          const totalPeople = (playersNeeded[index] || 0) + 1;

                          const paymentPerPeople =
                            totalPeople > 0 ? totalCost / totalPeople : 0;

                          // Add to booker’s total
                          paymentPerPeopleArray.push(paymentPerPeople);
                          totalBookerPaymentArray.push(paymentPerPeople);

                          return (
                            <View
                              key={index}
                              style={{
                                flexDirection: "column",
                                justifyContent: "space-evenly",
                                padding: 10,
                                gap: 5,
                              }}
                            >
                              <AppText
                                style={{
                                  fontSize: 16,
                                  fontWeight: 500,
                                  color: colors.darkGrey,
                                }}
                              >
                                Session {index + 1}:
                              </AppText>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-around",
                                }}
                              >
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: colors.themeColorTextPure,
                                  }}
                                >
                                  {durationHours} Hours
                                </AppText>
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: colors.themeColorTextPure,
                                  }}
                                >
                                  {totalPeople} Players
                                </AppText>
                                <AppText
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: colors.themeColorTextPure,
                                  }}
                                >
                                  ₮{paymentPerPeople.toFixed(2)} Per Person
                                </AppText>
                              </View>
                            </View>
                          );
                        })}

                        <View
                          style={{
                            marginTop: 10,
                            padding: 10,
                            borderTopWidth: 1,
                            borderColor: colors.littleDark,
                          }}
                        >
                          <AppText
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              textAlign: "center",
                              color: colors.themeColorTextPure,
                            }}
                          >
                            Booker's Total: ₮
                            {totalBookerPaymentArray
                              .reduce((sum, v) => sum + v, 0)
                              .toFixed(2)}
                          </AppText>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            </>
          )}
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
          style={[
            {
              backgroundColor: colors.primary,
              width: "45%",
              alignItems: "center",
              padding: 10,
              borderWidth: 1,
              gap: 10,
              borderColor: colors.darkGrey,
              borderRadius: 5,
            },
          ]}
          onPress={() => {
            handleOrder();
          }}
        >
          <AppText style={{ color: colors.themeColorTextPure }}>Book</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Step_Three;
