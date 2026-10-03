import { create } from "zustand";

type SignupDataType = {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  userID: string;
  signUpTimer?: string;
  phoneNumber: string;
  password: string;
  userAgreeTerms: {
    agree_terms: boolean;
    agree_privacy: boolean;
  };
  path: string;
};
type PartialSignupData = Partial<
  | Pick<SignupDataType, "email" | "phoneNumber">
  | Pick<SignupDataType, "userName" | "firstName" | "lastName">
  | Pick<SignupDataType, "password" | "userAgreeTerms">
>;

interface SignupState {
  signupData: SignupDataType;
  setSignupData: (data: Partial<SignupDataType>) => void;
  clearSignupData: () => void;
}
export const emptySignupData: SignupDataType = {
  userName: "",
  firstName: "",
  lastName: "",
  email: "",
  userID: "",
  signUpTimer: "",
  phoneNumber: "",
  password: "",
  userAgreeTerms: {
    agree_terms: false,
    agree_privacy: false,
  },
  path: "",
};

export const useSignupStore = create<SignupState>((set) => ({
  signupData: emptySignupData,
  setSignupData: (data: PartialSignupData) =>
    set((state) => ({
      signupData: {
        ...state.signupData,
        ...data,
      },
    })),
  clearSignupData: () => set({ signupData: emptySignupData }),
}));
