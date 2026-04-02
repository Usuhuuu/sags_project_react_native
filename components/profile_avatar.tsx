import { useTheme } from "@/src/context/themeContext";
import React from "react";
import { View, Image } from "react-native";
import { SvgUri } from "react-native-svg";

interface ProfileAvatarProp {
  imageUrl: string | null | undefined;
  width: number;
  userName: string | undefined;
}

const ProfileAvatar = ({ imageUrl, width, userName }: ProfileAvatarProp) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.dark,
        width: width,
        height: width,
        borderRadius: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        overflow: "hidden",
      }}
    >
      {imageUrl !== null ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <SvgUri
          uri={`https://api.dicebear.com/9.x/micah/svg?seed=${userName}&size=128`}
          width="100%"
          height="100%"
        />
      )}
    </View>
  );
};

export default ProfileAvatar;
