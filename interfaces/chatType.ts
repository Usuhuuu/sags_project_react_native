import { MessageAddType } from "@/src/context/store/chatStore";
import { FlatList } from "react-native";
import { Socket } from "socket.io-client";

export enum ChatSeparator {
  PERSONAL = "personal",
}

export type ChatSeparatorValue = `${ChatSeparator}`;

export interface MessageToMap {
  chatID: string;
  messages: Message[];
  newSendedMsj: boolean;
  no_more_message?: boolean;
}

export interface LoadOlderMsjProp {
  socketRef: React.MutableRefObject<Socket | null>;
  cursor: Date | null;
  setCursor: React.Dispatch<React.SetStateAction<Date | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addMessageToMap: (params: MessageAddType) => void;
  currentChatId: string;
  chatSeparator: ChatSeparatorValue;
}

export interface Message {
  _id: string;
  sender_unique_name: string;
  groupId?: string;
  message: string;
  timestamp: Date;
  showDateSeparator?: boolean;
  showTimeGap?: boolean;
  no_more_message?: boolean;
  isLastMessage?: boolean;
  showAvatar?: boolean;
  seenBy?: string[];
}
export interface ChatTypes {
  chatId: string;
  members: string;
  chat_image: string | undefined;
  unseenCount: number;
  userInfo: {
    _id: string;
    unique_user_ID: string;
  }[];
  lastMessage?: {
    msgId?: string;
    senderId?: string;
    message?: string;
    timestamp?: number | string;
  };
}
export type MessageHistory = {
  nextCursor: Date | null;
  messages: Message[];
  groupId: string;
  no_more_message: boolean;
};

export interface ActiveUserType {
  unique_user_ID: string;
  status: string;
}
export type MessageMapState = {
  messages: Message[];
  no_more_message?: boolean;
  cursor: Date | null;
};

export interface SendMessageProp {
  socketRef: React.MutableRefObject<Socket | null>;
  messageText: string;
  userDataParsed: any;
  messagesMap: Map<string, MessageMapState>;
  currentChatId: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  flatListRef: React.MutableRefObject<FlatList | null>;
  addMessageToMap: (params: MessageAddType) => void;
  cursor: Date | null;
  friendInfo: ChatTypes["userInfo"] | undefined;
}
