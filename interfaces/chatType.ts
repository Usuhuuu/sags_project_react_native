
export enum ChatSeparator {
    PERSONAL = "personal",
    GROUP = "group",
    CHANNEL = "channel",
}

export type ChatSeparatorValue = `${ChatSeparator}`;


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
