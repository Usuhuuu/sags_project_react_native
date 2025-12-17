import SportHallData from "@/assets/Data/sportHall.json";
import { EsportHallDataType, SportHallDataType } from "@/interfaces/listing";

export const HashedSportData = SportHallData.reduce<
  Record<string, SportHallDataType | EsportHallDataType>
>((acc, hall) => {
  acc[hall.sportHallID] = {
    ...hall,
    price: {
      oneHour: String(hall.price?.oneHour),
      wholeDay: String(hall.price?.wholeDay),
    },
    prices: hall.prices ?? {
      oneHour: String(hall.price?.oneHour),
      wholeDay: String(hall.price?.wholeDay),
    },
  } as SportHallDataType | EsportHallDataType;
  return acc;
}, {});
