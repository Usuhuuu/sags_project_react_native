import SportHallData from "@/assets/Data/sportHall.json";
import { SportHallDataType } from "@/interfaces/listing";

export const HashedSportData = SportHallData.reduce<
  Record<string, SportHallDataType>
>((acc, hall) => {
  acc[hall.sportHallID] = {
    ...hall,
    price: {
      oneHour: String(hall.price.oneHour),
      wholeDay: String(hall.price.wholeDay),
    },
  };
  return acc;
}, {});
