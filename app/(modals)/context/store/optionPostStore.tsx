import { create } from "zustand";

type OptionPostTypes = {
  id: string;
  value: string;
};
type OptionPostState = {
  optionPostDetail: OptionPostTypes | null;
  setOptionPostDetail: (data: OptionPostTypes) => void;
  clearOptionPostDetail: () => void;
};

export const useOptionPostStore = create<OptionPostState>((set) => ({
  optionPostDetail: null,
  setOptionPostDetail: (data) => set({ optionPostDetail: data }),
  clearOptionPostDetail: () => set({ optionPostDetail: null }),
}));
