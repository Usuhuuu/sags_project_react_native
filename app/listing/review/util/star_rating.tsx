import Colors from "@/constants/Colors";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";

type StarRatingProps = {
  rating: number;
  onChange?: (newRating: number) => void;
  editable?: boolean;
  starSize: number;
};
const StarRating = ({
  rating,
  onChange,
  editable = false,
  starSize,
}: StarRatingProps) => {
  const handlePress = (star: number) => {
    if (!editable) return;
    onChange?.(star);
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        let starElement;

        if (rating >= star) {
          starElement = (
            <Entypo
              name="star"
              size={starSize}
              color="gold"
              style={{ marginHorizontal: 2 }}
            />
          );
        } else if (rating + 1 > star && rating % 1 !== 0) {
          starElement = (
            <FontAwesome
              name="star-half-full"
              size={starSize}
              color="gold"
              style={{ marginHorizontal: 2 }}
            />
          );
        } else {
          starElement = (
            <Entypo
              name="star"
              size={starSize}
              color={Colors.littleDarkGrey}
              style={{ marginHorizontal: 2 }}
            />
          );
        }

        return onChange ? (
          <TouchableOpacity key={star} onPress={() => handlePress(star)}>
            {starElement}
          </TouchableOpacity>
        ) : (
          <View key={star}>{starElement}</View>
        );
      })}
    </View>
  );
};

export default StarRating;
