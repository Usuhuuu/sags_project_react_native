import React, { forwardRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardAwareScrollProps extends ScrollViewProps {
  children: React.ReactNode;
  /**
   * Style applied to the outer KeyboardAvoidingView.
   * Defaults to `{ flex: 1 }`.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * How far the top of this component sits below the absolute top of the screen
   * (in logical pixels). Used by iOS `KeyboardAvoidingView` to compute the exact
   * padding needed.
   *
   * Rule of thumb:
   * - Wrapped in `<SafeAreaView edges={["top"]}>` → pass `insets.top` (the default).
   * - Placed at the absolute top of the screen (no SafeAreaView above) → pass `0`.
   * - Below a navigation header → pass `insets.top + headerHeight`.
   *
   * Defaults to the device's top safe-area inset, which is correct for the
   * common pattern of `SafeAreaView > KeyboardAwareScroll`.
   *
   * Not used on Android — Android uses `behavior="height"` which does not need
   * this value.
   */
  keyboardVerticalOffset?: number;
  /**
   * Extra breathing room added at the bottom of the scroll content, on top of
   * the device's bottom safe-area inset (home indicator / navigation bar).
   * Default: 24.
   */
  extraBottomPadding?: number;
}

/**
 * KeyboardAwareScroll
 *
 * Drop-in wrapper that replaces the repetitive
 * `KeyboardAvoidingView > ScrollView` pattern across auth screens.
 *
 * What it does:
 * - iOS:  `KeyboardAvoidingView behavior="padding"` shifts the content up by
 *         exactly the keyboard height.  `automaticallyAdjustKeyboardInsets`
 *         (RN 0.73 / iOS 15+) additionally adjusts the scroll inset so the
 *         focused input is scrolled into view automatically.
 * - Android: `behavior="height"` shrinks the KAV to the space above the
 *         keyboard.  Works correctly with `softwareKeyboardLayoutMode="resize"`
 *         set in app.config.js (see configuration note in that file).
 * - Both: The scroll content always has at least
 *         `insets.bottom + extraBottomPadding` of bottom padding so content
 *         never hides behind the home indicator or navigation bar.
 *
 * Usage:
 * ```tsx
 * // In a screen file:
 * import { SafeAreaView } from "react-native-safe-area-context";
 * import { KeyboardAwareScroll } from "@/components/ui/keyboard_aware_scroll";
 *
 * export default function LoginScreen() {
 *   return (
 *     <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
 *       <KeyboardAwareScroll contentContainerStyle={styles.content}>
 *         <InputField ... />
 *         <Button ... />
 *       </KeyboardAwareScroll>
 *     </SafeAreaView>
 *   );
 * }
 * ```
 *
 * No changes are required to existing `TextInput` / `InputField` components —
 * avoidance is handled at the scroll-container level.
 */
export const KeyboardAwareScroll = forwardRef<
  ScrollView,
  KeyboardAwareScrollProps
>(
  (
    {
      children,
      style,
      contentContainerStyle,
      keyboardVerticalOffset,
      extraBottomPadding = 24,
      ...rest
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();

    // Default vertical offset: assume the component sits inside a SafeAreaView
    // that has already consumed the top inset.  The KAV's y-position from the
    // top of the screen equals insets.top, so that's what we report to KAV.
    const resolvedVerticalOffset =
      keyboardVerticalOffset !== undefined
        ? keyboardVerticalOffset
        : insets.top;

    // iOS: "padding" grows the bottom padding of KAV to push content up.
    // Android with softwareKeyboardLayoutMode="resize": "height" shrinks the
    // KAV container to the remaining space above the keyboard.
    const kavBehavior = Platform.OS === "ios" ? "padding" : "height";

    // Content always has at least this much bottom padding to clear the home
    // indicator / navigation bar even when the keyboard is closed.
    const bottomPadding = insets.bottom + extraBottomPadding;

    return (
      <KeyboardAvoidingView
        style={[{ flex: 1 }, style]}
        behavior={kavBehavior}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? resolvedVerticalOffset : 0
        }
      >
        <ScrollView
          ref={ref}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // iOS 15+ (RN 0.73+): native scroll-inset adjustment — the system
          // automatically scrolls the focused input into view above the keyboard.
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          scrollEventThrottle={16}
          contentContainerStyle={[
            contentContainerStyle,
            { paddingBottom: bottomPadding },
          ]}
          {...rest}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  },
);

KeyboardAwareScroll.displayName = "KeyboardAwareScroll";
