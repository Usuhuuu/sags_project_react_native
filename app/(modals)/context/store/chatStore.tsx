import { create } from "zustand";

type ChatState = {
  chatID: string | null;
  receivedMessages: RecievedMessage[];
  setChatID: (id: string | null) => void;
  addMessage: (msg: RecievedMessage) => void;
};
type RecievedMessage = {
  sender_unique_name: string;
  message: string;
  timestamp: Date;
  chatID?: string;
  seenBy?: string[];
};

export const useChatStore = create<ChatState>((set) => ({
  chatID: null,
  receivedMessages: [],
  setChatID: (id) => set({ chatID: id }),
  addMessage: (msg) =>
    set((state) => ({ receivedMessages: [...state.receivedMessages, msg] })),
}));
