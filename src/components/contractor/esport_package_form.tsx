import AppText from "@/components/ui/app_text";
import { useTheme } from "@/context/theme_context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "@/utils/toast";
import { saveHallToStorage, HallFormValues } from "./hall_form";

export type EsportPackage = {
  name: string;
  durationMinutes: number;
  price: string;
};

const TIERS: { id: string; label: string; icon: string }[] = [
  { id: "hall", label: "Hall", icon: "grid-outline" },
  { id: "vip", label: "VIP", icon: "star-outline" },
  { id: "stage", label: "Stage", icon: "easel-outline" },
];

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundColor },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: Colors.surfaceHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTextWrap: { flex: 1, marginLeft: 14 },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: Colors.onSurface,
      letterSpacing: -0.4,
    },
    headerSubtitle: { fontSize: 13, color: Colors.outline, marginTop: 2 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    sectionCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: 18,
      marginBottom: 16,
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    sectionBadge: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: Colors.accentPrimaryGlow,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.onSurface },
    sectionHint: { fontSize: 12, color: Colors.outline, marginTop: 2 },
    row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surfaceHigh,
      paddingHorizontal: 12,
      height: 46,
    },
    input: { flex: 1, fontSize: 15, color: Colors.onSurface, height: 46, paddingHorizontal: 0 },
    smallInput: { width: 84, fontSize: 15, color: Colors.onSurface, height: 46, paddingHorizontal: 0, textAlign: "right" },
    currency: { fontSize: 13, color: Colors.outline, marginLeft: 6 },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: Colors.accentPrimaryBorder,
      backgroundColor: Colors.accentPrimaryGlow,
    },
    addBtnText: { color: Colors.accentPrimary, fontSize: 14, fontWeight: "600" },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 54,
      borderRadius: 16,
      backgroundColor: Colors.accentPrimary,
    },
    ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
    empty: {
      paddingVertical: 16,
      alignItems: "center",
    },
    emptyText: { fontSize: 13, color: Colors.outline },
  });

type EsportPackageFormProps = {
  initialData: HallFormValues;
};

export default function EsportPackageForm({ initialData }: EsportPackageFormProps) {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const [packages, setPackages] = useState<Record<string, EsportPackage[]>>(
    () =>
      initialData.esportPackages ?? {
        hall: [],
        vip: [],
        stage: [],
      },
  );
  const [saving, setSaving] = useState(false);

  const updatePackage = useCallback(
    (tier: string, idx: number, field: "name" | "durationMinutes" | "price", v: string) => {
      setPackages((prev) => {
        const list = prev[tier] ?? [];
        const next = list.map((p, i) =>
          i === idx ? { ...p, [field]: field === "durationMinutes" ? Number(v) || 0 : v } : p,
        );
        return { ...prev, [tier]: next };
      });
    },
    [],
  );

  const addPackage = useCallback((tier: string) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: [...(prev[tier] ?? []), { name: "", durationMinutes: 60, price: "" }],
    }));
  }, []);

  const removePackage = useCallback((tier: string, idx: number) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: (prev[tier] ?? []).filter((_, i) => i !== idx),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveHallToStorage({ ...initialData, esportPackages: packages });
      showToast({
        title: "Packages Saved",
        description: "Esport packages were updated",
        alertType: "success",
      });
      setTimeout(() => router.back(), 400);
    } catch {
      showToast({
        title: "Save failed",
        description: "Could not save packages. Please try again.",
        alertType: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [initialData, packages]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <AppText style={styles.headerTitle}>Esport Packages</AppText>
            <AppText style={styles.headerSubtitle}>
              Set time packages per tier (name, hours, price)
            </AppText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {TIERS.map((tier) => {
            const list = packages[tier.id] ?? [];
            return (
              <View key={tier.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBadge}>
                    <Ionicons name={tier.icon as any} size={18} color={Colors.accentPrimary} />
                  </View>
                  <View>
                    <AppText style={styles.sectionTitle}>{tier.label} Tier</AppText>
                    <AppText style={styles.sectionHint}>
                      {list.length} package{list.length === 1 ? "" : "s"}
                    </AppText>
                  </View>
                </View>

                {list.length === 0 ? (
                  <View style={styles.empty}>
                    <AppText style={styles.emptyText}>No packages yet. Add one below.</AppText>
                  </View>
                ) : (
                  list.map((pkg, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={[styles.inputWrap, { flex: 1 }]}>
                        <TextInput
                          placeholder="Package name"
                          placeholderTextColor={Colors.outline}
                          value={pkg.name}
                          onChangeText={(t) => updatePackage(tier.id, idx, "name", t)}
                          style={styles.input}
                        />
                      </View>
                      <View style={styles.inputWrap}>
                        <TextInput
                          placeholder="Hrs"
                          placeholderTextColor={Colors.outline}
                          value={pkg.durationMinutes ? String(pkg.durationMinutes / 60) : ""}
                          keyboardType="numeric"
                          onChangeText={(t) =>
                            updatePackage(tier.id, idx, "durationMinutes", String(Number(t) * 60))
                          }
                          style={styles.smallInput}
                        />
                      </View>
                      <View style={styles.inputWrap}>
                        <TextInput
                          placeholder="0"
                          placeholderTextColor={Colors.outline}
                          value={pkg.price}
                          keyboardType="numeric"
                          onChangeText={(t) => updatePackage(tier.id, idx, "price", t)}
                          style={styles.smallInput}
                        />
                        <AppText style={styles.currency}>₮</AppText>
                      </View>
                      <TouchableOpacity
                        onPress={() => removePackage(tier.id, idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.errorColor} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <TouchableOpacity style={styles.addBtn} onPress={() => addPackage(tier.id)}>
                  <Ionicons name="add" size={18} color={Colors.accentPrimary} />
                  <AppText style={styles.addBtnText}>Add package</AppText>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.cta, saving && { opacity: 0.6 }]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <AppText style={styles.ctaText}>
              {saving ? "Saving..." : "Save Packages"}
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
