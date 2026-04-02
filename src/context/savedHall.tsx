import { ReactNode } from "react";
import React, { createContext, useState, useContext } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Hall {
  id: string;
  name: string;
}

interface SavedHallsContextProps {
  savedHalls: Hall[];
  addHall: (hall: Hall) => void;
  removeHall: (id: string) => void;
}

const SavedHallsContext = createContext<SavedHallsContextProps>({
  savedHalls: [],
  addHall: (hall: Hall) => {},
  removeHall: (id: string) => {},
});

export const SavedHallsProvider = ({ children }: { children: ReactNode }) => {
  const [savedHalls, setSavedHalls] = useState<Hall[]>([]);

  const addHall = (hall: Hall) => {
    setSavedHalls((prevHalls) => [...prevHalls, hall]);
  };

  const removeHall = (id: string) => {
    setSavedHalls((prevHalls) => prevHalls.filter((hall) => hall.id !== id));
  };

  const saved_hall_to_backend = async () => {
    try {
      const response = await axiosInstance.post("/favorite_halls", {
        zaal_ID: savedHalls,
      });
      if (response.status == 200 && response.data.success) {
        await AsyncStorage.setItem("savedHalls", JSON.stringify(savedHalls));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SavedHallsContext.Provider value={{ savedHalls, addHall, removeHall }}>
      {children}
    </SavedHallsContext.Provider>
  );
};

export const useSavedHalls = () => useContext(SavedHallsContext);
