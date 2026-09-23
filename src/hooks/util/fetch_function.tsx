import axiosInstance, { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { isAxiosError } from "axios";

type RoleProfile = {
  role: any;
  profileData: any;
};

export const fetchRoleAndProfile = async (
  path: string,
  loginStatus: boolean,
): Promise<RoleProfile> => {
  if (!loginStatus) {
    throw new Error("User is not logged in");
  }

  try {
    const response = await axiosInstance.get(`/auth/profile_${path}`);

    if (!response.data.success || !response.data.auth) {
      throw new Error("Profile not found");
    }

    return {
      role: response.data.role,
      profileData: response.data.formData,
    };
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const status = err.response?.status;

      switch (status) {
        case 404:
          throw new Error("Profile not found", {
            cause: err,
          });

        case 429:
          throw new Error("Too many requests, please try again later", {
            cause: err,
          });

        case 500:
          throw new Error("Server unavailable, please wait and retry", {
            cause: err,
          });

        default:
          throw new Error(`Unexpected error (${status ?? "unknown"})`, {
            cause: err,
          });
      }
    }

    throw new Error("Error setting up request", {
      cause: err,
    });
  }
};

export const normalFetch = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (err: any) {
    console.log("Error on normal fetch", err);
    return err;
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
    console.log("Error on post fetch", err);
    if (err) return err;
  }
};

export const simple_fetch = async ({ path }: { path: string }) => {
  try {
    const response = await axiosInstanceRegular.get(`${path}`);
    return response.data;
  } catch (err) {
    console.log("Error on simple fetch", err);
    return err;
  }
};
