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
      time_slots: [String];
      totalPrice: number;
    }
  ];
  total_amount: string;
  booking_status: boolean;
  zaal_ID: string;
  zaal_info: SportHallDataType;
};
export enum OrderScreenSeparator {
  UPCOMING = "UPCOMING",
  TODAY = "TODAY",
  HISTORY = "HISTORY",
}
type OrderScreenSeparatorValue = `${OrderScreenSeparator}`;

export type OrderDataTypes ={
  upcoming: Return_Type[];
  today: Return_Type[];
  history: Return_Type[];
}

