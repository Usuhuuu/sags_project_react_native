import { SportHallDataType } from "./listing";

export type Booking_Data_Type = {
  bookingData: Return_Type[];
  success: boolean;
};

export type Return_Type = {
  _id: string;
  day: string[];
  blocks: [
    {
      start_time: string;
      end_time: String;
      num_players: number;
      current_player: number;
      totalPrice: number;
    }  
  ];
  total_amount: string;
  booking_status: string;
  zaal_ID: string;
  zaal_info: SportHallDataType;
  paying_peoples:{
    amountPaid: string;
    payment_status: string;
    phoneNumber: string;
  },
  paying_user_info:[{
    unique_user_ID: string;
    phoneNumber: string;
    userNames:{
        first_name: string;
        last_name: string;
    }
  }],
    full_paid: boolean;
    full_paid_at?: string;
};
export enum OrderScreenSeparator {
  TODAY_UPCOMING= "TODAY_UPCOMING",
  HISTORY = "HISTORY",
}
type OrderScreenSeparatorValue = `${OrderScreenSeparator}`;

export type OrderDataTypes ={
  today_upcoming: Return_Type[];
  history: Return_Type[];
}

