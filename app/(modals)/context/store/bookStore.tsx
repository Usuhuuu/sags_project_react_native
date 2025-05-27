import { create } from "zustand";

type BookingData = {
  name: string;
  date: string;
  sportHallID: string;
  price: {
    oneHour: string;
    wholeDay: string;
  };
  selectedTimeSlots: string[];
  workTime?: string;
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
