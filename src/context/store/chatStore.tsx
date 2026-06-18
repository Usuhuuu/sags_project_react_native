import { ChatTypes, Message, MessageMapState } from "@/interfaces/chatType";
import { create } from "zustand";

export interface MessageMapProp {
  messagesMap: Map<string, MessageMapState>;
  addMessageToMap: (params: MessageAddType) => void;
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  chatInfo: Map<string, ChatTypes>;
  addChatInfo: (chatId: string, data: ChatTypes) => void;
  removeChatInfo: (chatId: string) => void;
}
export type MessageAddType = {
  chatID: string;
  messages: Message[];
  newSendedMsj?: boolean;
  no_more_message?: boolean;
  cursor: Date | null;
};

export const useChatStore = create<MessageMapProp>((set) => ({
  messagesMap: new Map<string, MessageMapState>(),
  chatInfo: new Map<string, ChatTypes>(),
  currentChatId: "",
  setCurrentChatId: (id: string) => set({ currentChatId: id }),

  addChatInfo: (chatId: string, data: ChatTypes) =>
    set((state) => {
      const newMap = new Map(state.chatInfo);
      const existing = newMap.get(chatId);
      newMap.set(chatId, {
        ...existing,
        ...data,
      });
      return { chatInfo: newMap };
    }),
  removeChatInfo: (chatId: string) =>
    set((state) => {
      const newMap = new Map(state.chatInfo);
      newMap.delete(chatId);

      return {
        chatInfo: newMap,
      };
    }),
  addMessageToMap: ({
    chatID,
    messages,
    newSendedMsj,
    no_more_message,
    cursor,
  }) =>
    set((state) => {
      if (!messages || messages.length === 0) return state;
      const newMap = new Map(state.messagesMap);
      const prevMsj = newMap.get(chatID) || {
        messages: [],
        no_more_message: false,
        cursor: null,
      };
      const existMsg = [...prevMsj.messages];
      const incomingMsg = [...messages];
      const combinedMsj = newSendedMsj
        ? [...incomingMsg, ...existMsg]
        : [...existMsg, ...incomingMsg];
      const formatted = combinedMsj.map((msg, i) => {
        const prev = i > 0 ? combinedMsj[i - 1] : null;
        const isSameSender = prev
          ? prev.sender_unique_name.toString() ===
            msg.sender_unique_name.toString()
          : false;

        return {
          ...msg,
          showAvatar: !isSameSender,
          showTimeGap:
            !prev || !isSameSender
              ? false
              : new Date(msg.timestamp).getTime() -
                  new Date(prev.timestamp).getTime() >
                5 * 60 * 1000,
        };
      });

      const seen = new Set();
      const unique = [];
      for (const msg of formatted) {
        const key =
          msg._id ||
          `${msg.sender_unique_name}-${typeof msg.timestamp === "string" ? new Date(Number(msg.timestamp)).getTime() : new Date(msg.timestamp).getTime()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(msg);
        }
      }
      // Cap stored messages per chat to prevent unbounded memory growth
      const MAX_MESSAGES_PER_CHAT = 200;
      if (unique.length > MAX_MESSAGES_PER_CHAT) {
        unique.splice(0, unique.length - MAX_MESSAGES_PER_CHAT);
      }

      newMap.set(chatID, {
        messages: unique,
        no_more_message: no_more_message ?? prevMsj.no_more_message,
        cursor: cursor ?? prevMsj.cursor,
      });
      return { messagesMap: newMap };
    }),
}));
