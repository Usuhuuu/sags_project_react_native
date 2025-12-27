import { EsportHallPrices, SportHallPrice } from "@/interfaces/listing";
import { create } from "zustand";

export type SportBookingData = {
  name: string;
  date: Date;
  sportHallID: string;
  price: EsportHallPrices | SportHallPrice;
  selectedTimeSlots?: string[];
  workTime?: string;
  baseTime_startAndEnd?: string;
  imageUrls: string[] | undefined;
  location: {
    latitude: string;
    longitude: string;
    smart_location?: string;
  };
};
export type EsportBookingData = {
  name: string;
  date: Date;
  sportHallID: string;
  price: EsportHallPrices;
  workTime?: string;
  imageUrls: string[] | undefined;
  location: {
    latitude: string;
    longitude: string;
    smart_location?: string;
  };
  tier?: "regular" | "vip" | "stage";
  hours?: number | string;
};

interface BookingState {
  sportBookingDetails: SportBookingData | null;
  esportBookingDetails: EsportBookingData | null;

  setEsportBookingDetails: (data: Partial<EsportBookingData>) => void;
  setSportBookingDetails: (data: Partial<SportBookingData>) => void;

  clearEsportBookingDetails: () => void;
  clearSportBookingDetails: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  sportBookingDetails: null,
  esportBookingDetails: null,

  setEsportBookingDetails: (data) =>
    set((state) => ({
      esportBookingDetails: {
        ...state.esportBookingDetails,
        ...data,
      } as EsportBookingData,
    })),

  setSportBookingDetails: (data) =>
    set((state) => ({
      sportBookingDetails: {
        ...state.sportBookingDetails,
        ...data,
      } as SportBookingData,
    })),

  clearEsportBookingDetails: () => set({ esportBookingDetails: null }),
  clearSportBookingDetails: () => set({ sportBookingDetails: null }),
}));
