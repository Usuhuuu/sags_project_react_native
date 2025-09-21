import { Message, MessageMapState } from "@/interfaces/chatType";
import { create } from "zustand";

export interface MessageMapProp {
  messagesMap: Map<string, MessageMapState>;
  addMessageToMap: (params: MessageAddType) => void;
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

  // Add message(s) to chatID

  addMessageToMap: ({
    chatID,
    messages,
    newSendedMsj,
    no_more_message,
    cursor,
  }) =>
    set((state) => {
      const newMap = new Map(state.messagesMap);
      const prevMessages = newMap.get(chatID) || {
        messages: [],
        no_more_message: false,
        cursor: null,
      };
      let existingMessages = [...prevMessages.messages];

      const previewMessage = existingMessages[0];
      if (previewMessage && newSendedMsj) {
        const newMsj = messages[0];
        if (previewMessage.sender_unique_name === newMsj.sender_unique_name) {
          // same sender → toggle avatar visibility
          const updatedFirstMessage = {
            ...previewMessage,
            showAvatar: !previewMessage.showAvatar,
          };
          existingMessages = [
            updatedFirstMessage,
            ...existingMessages.slice(1),
          ];
          messages = [{ ...newMsj, showAvatar: true }];
        } else {
          // new sender → show avatar & time gap
          messages = [{ ...messages[0], showAvatar: true, showTimeGap: true }];
        }
      }

      // Merge depending on whether it's a new sent message or a fetched batch
      const combined = !newSendedMsj
        ? [...existingMessages, ...messages] // append history
        : [...messages, ...existingMessages]; // prepend new

      // Deduplicate by unique key
      const seen = new Set();
      const unique = combined.filter((msj) => {
        const key = `${msj.sender_unique_name}-${msj.timestamp}-${msj.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      newMap.set(chatID, {
        messages: unique,
        no_more_message: prevMessages.no_more_message,
        cursor: cursor ?? prevMessages.cursor,
      });
      return { messagesMap: newMap };
    }),
}));
