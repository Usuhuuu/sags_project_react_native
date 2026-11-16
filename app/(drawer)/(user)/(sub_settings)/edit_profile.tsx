import { memo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme_context";
import { useAuth } from "@/context/auth_context";
import { useAuthQuery } from "@/hooks/useQuery";
import AppText from "@/components/ui/app_text";
import { KeyboardAwareScroll } from "@/components/ui/keyboard_aware_scroll";
import ProfileAvatar from "@/components/ui/profile_avatar";
import axiosInstance from "@/hooks/axiosInstance";
import { launchImageLibrary } from "react-native-image-picker";
import { queryClient } from "@/hooks/queryClient";

// ── Input field props ──────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
  icon: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
}

// ── Shared static input styles ────────────────────────────────────────────
const sharedInputStyles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
});

// ── Memoized input field ───────────────────────────────────────────────────
const InputField = memo(
  ({
    label,
    value,
    onChangeText,
    colors,
    icon,
    keyboardType,
    autoCapitalize,
    editable = true,
  }: InputFieldProps) => {
    const [focused, setFocused] = useState(false);

    return (
      <View
        style={[
          sharedInputStyles.inputWrapper,
          {
            backgroundColor: colors.surfaceHigh,
            borderColor: focused ? colors.accentPrimary : colors.border,
            opacity: editable ? 1 : 0.5,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={focused ? colors.accentPrimary : colors.outline}
          style={sharedInputStyles.inputIcon}
        />
        <TextInput
          autoCapitalize={autoCapitalize ?? "none"}
          placeholder={label}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          style={[
            sharedInputStyles.input,
            { color: colors.themeColorTextPure },
          ]}
        />
      </View>
    );
  },
);

// ── Styles ─────────────────────────────────────────────────────────────────
const createStyles = (Colors: any) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: Colors.backgroundColor },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 32,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.surfaceHigh,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    headerText: {
      marginLeft: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: Colors.onSurface,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: Colors.outline,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarWrap: {
      position: "relative",
    },
    cameraBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: Colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: Colors.surface,
    },
    avatarName: {
      marginTop: 12,
      fontSize: 18,
      fontWeight: "700",
      color: Colors.onSurface,
    },
    avatarId: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "700",
      color: Colors.outline,
      letterSpacing: 1,
    },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.borderSubtle,
      padding: 20,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: Colors.onSurface,
      marginBottom: 16,
    },
    formSection: {
      gap: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.onSurfaceVariant,
      marginBottom: 8,
      marginLeft: 2,
    },
    saveBtn: {
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
      marginTop: 8,
    },
    saveBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });

// ── Screen ─────────────────────────────────────────────────────────────────
const EditProfile = () => {
  const { colors } = useTheme();
  const { LoginStatus } = useAuth();
  const styles = createStyles(colors);

  const { data, isLoading } = useAuthQuery(
    {
      pathname: "main",
      cacheKey: ["auth_status"] as const,
      loginStatus: LoginStatus,
    },
    {
      enabled: LoginStatus,
      staleTime: 1_000,
      retry: 0,
    },
  );
  const profileData = data?.profileData;

  const [imageUri, setImageUri] = useState<string | null>(
    profileData?.userImage,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastProfile, setLastProfile] = useState<any>(null);

  // Adjust state during render when the profile query resolves/changes.
  if (profileData !== lastProfile) {
    setLastProfile(profileData);
    const profile = profileData;
    if (profile) {
      setFirstName(profile?.userNames?.firstName ?? "");
      setLastName(profile?.userNames?.lastName ?? "");
      setEmail(profile?.email ?? "");
      setPhoneNumber(profile?.phoneNumber ?? "");
    }
  }

  async function handleSave(type: string, name: string, uri: string) {
    try {
      if (!uri) return;
      if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
        throw new Error("Unsupported image type");
      }

      const response = await axiosInstance.post("/file/presign", {
        type: type,
        name: name,
        uri: uri,
      });
      const returnData = response.data.data ?? response.data;
      if (response.status === 200 && response.data.ok) {
        const { uploadUrl, key, contentType } = returnData;
        if (!uploadUrl || !key || !contentType)
          throw new Error("Invalid presign response");

        const localImage = await fetch(uri);
        const blob = await localImage.blob();
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": contentType,
          },
        });
        if (!uploadResponse.ok)
          throw new Error(`R2 upload failed: ${uploadResponse.status}`);

        const confirmation = await axiosInstance.post("/file/complete", {
          key: decodeURIComponent(key),
          type,
        });
        if (confirmation.data.ok) {
          setImageUri(confirmation.data.publicUrl);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleImageUpload() {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
      maxHeight: 512,
      maxWidth: 512,
      quality: 0.7,
    });
    if (result.didCancel) return;
    if (result.errorCode) throw new Error(result.errorMessage);
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const name = asset.fileName || `image-${Date.now()}.jpg`;
    const rawType = asset.type?.toLocaleLowerCase();
    const image = {
      type: rawType === "image/jpg" ? "image/jpeg" : (rawType ?? "image/jpeg"),
      name: name,
      uri: asset?.uri,
    };
    Alert.alert("Change profile photo?", "Use this image for your profile?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {},
      },
      {
        text: "Confirm",
        onPress: () => {
          setImageUri(image.uri);
          void handleSave(image.type, image.name, image.uri);
        },
      },
    ]);
  }

  async function handleImageDelete() {
    try {
      setImageUri(null);
      const result = await axiosInstance.delete(`/avatar`);
      if (result.status === 200 && result.data.ok) {
        await queryClient.invalidateQueries({
          queryKey: [`auth_status`],
          exact: true,
          refetchType: "active",
        });
        console.log("Image deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }
  console.log(imageUri);

  return (
    <View style={styles.safeArea}>
      <KeyboardAwareScroll contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <ProfileAvatar
              width={110}
              userName={profileData?.unique_user_ID}
              imageUrl={imageUri}
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => {
                Alert.alert("Profile photo", "What would you like to do?", [
                  {
                    text: "Choose new photo",
                    onPress: () => void handleImageUpload(),
                  },
                  ...(imageUri
                    ? [
                        {
                          text: "Remove photo",
                          style: "destructive" as const,
                          onPress: () => void handleImageDelete(),
                        },
                      ]
                    : []),
                  {
                    text: "Cancel",
                    style: "cancel" as const,
                  },
                ]);
              }}
            >
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <AppText style={styles.avatarName}>
            {profileData?.unique_user_ID ?? "USER"}
          </AppText>
          <AppText style={styles.avatarId}>MEMBER ID</AppText>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Personal details</AppText>
          <View style={styles.formSection}>
            <View>
              <AppText style={styles.fieldLabel}>First name</AppText>
              <InputField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                colors={colors}
                icon="person-outline"
                autoCapitalize="words"
              />
            </View>
            <View>
              <AppText style={styles.fieldLabel}>Last name</AppText>
              <InputField
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                colors={colors}
                icon="person-outline"
                autoCapitalize="words"
              />
            </View>
            <View>
              <AppText style={styles.fieldLabel}>Email</AppText>
              <InputField
                label="you@example.com"
                value={email}
                onChangeText={setEmail}
                colors={colors}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View>
              <AppText style={styles.fieldLabel}>Phone number</AppText>
              <InputField
                label="9988 0000"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                colors={colors}
                icon="call-outline"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.accentPrimary }]}
          onPress={() => {}}
          activeOpacity={0.85}
        >
          <AppText style={styles.saveBtnText}>Save Changes</AppText>
        </TouchableOpacity>
      </KeyboardAwareScroll>
    </View>
  );
};

export default EditProfile;
