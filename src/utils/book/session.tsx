import * as SecureStorage from "expo-secure-store";

export const saveToken = async (token: string) => {
  try {
    const indexStr = await SecureStorage.getItemAsync("paymentSessionIndex");
    let index = indexStr ? parseInt(indexStr, 10) : 0;
    index += 1;
    const expireAt = Date.now() + 15 * 60 * 1000;
    const sessionData = JSON.stringify({ token, expireAt });
    await SecureStorage.setItemAsync(`paymentSession_${index}`, sessionData);
    await SecureStorage.setItemAsync("paymentSessionIndex", index.toString());

    console.log(
      `Saved paymentSession_${index} (expires at ${new Date(
        expireAt
      ).toISOString()})`
    );
  } catch (err) {
    console.error("SecureStore error:", err);
  }
};
