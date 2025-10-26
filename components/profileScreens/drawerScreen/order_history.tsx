import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

interface WeekCalendarProps {
  initialDate?: Date;
  bookedDates?: string[]; // e.g., ["2025-10-23", "2025-10-25"]
  onDateSelect?: (date: string) => void;
  pastDisable?: boolean;
  disablePast?: boolean;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  initialDate = new Date(),
  bookedDates = [],
  onDateSelect,
  pastDisable = false,
  disablePast = true,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs(initialDate).startOf("isoWeek")
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate 7 days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = currentWeekStart.add(i, "day");
      const formatted = date.format("YYYY-MM-DD");
      const isPast = disablePast && dayjs().isAfter(date, "day");

      return {
        date,
        formatted,
        label: date.format("dd"),
        day: date.format("D"),
        isToday: date.isSame(dayjs(), "day"),
        isDisabled: bookedDates.includes(formatted) || isPast,
      };
    });
  }, [currentWeekStart, bookedDates, disablePast]);

  // Navigation functions
  const goNextWeek = () => setCurrentWeekStart(currentWeekStart.add(1, "week"));
  const goPrevWeek = () =>
    setCurrentWeekStart(currentWeekStart.subtract(1, "week"));

  // Selection
  const handleSelect = (item: any) => {
    if (item.isDisabled) return;
    setSelectedDate(item.formatted);
    onDateSelect?.(item.formatted);
  };

  // Week label text
  const startMonth = currentWeekStart.format("MMMM");
  const endMonth = currentWeekStart.endOf("isoWeek").format("MMMM");
  const year = currentWeekStart.format("YYYY");

  const weekLabel =
    startMonth === endMonth
      ? `${startMonth} ${year}`
      : `${startMonth} - ${endMonth} ${year}`;

  return (
    <View style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        {pastDisable ? (
          <TouchableOpacity style={styles.navButton} onPress={goPrevWeek}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navButton}></View>
        )}

        <Text style={styles.weekLabel}>{weekLabel}</Text>

        <TouchableOpacity style={styles.navButton} onPress={goNextWeek}>
          <Text style={styles.navText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Week days */}
      <View style={styles.daysRow}>
        {weekDays.map((item, index) => {
          const isSelected = selectedDate === item.formatted;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(item)}
              disabled={item.isDisabled}
              style={[
                styles.dayBox,
                item.isToday && styles.todayBox,
                isSelected && styles.selectedBox,
                item.isDisabled && styles.disabledBox,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  item.isDisabled && styles.disabledText,
                  item.isToday && styles.todayText,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  item.isDisabled && styles.disabledText,
                  isSelected && styles.selectedText,
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default WeekCalendar;

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FF660010",
  },
  navText: {
    fontSize: 20,
    color: "#FF6600",
    fontWeight: "700",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayBox: {
    width: (Dimensions.get("window").width - 48) / 7,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  todayBox: {
    backgroundColor: "#FFF4E5",
  },
  selectedBox: {
    backgroundColor: "#FF6600",
  },
  disabledBox: {
    backgroundColor: "#f1f1f1",
  },
  dayLabel: {
    fontSize: 12,
    color: "#666",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  todayText: {
    color: "#FF6600",
    fontWeight: "700",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabledText: {
    color: "#aaa",
  },
});
