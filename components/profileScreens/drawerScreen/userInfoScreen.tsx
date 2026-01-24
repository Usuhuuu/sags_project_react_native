import { useAuth } from "@/app/(modals)/context/authContext";
import axiosInstance from "@/hooks/axiosInstance";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { TextInput } from "react-native-paper";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useTheme } from "@/app/(modals)/context/themeContext";
import OwnActivaterIndicator from "@/constants/loaderAnimation";
import { useAuthQuery } from "@/hooks/useQuery";

const UserInfoScreen = () => {
  const { colors: Colors } = useTheme();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isitEditable, setIsitEditable] = useState<boolean>(false);
  const { LoginStatus } = useAuth();

  const [formData, setFormData] = useState<any>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    unique_user_ID: "",
  });

  const userInfo: any = t("userInfo", { returnObjects: true });

  const { data, error, isLoading } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"],
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
    }
  );

  useEffect(() => {
    if (data) {
      const parsedData =
        typeof data.profileData == "string"
          ? JSON.parse(data.profileData)
          : data.profileData;
      setUserData(parsedData);
      setFormData(parsedData);
    } else if (error) {
      console.log("Error fetching role and profile data:", error);
    }
    // Set loading state based on isLoading
    setLoading(isLoading);
    console.log(formData);
  }, [data, error, isLoading]);

  if (loading) {
    return <OwnActivaterIndicator />;
  }

  interface UserEditInput {
    label: string;
    value: string;
    placeholder: string;
  }

  const userEditDetails: { inputs: UserEditInput[] } = {
    inputs: [
      {
        label: userInfo.email,
        value: userData.email,
        placeholder: "Email",
      },
      {
        label: userInfo.firstName,
        value: userData.firstName,
        placeholder: "First Name",
      },
      {
        label: userInfo.lastName,
        value: userData.lastName,
        placeholder: "Last Name",
      },
      {
        label: userInfo.phoneNumber,
        value: userData.phoneNumber,
        placeholder: "Phone Number",
      },
      {
        label: userInfo.userName,
        value: userData.unique_user_ID,
        placeholder: "User Name",
      },
    ],
  };
  const handleEdit = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/auth/updateProfile",
        formData
      );
      if (response.status === 200 && response.data.success) {
        Notifier.showNotification({
          title: "Successfully Updated User Profile",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "success" },
        });
      } else if (response.status === 400 && !response.data.success) {
        Notifier.showNotification({
          title: "Successfully Updated User Profile",
          Component: NotifierComponents.Alert,
          componentProps: { alertType: "error" },
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditProfile = () => {
    if (isitEditable) {
      Alert.alert("Profile Updating", "Are you sure ?", [
        {
          text: t("yes"),
          onPress: () => {
            handleSubmit();
          },
        },
        {
          text: t("cancel"),
          onPress: () => setIsitEditable(!isitEditable),
        },
      ]);
    }
  };
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: Colors.light,
      }}
    >
      <View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            source={{
              uri: "https://via.placeholder.com/150",
            }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: Colors.darkGrey,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setIsitEditable(!isitEditable);
              if (isitEditable) {
                Alert.alert("Profile Updating", "Are you sure ?", [
                  {
                    text: t("yes"),
                    onPress: () => {
                      handleSubmit();
                    },
                  },
                  {
                    text: t("cancel"),
                    onPress: () => setIsitEditable(!isitEditable),
                  },
                ]);
              }
            }}
            style={{
              padding: 15,
              borderWidth: 2,
              borderRadius: 10,
              borderColor: Colors.darkGrey,
              backgroundColor: isitEditable ? Colors.darkGrey : "white",
            }}
          >
            <Text
              style={{
                color: isitEditable ? Colors.light : Colors.darkGrey,
                fontWeight: "bold",
              }}
            >
              {isitEditable ? userInfo.saveProfile : userInfo.editProfile}
            </Text>
          </TouchableOpacity>
        </View>
        {userEditDetails.inputs.map(({ label, value, placeholder }, index) => (
          <View key={index} style={styles.userInfoContainer}>
            <TextInput
              value={formData[value] || value}
              placeholderTextColor={Colors.darkGrey}
              label={placeholder}
              editable={isitEditable}
              onChangeText={(text) => handleEdit(label, text)}
              mode="outlined"
              theme={{
                colors: {
                  primary: Colors.darkGrey,
                },
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    flexDirection: "column",
    padding: 20,
    gap: 10,
  },
});

export default UserInfoScreen;
