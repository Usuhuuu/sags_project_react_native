import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import StarRating from "@/components/hall_components/review/star_rating";
import { launchImageLibrary } from "react-native-image-picker";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import axiosInstance from "@/hooks/axiosInstance";
import { showToast } from "@/utils/toast";
import { useTheme } from "@/context/theme_context";
import { useHallInfo } from "@/context/hall_info_context";
import OwnActivaterIndicator from "@/components/ui/loader_indicator";

type ImageType = {
  uri: string;
  type: string;
  name: string;
};

const Inner_Zaal_Review = () => {
  const { colors: Colors } = useTheme();
  const styles = createStyles(Colors);
  const [rating, setRating] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<ImageType[]>([]);
  const [text, setText] = useState<string>("");
  const sport_hall_id = useLocalSearchParams().zaalId as string;

  const { getSpecificHall } = useHallInfo();
  const zaal_data = getSpecificHall(sport_hall_id);

  const MAX_REVIEW_IMAGES = 5;

  const handle_submit = async () => {
    try {
      if (imageUrl.length === 0 || text.trim().length === 0 || rating === 0) {
        showToast({
          title: "Oops!",
          description: "Please fill in all fields",
          alertType: "warn",
        });
      }

      const tmpImgs: string[] = [];
      if (imageUrl.length > 0) {
        try {
          console.log(imageUrl.map((img) => img.type));
          const imgRes = await axiosInstance.post("/review/presign", {
            types: imageUrl.map((img) => img.type),
          });
          const uploads = imgRes.data.data;
          if (!uploads) return;
          const results = await Promise.all(
            uploads.map(async (upload: any, index: number) => {
              const local = await fetch(imageUrl[index].uri);
              const pot = await fetch(upload.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": upload.contentType },
                body: local.body,
              });
              if (!pot.ok)
                return {
                  key: null,
                  type: null,
                };

              return {
                key: decodeURIComponent(upload.key),
                type: upload.contentType,
              };
            }),
          );
          const completed = await axiosInstance.post("/review/completed", {
            images: results,
          });
          const completedData = completed.data;
          if (!completedData.ok || !Array.isArray(completedData.images)) return;
          tmpImgs.push(...completedData.images);
        } catch (error) {
          console.log("ERROR ", error);
          return;
        }
      }
      const imageKeys = tmpImgs.map((img: any) => img.key);
      console.log("imageKeys", imageKeys);
      const response = await axiosInstance.post(
        `/auth/review/${sport_hall_id}`,
        {
          message: text,
          user_given_stars: rating,
          image: imageKeys.length > 0 ? imageKeys : null,
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

  async function openMediaPicker() {
    const remaining = MAX_REVIEW_IMAGES - imageUrl.length;

    if (remaining <= 0) {
      showToast({
        title: "Image limit reached",
        description: `You can add up to ${MAX_REVIEW_IMAGES} photos.`,
        alertType: "warn",
      });
      return;
    }

    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: remaining,
      maxHeight: 512,
      maxWidth: 512,
      quality: 0.7,
    });

    if (result.didCancel || result.errorCode) return;

    const extensionTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    const pickedImages: ImageType[] = [];

    for (const [index, asset] of (result.assets ?? []).entries()) {
      if (!asset.uri) continue;

      const name = asset.fileName ?? `image-${Date.now()}-${index}.jpg`;
      const rawType = asset.type?.toLowerCase();
      const extension = name.split(".").pop()?.toLowerCase();

      const type =
        rawType === "image/jpg"
          ? "image/jpeg"
          : (rawType ?? extensionTypes[extension ?? ""]);

      if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type)) {
        continue;
      }

      pickedImages.push({ type, name, uri: asset.uri });
    }

    setImageUrl((previous) =>
      [...previous, ...pickedImages].slice(0, MAX_REVIEW_IMAGES),
    );
  }

  if (!sport_hall_id)
    return (
      <OwnActivaterIndicator color={Colors.primary}></OwnActivaterIndicator>
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeading}>
          <Text style={styles.eyebrow}>SHARE YOUR EXPERIENCE</Text>
          <Text style={styles.pageTitle}>Write a review</Text>
          <Text style={styles.pageSubtitle}>
            Your feedback helps others find the right place to play.
          </Text>
        </View>

        <View style={styles.hallCard}>
          <Image
            source={{ uri: zaal_data?.hall_details.hall_imageURLs?.[0] }}
            style={styles.hallImage}
          />
          <View style={styles.hallInfo}>
            <View style={styles.hallNameRow}>
              <Ionicons
                name="location"
                size={16}
                color={Colors.accentPrimary}
              />
              <Text style={styles.hallName} numberOfLines={2}>
                {zaal_data?.hall_details.hall_name ?? "Sports hall"}
              </Text>
            </View>
            <Text style={styles.hallHint}>Your review is about this venue</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons name="star" size={18} color={Colors.accentPrimary} />
            </View>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Rate your visit</Text>
              <Text style={styles.sectionSubtitle}>Tap a star to rate</Text>
            </View>
          </View>
          <View style={styles.ratingWrap}>
            <StarRating
              rating={rating}
              onChange={setRating}
              editable={true}
              starSize={34}
            />
            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {
                  [
                    "",
                    "Needs improvement",
                    "Could be better",
                    "Good experience",
                    "Really enjoyable",
                    "Excellent visit",
                  ][rating]
                }
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="chatbubble-ellipses"
                size={17}
                color={Colors.accentPrimary}
              />
            </View>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Tell us more</Text>
              <Text style={styles.sectionSubtitle}>What stood out to you?</Text>
            </View>
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share what you liked, or what could be better..."
            placeholderTextColor={Colors.outline}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.characterHint}>{text.length} characters</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons name="images" size={18} color={Colors.accentPrimary} />
            </View>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Add photos</Text>
              <Text style={styles.sectionSubtitle}>
                Optional · up to {MAX_REVIEW_IMAGES} photos
              </Text>
            </View>
            {imageUrl.length > 0 && (
              <Text style={styles.mediaCount}>
                {imageUrl.length}/{MAX_REVIEW_IMAGES}
              </Text>
            )}
          </View>
          {imageUrl.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewList}
            >
              {imageUrl.map((img, index) => (
                <View
                  key={`${img.uri}-${index}`}
                  style={styles.imagePreviewWrap}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    style={styles.removeImageButton}
                    onPress={() =>
                      setImageUrl((images) =>
                        images.filter((_, imageIndex) => imageIndex !== index),
                      )
                    }
                  >
                    <Ionicons name="close" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={openMediaPicker}
            activeOpacity={0.75}
            disabled={imageUrl.length >= MAX_REVIEW_IMAGES}
          >
            <View style={styles.mediaIconWrap}>
              <Entypo name="camera" size={22} color={Colors.accentPrimary} />
            </View>
            <View style={styles.mediaTextWrap}>
              <Text style={styles.mediaTitle}>Choose from your library</Text>
              <Text style={styles.mediaSubtitle}>
                {imageUrl.length > 0
                  ? `${imageUrl.length} photo${imageUrl.length === 1 ? "" : "s"} selected`
                  : "Add a few moments from your visit"}
              </Text>
            </View>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={Colors.accentPrimary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handle_submit}
          style={styles.submitButton}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>Submit review</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.footerHint}>Thanks for helping the community</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.backgroundColor },
    scrollContent: { padding: 20, paddingTop: 18, paddingBottom: 36, gap: 16 },
    pageHeading: { marginBottom: 2 },
    eyebrow: {
      color: Colors.accentPrimary,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      marginBottom: 7,
    },
    pageTitle: {
      color: Colors.onSurface,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.6,
    },
    pageSubtitle: {
      color: Colors.outline,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 5,
    },
    hallCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: Colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 13,
    },
    hallImage: {
      width: 88,
      height: 78,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHigh,
    },
    hallInfo: { flex: 1, gap: 6 },
    hallNameRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
    hallName: {
      flex: 1,
      color: Colors.onSurface,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 21,
    },
    hallHint: { color: Colors.outline, fontSize: 12 },
    sectionCard: {
      padding: 16,
      backgroundColor: Colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    sectionHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.accentPrimaryGlow,
    },
    sectionHeadingText: { flex: 1, gap: 2 },
    sectionTitle: { color: Colors.onSurface, fontSize: 15, fontWeight: "700" },
    sectionSubtitle: { color: Colors.outline, fontSize: 12 },
    ratingWrap: { alignItems: "center", paddingTop: 18, paddingBottom: 4 },
    ratingLabel: {
      color: Colors.accentPrimary,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 9,
    },
    reviewInput: {
      minHeight: 132,
      marginTop: 16,
      padding: 14,
      borderRadius: 13,
      backgroundColor: Colors.surfaceHigh,
      borderWidth: 1,
      borderColor: Colors.borderSubtle,
      color: Colors.onSurface,
      fontSize: 14,
      lineHeight: 21,
    },
    characterHint: {
      alignSelf: "flex-end",
      color: Colors.outline,
      fontSize: 11,
      marginTop: 7,
    },
    mediaCount: {
      color: Colors.accentPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    imagePreviewList: { gap: 10, paddingTop: 15 },
    imagePreviewWrap: { position: "relative" },
    imagePreview: {
      width: 76,
      height: 76,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHigh,
    },
    removeImageButton: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 23,
      height: 23,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.onSurface,
      borderWidth: 2,
      borderColor: Colors.surface,
    },
    mediaButton: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 15,
      padding: 13,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: Colors.accentPrimaryBorder,
      backgroundColor: Colors.accentPrimaryGlow,
      gap: 11,
    },
    mediaIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.surface,
    },
    mediaTextWrap: { flex: 1, gap: 3 },
    mediaTitle: { color: Colors.onSurface, fontSize: 13, fontWeight: "700" },
    mediaSubtitle: { color: Colors.outline, fontSize: 11 },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      minHeight: 54,
      marginTop: 2,
      borderRadius: 15,
      backgroundColor: Colors.accentPrimary,
    },
    submitText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
    footerHint: {
      color: Colors.outline,
      fontSize: 12,
      textAlign: "center",
      marginTop: -7,
    },
  });

export default Inner_Zaal_Review;
