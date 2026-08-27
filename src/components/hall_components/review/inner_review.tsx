import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import StarRating from "@/components/hall_components/review/star_rating";
import { launchImageLibrary } from "react-native-image-picker";
import { Entypo } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import axiosInstance from "@/hooks/axiosInstance";
import { showToast } from "@/utils/toast";
import { useTheme } from "@/context/theme_context";
import { useHallInfo } from "@/context/hall_info_context";

const Inner_Zaal_Review = () => {
  const { colors: Colors } = useTheme();
  const [rating, setRating] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [text, setText] = useState<string>("");
  const sport_hall_id = useLocalSearchParams().zaalId as string;

  const { getSpecificHall } = useHallInfo();
  const zaal_data = getSpecificHall(sport_hall_id);
  const handle_submit = async () => {
    try {
      const response = await axiosInstance.post(
        `/auth/zaal-review/${sport_hall_id}`,
        {
          message: text,
          user_given_stars: rating,
          image: imageUrl.length > 0 ? imageUrl : null,
        },
      );
      if (response.status === 200 && response.data.success) {
        showToast({
          title: "Successfully Submitted",
          description: "Review submitted successfully",
          alertType: "success",
        });
        setText("");
        setRating(0);
        setImageUrl([]);
      } else if (!response.data.success && response.status === 400) {
        showToast({
          title: "Error on submitting",
          description: "Error submitting review",
          alertType: "error",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: Colors.white, flex: 1 }}
      edges={["left", "right", "bottom"]}
    >
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <View
          style={{
            width: "90%",
            minHeight: "40%",
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 20,
            gap: 20,
          }}
        >
          <Image
            source={{ uri: zaal_data?.hall_details.hall_imageURLs?.[0] }}
            style={{ width: 300, height: 200, borderRadius: 10 }}
          />
          <View
            style={{
              width: "100%",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ color: Colors.dark, fontWeight: 700, fontSize: 20 }}>
              {zaal_data?.hall_details.hall_name ?? "Name"}
            </Text>
            <StarRating
              rating={rating}
              onChange={setRating}
              editable={true}
              starSize={30}
            />
          </View>
        </View>
        <View
          style={{
            width: "90%",
            height: "80%",
            marginHorizontal: 20,
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 10 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: Colors.littleDarkGrey,
                borderRadius: 10,
                padding: 10,
                height: "40%",
              }}
            >
              <TextInput
                placeholder="What did you like or dislike ?"
                placeholderTextColor={Colors.darkGrey}
                value={text}
                onChangeText={(text) => setText(text)}
                multiline
              />
            </View>

            <TouchableOpacity
              style={{
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: Colors.primary,
                height: "40%",
                borderRadius: 10,
                padding: 10,
                backgroundColor: Colors.lightBlue,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                launchImageLibrary({ mediaType: "mixed" }, (response) => {
                  if (imageUrl.length == 10) {
                    showToast({
                      title: "Warning",
                      description: "Only Upload 10 Images",
          alertType: "warn",
                    });
                    return;
                  }
                  if (response.assets && response.assets[0].uri) {
                    setImageUrl((asset) => {
                      if (response.assets && response.assets[0].uri) {
                        return [...asset, response.assets[0].uri];
                      }
                      return asset;
                    });
                  } else if (response.didCancel) {
                    console.log("user canceled");
                  } else {
                    console.warn("invalid response", response.errorCode);
                  }
                });
              }}
            >
              <Entypo name="camera" size={24} color={Colors.primary} />
              <Text style={{ color: Colors.primary }}>
                Add a photo or video
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity
              onPress={() => handle_submit()}
              style={{
                backgroundColor: Colors.primary,
                padding: 10,
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: Colors.white }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Inner_Zaal_Review;
