import axiosInstance, { axiosInstanceRegular } from "@/hooks/axiosInstance";

export const fetchRoleAndProfile = async (
  path: String,
  LoginStatus: boolean,
) => {
  if (LoginStatus) {
    try {
      const response = await axiosInstance.get(`/auth/profile_${path}`);
      if (!response.data.success && !response.data.auth) {
        throw new Error(response.data.message);
      }

      return {
        role: response.data.role,
        profileData: response.data.formData,
      };
    } catch (err: any) {
      if (err.response) {
        // server responded with status
        const status = err.response.status;
        switch (status) {
          case 404:
            throw new Error("Profile not found");

          case 429:
            throw new Error("Too many requests, please try again later");

          case 500:
            throw new Error("Server unavailable, please wait and retry");

          default:
            throw new Error(`Unexpected error (${status})`);
        }
      } else if (err.requests) {
        // request sent but no response (offline / server down)
        throw new Error(
          "No response from server, please check your connection",
        );
      } else {
        // setup error
        throw new Error("Error setting up request");
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
  } catch (err: any) {
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

export const simple_fetch = async ({ path }: { path: string }) => {
  try {
    const response = await axiosInstanceRegular.get(`${path}`);
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error("Error on fetch");
  }
};
