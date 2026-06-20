export type ContractorStatisticType = {
  totalBookings?: {
    value: number;
    change: string;
  };
  totalRevenue?: {
    value: number;
    change: string;
  };
  fullPaidCount?: {
    value: number;
    change: string;
  };
  averageBookingValue?: {
    value: number;
    change: string;
  };
  trend?: {
    _id: Date;
    revenue: number;
  }[];
  trendType?: "week" | "day";
  peakHour: number;
  peakHourBookings: number;
};

export type ContractorBookingType = {
  _id?: string;
  day?: string;
  blocks?: {
    start_time: string;
    end_time: string;
    timeslots: string[];
    block_booking_status: "waiting" | "confirmed" | "canceled";
    current_player_list: [
      {
        _id: string;
        unique_user_ID: string;
      },
    ];
  }[];
};
