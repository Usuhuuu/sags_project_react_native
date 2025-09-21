

export enum FriendSeparator {
    FRIENDS = "FRIENDS",
    REQUESTS = "FRIEND_REQUESTS",
    SENDED = "SENDED_REQUESTS",
}
export type FriendSeparatorValue = `${FriendSeparator}`;

export interface Friend_Status {
    friends: string[],
    recieved_requests: string[],
    send_requests: string[],
}

export interface FriendsType {
    unique_user_ID: string; 
    email: string; 
    userImage: string;
    userNames:{
        firstName: string;
        lastName: string;
    }  
}
