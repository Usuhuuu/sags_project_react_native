import { AppState, Linking } from "react-native";

export type CheckoutBrowserResult = "success" | "cancel" | "error";

/** Deep-link prefix Wire's success_url redirects to after payment. */
const PAYMENT_REDIRECT = "projectSags://payment-result";

/**
 * Opens a payment checkout URL in the system browser and resolves when the
 * user returns to the app:
 *
 * - "success" — the `projectSags://payment-result` redirect was captured,
 *   meaning Wire fired the success_url after the payment completed.
 * - "cancel"  — the app regained focus without the redirect (user backed out,
 *   or the redirect couldn't reach the app — e.g. in Expo Go, where custom
 *   schemes are not registered).
 * - "error"   — the URL could not be opened at all.
 *
 * This is only a UX hint that tunes how long we poll. The booking is never
 * created from this result: the server's HMAC-verified webhook → BullMQ
 * worker owns that decision, and the client still confirms the real status
 * via GET /auth/payment/status/:id. The redirect carries only the
 * `payment_intent` id (already known to the app) — never credentials — so a
 * forged deep link cannot create or alter a booking.
 */
export function openCheckoutBrowser(
  url: string,
): Promise<CheckoutBrowserResult> {
  return new Promise((resolve) => {
    let settled = false;
    let wasBackgrounded = false;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = (result: CheckoutBrowserResult) => {
      if (settled) return;
      settled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      urlSub.remove();
      appSub.remove();
      resolve(result);
    };

    const urlSub = Linking.addEventListener("url", (event) => {
      if (event.url.startsWith(PAYMENT_REDIRECT)) {
        finish("success");
      }
    });

    const appSub = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        wasBackgrounded = true;
      } else if (wasBackgrounded) {
        wasBackgrounded = false;
        // Give the OS a beat to deliver the deep-link event first, so a real
        // success isn't mislabeled as a cancel (the url event can arrive
        // after AppState on some platforms).
        setTimeout(() => finish("cancel"), 500);
      }
    });

    Linking.openURL(url).catch(() => finish("error"));

    // Safety net: never hold the ordering spinner forever. QPay / bank
    // transfers can take a few minutes, so keep the window generous.
    safetyTimer = setTimeout(() => finish("cancel"), 5 * 60 * 1000);
  });
}
