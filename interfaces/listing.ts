export interface SportHallPrice {
  oneHour: string;
  wholeDay: string;
}

export interface EsportHallPrices {
  pcHall: SportHallPrice;
  pcVipHall: SportHallPrice;
  pcStageHall: SportHallPrice;
}

export type HallCategoryType = `${HallCategoryValue}`;
export enum HallCategoryValue {
  BASKET_BALL = "basket_ball",
  VOLLEY_BALL = "volley_ball",
  FOOT_BALL = "foot_ball",
  TENNIS = "tennis",
  BOWLING = "bowling",
  GOLF = "golf",
  COMPUTER = "computer",
  BILLIARDS = "billiards",
  PLAYSTATION = "playstation",
}

export interface SportHallDataType {
  sportHallID: string;
  hall_types: {
    main: string;
    sub: HallCategoryType[];
  };
  hall_details: {
    hall_name: string;
    hall_address: string;
    hall_imageURLs: string[];
    hall_price: SportHallPrice;
    hall_work_time: {
      start_time: string;
      end_time: string;
    };
    hall_feature: {
      changing_room: boolean;
      shower: boolean;
      lighting: boolean;
      spectator_seats: boolean;
      parking: boolean;
      free_wifi: boolean;
      scoreboard: boolean;
      speaker: boolean;
      microphone: boolean;
      tennis: boolean;
      billiards: boolean;
      darts: boolean;
    };
    hall_phone_number: string;
  };
  base_time_slots: {
    start_time?: string;
    end_time?: string;
  }[];
  hall_location: {
    latitude: string;
    longitude: string;
    smart_location?: string;
  };
  // name: string;
  // address: string;
  // imageUrls: string[];
  // phoneNumber: string;
  // workTime: SportHallWorkTime;
  // price: SportHallPrice;
  // location: {
  //   latitude: string;
  //   longitude: string;
  //   smart_location?: string;
  // };
  // availableTimeSlots: {
  //   start_time?: string;
  //   end_time?: string;
  // }[];
  // listing_url?: string;
  // feature: SportHallFeature;
  // rating?: number;
  // distance?: number;
  // priceSort?: number;
  // partnersLookingFor?: string;
  // playersNeeded?: string;
  // sportType: HallCategoryType;
}

export interface EsportHallDataType {
  sportHallID: string;
  hall_types: {
    main: string;
    sub: HallCategoryType[];
  };
  hall_details: {
    hall_name: string;
    hall_address: string;
    hall_imageURLs: string[];
    hall_price: EsportHallPrices;
    hall_work_time: {
      start_time: string;
      end_time: string;
    };
    hall_feature: {
      changing_room: boolean;
      shower: boolean;
      lighting: boolean;
      spectator_seats: boolean;
      parking: boolean;
      free_wifi: boolean;
      scoreboard: boolean;
      speaker: boolean;
      microphone: boolean;
      tennis: boolean;
      billiards: boolean;
      darts: boolean;
    };
    hall_phone_number: string;
    hall_location: {
      latitude: string;
      longitude: string;
      smart_location?: string;
    };
  };
  // name: string;
  // address: string;
  // imageUrls: string[];
  // phoneNumber: string;
  // workTime: SportHallWorkTime;
  // prices: EsportHallPrices;
  // location: {
  //   latitude: string;
  //   longitude: string;
  //   smart_location?: string;
  // };
  // listing_url?: string;
  // feature: SportHallFeature;
  // rating?: number;
  // distance?: number;
  // priceSort?: number;
}
