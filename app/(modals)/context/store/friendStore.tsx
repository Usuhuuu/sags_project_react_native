import { FriendsType } from "@/interfaces/friendType";
import { create } from "zustand";

type FriendState = {
  friendDetails: FriendsType | null;
  setFriendDetails: (data: FriendsType) => void;
  clearFriendDetails: () => void;
};

export const useFriendStore = create<FriendState>((set) => ({
  friendDetails: null,
  setFriendDetails: (data) => set({ friendDetails: data }),
  clearFriendDetails: () => set({ friendDetails: null }),
}));
