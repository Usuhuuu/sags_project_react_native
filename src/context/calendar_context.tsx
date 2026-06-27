// context/CalendarContext.tsx
import React, { createContext, useContext, useState } from "react";

type CalendarContextType = {
  showCalendar: boolean;
  triggerCalendar: () => void;
  resetCalendar: () => void;
};

const CalendarContext = createContext<CalendarContextType | null>(null);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const triggerCalendar = () => setShowCalendar(true);
  const resetCalendar: () => void = () => setShowCalendar(false);

  const value = React.useMemo(
    () => ({ showCalendar, triggerCalendar, resetCalendar }),
    [showCalendar],
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
