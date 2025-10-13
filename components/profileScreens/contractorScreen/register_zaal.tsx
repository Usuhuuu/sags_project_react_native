import Colors from "@/constants/Colors";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";
import { TextInput } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import axiosInstance from "@/hooks/axiosInstance";
import { Notifier, NotifierComponents } from "react-native-notifier";

type FormDataTypes = {
  zaal_types: string[];
  zaal_location: Zaal_location;
  zaal_details: Zaal_details;
  base_time_slots: TimeSlot[];
  feature: Zaal_feature;
};
type Zaal_location = {
  latitude: string;
  longitude: string;
  smart_location: string;
};
type TimeSlot = {
  start_time: string;
  end_time: string;
};
type Zaal_feature = {
  changingRoom: boolean;
  shower: boolean;
  lighting: boolean;
  spectatorSeats: boolean;
  parking: boolean;
  freeWifi: boolean;
  scoreboard: boolean;
  speaker: boolean;
  microphone: boolean;
};
type Zaal_details = {
  name: string;
  price: string;
  workTime: string;
  phoneNumber: string;
  address: string;
};

type ZaalType = {
  id: number;
  name: string;
};
type ZaalFeatureItem = {
  id: keyof Zaal_feature;
  name: string;
};
type Zaal_Time_Slot_Type = {
  start_time: string;
  end_time: string;
};
const zaal_type_init: ZaalType[] = [
  { id: 1, name: "Basketball" },
  { id: 2, name: "Volleyball" },
  { id: 3, name: "Football" },
  { id: 4, name: "Badminton" },
  { id: 5, name: "Table Tennis" },
  { id: 6, name: "Tennis" },
  { id: 7, name: "Wrestling" },
  { id: 8, name: "Dance Studio" },
  { id: 9, name: "Gymnastics" },
  { id: 10, name: "Yoga / Pilates" },
  { id: 11, name: "Fitness / Cardio Room" },
  { id: 12, name: "Billiards" },
];

const zaal_feature_init: ZaalFeatureItem[] = [
  { id: "changingRoom", name: "Changing Room" },
  { id: "shower", name: "Shower" },
  { id: "lighting", name: "Lighting" },
  { id: "spectatorSeats", name: "Spectator Seats" },
  { id: "parking", name: "Parking" },
  { id: "freeWifi", name: "Free Wi-Fi" },
  { id: "scoreboard", name: "Scoreboard" },
  { id: "speaker", name: "Speaker" },
  { id: "microphone", name: "Microphone" },
];
const timeSlots: Zaal_Time_Slot_Type[] = [
  { start_time: "9:00", end_time: "10:00" },
  { start_time: "10:00", end_time: "11:00" },
  { start_time: "11:00", end_time: "12:00" },
  { start_time: "12:00", end_time: "13:00" },
  { start_time: "13:00", end_time: "14:00" },
  { start_time: "14:00", end_time: "15:00" },
  { start_time: "15:00", end_time: "16:00" },
  { start_time: "16:00", end_time: "17:00" },
  { start_time: "17:00", end_time: "18:00" },
  { start_time: "18:00", end_time: "19:00" },
  { start_time: "19:00", end_time: "20:00" },
  { start_time: "20:00", end_time: "21:00" },
  { start_time: "21:00", end_time: "22:00" },
  { start_time: "22:00", end_time: "23:00" },
  { start_time: "23:00", end_time: "24:00" },
];

const RegisterZaal: React.FC = () => {
  const [formData, setFormData] = useState<FormDataTypes>({
    zaal_types: [],
    zaal_location: {
      latitude: "",
      longitude: "",
      smart_location: "",
    },
    zaal_details: {
      name: "",
      price: "",
      workTime: "",
      phoneNumber: "",
      address: "",
    },
    base_time_slots: [],
    feature: {
      changingRoom: false,
      shower: false,
      lighting: false,
      spectatorSeats: false,
      parking: false,
      freeWifi: false,
      scoreboard: false,
      speaker: false,
      microphone: false,
    },
  });
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [timeSlotShowAll, settimeSlotShowAll] = useState(false);

  const [imageUrl, setImageUrl] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("/auth/zaalburtgel", {
        formData,
      });
      Notifier.showNotification({
        title: "Successfully Added",
        description: "Successfully added sport hall",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
      if (response.status === 400 && !response.data.success) {
        Notifier.showNotification({
          title: "Failed",
          description: `${response.data.message}`,
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err: any) {
      Notifier.showNotification({
        title: "Failed",
        description: `${err.response.data.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: Colors.white,
        flex: 1,
      }}
    >
      <SafeAreaView
        style={{
          height: "auto",
        }}
      >
        <View style={styles.container}>
          <View
            style={{
              width: "100%",
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Image inputs */}
              <View
                style={{
                  backgroundColor: Colors.white,
                  flexDirection: "row",
                  width: "90%",
                  height: 160,
                  gap: 5,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    launchImageLibrary(
                      {
                        mediaType: "photo",
                        includeBase64: true,
                      },
                      (response) => {
                        if (imageUrl.length === 4) {
                          Notifier.showNotification({
                            title: "Warning",
                            description: "Only Upload 4 images",
                            Component: NotifierComponents.Alert,
                            componentProps: { alertType: "warn" },
                          });
                          return;
                        }
                        if (response.assets && response.assets[0].uri) {
                          setImageUrl((prev) => {
                            if (response.assets && response.assets[0].uri) {
                              return [...prev, response.assets[0].uri];
                            }
                            return prev;
                          });
                        } else if (response.didCancel) {
                          console.log("user canceled");
                        } else {
                          console.warn("invalid response", response.errorCode);
                        }
                      }
                    );
                  }}
                  style={{
                    width: "60%",
                  }}
                >
                  <View
                    style={{
                      height: "90%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderStyle: "dashed",
                      backgroundColor: Colors.lightGrey,
                      borderRadius: 5,
                    }}
                  >
                    <AntDesign name="plus" size={24} color={Colors.darkGrey} />
                    <Text style={{ color: Colors.darkGrey }}>Add Images</Text>
                  </View>
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "40%",
                  }}
                >
                  {imageUrl.map((item, index) => (
                    <View
                      style={{
                        flexDirection: "row",
                        width: "50%",
                        height: "45%",
                      }}
                      key={`${item}-${index}`}
                    >
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: "95%",
                          height: "95%",
                          borderRadius: 5,
                          flexDirection: "row",
                        }}
                      />
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setImageUrl((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <MaterialIcons
                          name="remove-circle-outline"
                          size={24}
                          color={"red"}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={{ width: "100%" }}>
            <Text
              style={[styles.textinputs, { fontSize: 20, fontWeight: 300 }]}
            >
              User Details
            </Text>
            <TextInput
              style={styles.textinputs}
              mode="outlined"
              label="Sport Hall Name"
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                  background: Colors.white,
                  outline: "#C7C7C7",
                },
              }}
              placeholderTextColor={Colors.darkGrey}
              value={formData.zaal_details.name}
              onChangeText={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  zaal_details: {
                    ...prev.zaal_details,
                    name: e,
                  },
                }));
              }}
            />
            <TextInput
              style={styles.textinputs}
              mode="outlined"
              label="Price"
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                  background: Colors.white,
                  outline: "#C7C7C7",
                },
              }}
              placeholderTextColor={Colors.darkGrey}
              value={formData.zaal_details.price}
              onChangeText={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  zaal_details: {
                    ...prev.zaal_details,
                    price: e,
                  },
                }));
              }}
            />
            <TextInput
              style={styles.textinputs}
              mode="outlined"
              label="Work Time"
              placeholderTextColor={Colors.darkGrey}
              value={formData.zaal_details.workTime}
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                  background: Colors.white,
                  outline: "#C7C7C7",
                },
              }}
              onChangeText={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  zaal_details: {
                    ...prev.zaal_details,
                    workTime: e,
                  },
                }))
              }
            />
            <TextInput
              style={styles.textinputs}
              mode="outlined"
              label="Phone Number"
              placeholderTextColor={Colors.darkGrey}
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                  background: Colors.white,
                  outline: "#C7C7C7",
                },
              }}
              value={formData.zaal_details.phoneNumber}
              onChangeText={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  zaal_details: {
                    ...prev.zaal_details,
                    phoneNumber: e,
                  },
                }))
              }
            />
            <TextInput
              style={styles.textinputs}
              mode="outlined"
              label="Address"
              placeholderTextColor={Colors.darkGrey}
              value={formData.zaal_details.address}
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                  background: Colors.white,
                  outline: "#C7C7C7",
                },
              }}
              onChangeText={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  zaal_details: {
                    ...prev.zaal_details,
                    address: e,
                  },
                }))
              }
            />
          </View>
          {/* Select Types*/}
          <View
            style={{
              width: "100%",
            }}
          >
            <View
              style={[
                {
                  padding: 20,
                  width: "auto",
                  justifyContent: "space-between",
                  flexDirection: "row",
                },
              ]}
            >
              <Text style={{ fontSize: 20, fontWeight: 300 }}>
                Select types
              </Text>
              <AntDesign name="caretright" size={24} color={Colors.darkGrey} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
              style={{
                flexDirection: "row",
                paddingHorizontal: 20,
              }}
            >
              {Object.entries(zaal_type_init).map(([key, value], index) => {
                return (
                  <View
                    key={key}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 5,
                      backgroundColor: Colors.white,
                      borderColor: formData.zaal_types.includes(value.name)
                        ? Colors.dark
                        : Colors.darkGrey,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          zaal_types: prev.zaal_types.includes(value.name)
                            ? prev.zaal_types.filter((x) => x !== value.name)
                            : [...prev.zaal_types, value.name],
                        }));
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View style={{ width: 20, height: 20 }}>
                        {formData.zaal_types.includes(value.name) ? (
                          <AntDesign name="check" size={20} color="black" />
                        ) : (
                          <View style={{ width: 20, height: 20 }}></View>
                        )}
                      </View>
                      <Text style={{ color: Colors.darkGrey }}>
                        {value.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          {/* Selected types */}

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              padding: 10,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 300 }}>Feature</Text>
              <TouchableOpacity
                onPress={() => setShowAllFeatures(!showAllFeatures)}
              >
                <Text style={{ color: Colors.dark }}>
                  {showAllFeatures ? (
                    <AntDesign
                      name="caretdown"
                      size={24}
                      color={Colors.darkGrey}
                    />
                  ) : (
                    <AntDesign
                      name="caretup"
                      size={24}
                      color={Colors.darkGrey}
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(showAllFeatures
                ? zaal_feature_init
                : zaal_feature_init.slice(0, 3)
              ).map((value, index) => {
                return (
                  <View
                    key={value.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      margin: 4,
                      borderWidth: 1,
                      borderColor: formData.feature[value.id]
                        ? Colors.dark
                        : Colors.darkGrey,
                      padding: 10,
                      borderRadius: 5,
                      width: "31%",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          feature: {
                            ...prev.feature,
                            [value.id]: !prev.feature[value.id],
                          },
                        }))
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <View style={{ width: 20, height: 20 }}>
                        {formData.feature[value.id] && (
                          <AntDesign name="check" size={20} color="green" />
                        )}
                      </View>
                      <Text style={{ marginRight: 8, color: Colors.darkGrey }}>
                        {value.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
          {/* Time Slot */}
          <View
            style={{
              width: "90%",
              marginHorizontal: 10,
            }}
          >
            <View
              style={{ justifyContent: "space-between", flexDirection: "row" }}
            >
              <Text>Time Slots</Text>
              <TouchableOpacity
                onPress={() => settimeSlotShowAll(!timeSlotShowAll)}
              >
                <Text style={{ color: Colors.dark }}>
                  {timeSlotShowAll ? (
                    <AntDesign
                      name="caretdown"
                      size={24}
                      color={Colors.darkGrey}
                    />
                  ) : (
                    <AntDesign
                      name="caretup"
                      size={24}
                      color={Colors.darkGrey}
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {(timeSlotShowAll ? timeSlots : timeSlots.slice(0, 3)).map(
                (item) => {
                  const slotKey = `${item.start_time}-${item.end_time}`;
                  return (
                    <View key={slotKey} style={{ width: "31%" }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          padding: 10,
                          borderWidth: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          borderColor: formData.base_time_slots.some(
                            (slot) =>
                              slot.start_time === item.start_time &&
                              slot.end_time === item.end_time
                          )
                            ? Colors.darkGrey
                            : Colors.grey,
                          borderRadius: 5,
                        }}
                        onPress={() => {
                          setFormData((prev) => {
                            const exists = prev.base_time_slots.some(
                              (slot) =>
                                slot.start_time === item.start_time &&
                                slot.end_time === item.end_time
                            );

                            return {
                              ...prev,
                              base_time_slots: exists
                                ? prev.base_time_slots.filter(
                                    (slot) =>
                                      !(
                                        slot.start_time === item.start_time &&
                                        slot.end_time === item.end_time
                                      )
                                  )
                                : [
                                    ...prev.base_time_slots,
                                    {
                                      start_time: item.start_time,
                                      end_time: item.end_time,
                                    },
                                  ],
                            };
                          });
                        }}
                      >
                        <Text style={{ color: Colors.darkGrey }}>
                          {item.start_time} - {item.end_time}
                        </Text>
                        <View style={{ width: 20, height: 20 }}>
                          {formData.base_time_slots.some(
                            (slot) =>
                              slot.start_time === item.start_time &&
                              slot.end_time === item.end_time
                          ) && (
                            <AntDesign
                              name="check"
                              size={16}
                              color="green"
                              style={{ marginLeft: 5 }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }
              )}
            </View>
          </View>

          <TouchableOpacity
            style={{
              padding: 20,
              backgroundColor: Colors.primary,
              borderRadius: 10,
              marginTop: 10,
            }}
            onPress={() => handleSubmit()}
          >
            <Text style={{ color: Colors.white }}>REGISTER SPORT HALL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  textinputs: {
    width: "90%",
    alignSelf: "center",
    height: 40,
  },
  toggleText: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
});

export default RegisterZaal;
