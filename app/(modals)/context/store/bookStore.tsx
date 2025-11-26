import { create } from "zustand";

export type BookingData = {
  name: string;
  date: Date;
  sportHallID: string;
  price: {
    oneHour: string;
    wholeDay: string;
  };
  selectedTimeSlots: string[];
  workTime?: string;
  baseTime_startAndEnd: string;
  image: string[] | undefined;
  location: {
    latitude: string;
    longitude: string;
    smart_location?: string;
  };
};

type BookingState = {
  bookingDetails: BookingData | null;
  setBookingDetails: (data: BookingData) => void;
  clearBookingDetails: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  bookingDetails: null,
  setBookingDetails: (data) => set({ bookingDetails: data }),
  clearBookingDetails: () => set({ bookingDetails: null }),
}));
