import { FlatList } from "react-native";
import { Socket } from "socket.io-client";

export enum ChatSeparator {
    PERSONAL = "personal",
    GROUP = "group",
    CHANNEL = "channel",
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
  addMessageToMap: (params: {
    chatID: string;
    messages: Message[];
    newSendedMsj?: boolean;
    no_more_message?: boolean;
  }) => void;
  currentChatId: React.RefObject<string>;
  setRefreshFlag?: React.Dispatch<React.SetStateAction<boolean>>;
  chatSeparator: ChatSeparatorValue;
}

export interface SendMessageProp {
  socketRef: React.MutableRefObject<Socket | null>;
  messageText: string;
  userDataParsed: any;
  messagesMap: Map<string, MessageMapState>;
  currentChatId: React.MutableRefObject<string>;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  flatListRef: React.MutableRefObject<FlatList | null>;
  addMessageToMap: (params: MessageToMap) => void;
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

export interface GroupChat {
  group_ID?: string | undefined;
  group_chat_name: string;
  members: string[];
  chat_image: string;
  sportHallName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  individualChat?: string | undefined;
  notUser?: string[] | undefined;
  latestMessage?: {
    _id?: string;
    sender_unique_name?: string;
    message?: string;
    timestamp?: Date;
    seenBy?: string[];
  };
  unseenCount?: number;
  isGroup?: boolean;
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
};

