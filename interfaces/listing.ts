interface SportHallFeature {
  changingRoom: boolean;
  shower: boolean;
  lighting: boolean;
  spectatorSeats: boolean;
  parking: boolean;
  freeWifi: boolean;
  scoreboard: boolean;
  speaker: boolean;
  microphone: boolean;
  tennis: boolean;
  billiards: boolean;
  darts: boolean;
}

interface SportHallPrice {
  oneHour: string;
    wholeDay: string;
}
interface SportHallWorkTime {
  startTime: string;
  endTime: string;
}


interface SportHallSportType{
  basket_ball: boolean;
  volley_ball: boolean;
  foot_ball: boolean;
  tennis: boolean;
  bowling: boolean;
  golf: boolean;
}

export interface SportHallDataType {
  sportHallID: string;
  name: string;
  address: string;
  imageUrls: string[];
  phoneNumber: string;
  workTime: SportHallWorkTime;
  price:SportHallPrice;
  location: {
    latitude: string;
    longitude: string;
    smart_location?:string
  };
  availableTimeSlots: {
    start_time?: string;
    end_time?: string;
  }[];
  listing_url?:string;
  feature: SportHallFeature;
  rating?: number;
  distance?: number;
  priceSort?: number;
  partnersLookingFor? : string
  playersNeeded?: string;
  sportType: SportHallSportType;

}