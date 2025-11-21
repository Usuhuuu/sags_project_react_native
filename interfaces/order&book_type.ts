import { Booking_Time_Validation_payload } from "@/app/(modals)/book/components/order_separator";
import { SportHallDataType } from "./listing";

export type Booking_Data_Type = {
  bookingData: Return_Type[];
  success: boolean;
};
export type Booking_Block_Type = {
  start_time: string;
  end_time: String;
  num_players: number;
  current_player: number;
  totalPrice: number;
  block_booking_status: string
}

export type Return_Type = {
  _id: string;
  zaal_ID: string;
  day: string[];
  blocks: Booking_Block_Type[]
  total_amount: number;
  zaal_info: SportHallDataType;
  paying_peoples:[{
    amountPaid: number;
    payment_status: string;
    paying_user_info:[{
      unique_user_ID: string;
      phoneNumber: string;
      userNames:{
          first_name: string;
          last_name: string;
      }
  }],
  }],
  session_obj?:Booking_Time_Validation_payload;
  full_paid: boolean;
  full_paid_at?: string;
};
export enum OrderScreenSeparator {
  TODAY_UPCOMING= "TODAY_UPCOMING",
  HISTORY = "HISTORY",
}

export type OrderDataTypes ={
  today_upcoming: Return_Type[];
  history: Return_Type[];
}

