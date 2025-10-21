import axiosInstance from "@/hooks/axiosInstance";
import * as SecureStore from "expo-secure-store";

export const fetchRoleAndProfile = async (
  path: String,
  LoginStatus: boolean
) => {
  if (LoginStatus) {
    try {
      const response = await axiosInstance.get(`/auth/profile_${path}`);
      return {
        role: response.data.role,
        profileData: response.data.formData,
      };
    } catch (err) {
      throw new Error("Failed to fetch role and profile data");
    }
  } else {
    throw new Error("User is not logged in");
  }
};

export const normalFetch = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const postFetch = async ({
  path,
  body,
}: {
  path: string;
  body: any;
}) => {
  try {
    const response = await axiosInstance.post(`${path}`, body);
    return response.data;
  } catch (err) {
    console.log(postFetch);
    if (err) throw new Error("Error on fetch");
  }
};
