import axiosInstance from "@/hooks/axiosInstance";
import { AxiosError } from "axios";

export const fetchRoleAndProfile = async (
  path: String,
  LoginStatus: boolean
) => {
  if (LoginStatus) {
    try {
      const response = await axiosInstance.get(`/auth/profile_${path}`);
      if (response.data.success && !response.data.auth) {
        throw new Error(response.data.message);
      }

      return {
        role: response.data.role,
        profileData: response.data.formData,
      };
    } catch (err: any) {
      console.log("PISDA", err);
      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case status === 404: {
            throw new Error("Profile not found");
          }
          case status === 429: {
            throw new Error("Too many requests, please try again later (429)");
          }
          case status === 500: {
            throw new Error("Server unavailable, please wait and retry ");
          }
        }
      } else if (err.requests) {
        throw new Error(
          "No response from server, please check your connection"
        );
      } else {
        throw new Error("Failed to fetch role and profile data");
      }
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
