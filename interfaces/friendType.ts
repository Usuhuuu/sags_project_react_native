export enum FriendSeparator {
  FRIENDS = "FRIENDS",
  REQUESTS = "FRIEND_REQUESTS",
  SENDED = "SENDED_REQUESTS",
}
export type FriendSeparatorValue = `${FriendSeparator}`;

export interface Friend_Status {
  friends: string[];
  recieved_requests: string[];
  sended_requests: string[];
}

export interface FriendsType {
  _id: string;
  unique_user_ID: string;
  email: string;
  userImage: string;
  userNames: {
    firstName: string;
    lastName: string;
  };
  chatId: string;
  chatKey: string;
}
