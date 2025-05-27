import { create } from "zustand";
import { FriendProfileType } from "@/app/(tabs)/friend";

type FriendState = {
  friendDetails: FriendProfileType | null;
  setFriendDetails: (data: FriendProfileType) => void;
  clearFriendDetails: () => void;
};

export const useFriendStore = create<FriendState>((set) => ({
  friendDetails: null,
  setFriendDetails: (data) => set({ friendDetails: data }),
  clearFriendDetails: () => set({ friendDetails: null }),
}));
