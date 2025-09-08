import { ObjectId } from "bson";

export enum ChatSeparator {
    PERSONAL = "personal",
    GROUP = "group",
    CHANNEL = "channel",
}

export type ChatSeparatorValue = `${ChatSeparator}`;


export interface Message {
  _id: ObjectId;
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
