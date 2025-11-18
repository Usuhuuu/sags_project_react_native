import React, { useState, useMemo, SetStateAction, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/app/(modals)/context/themeContext";

dayjs.extend(isoWeek);

interface WeekCalendarProps {
  onDateSelect?: (date: string) => void;
  containerStyle?: ViewStyle;
  dayBoxStyle?: ViewStyle;
  selectedContainerStyle?: ViewStyle;
  selectedDayTextStyle?: TextStyle;
  selectedDayNumberStyle?: TextStyle;
  todayBoxStyle?: ViewStyle;
  disabledDayStyle?: ViewStyle;
  selectedDay: string;
  setSelectedDay: React.Dispatch<SetStateAction<string>>;
  textWeekStyle?: TextStyle;
  textDayStyle?: TextStyle;
  textMonthStyle?: TextStyle;
  moveIconStyle?: TextStyle;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  onDateSelect,
  containerStyle,
  dayBoxStyle,
  todayBoxStyle,
  disabledDayStyle,
  selectedDayTextStyle,
  selectedDayNumberStyle,
  selectedContainerStyle,
  selectedDay,
  setSelectedDay,
  textWeekStyle,
  textDayStyle,
  textMonthStyle,
  moveIconStyle,
}) => {
  const { colors: Colors } = useTheme();

  const initialDayjs = dayjs(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    initialDayjs.startOf("isoWeek")
  );

  const [headerWidth, setHeaderWidth] = useState(0);
  // generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = currentWeekStart.add(i, "day");
      const formatted = date.format("YYYY-MM-DD");
      const isBeforeInit = date.isBefore(initialDayjs, "day");
      return {
        date,
        formatted,
        label: date.format("dd"),
        day: date.format("D"),
        isToday: date.isSame(dayjs(), "day"),
        isDisabled: isBeforeInit,
      };
    });
  }, [currentWeekStart, initialDayjs]);

  // navigation
  const prevWeekStart = currentWeekStart.subtract(1, "week");
  const canGoPrevWeek = !prevWeekStart
    .endOf("isoWeek")
    .isBefore(initialDayjs, "day");
  const goNextWeek = () => setCurrentWeekStart(currentWeekStart.add(1, "week"));
  const goPrevWeek = () => {
    if (canGoPrevWeek) setCurrentWeekStart(prevWeekStart);
  };

  // selection
  const handleSelect = (item: (typeof weekDays)[0]) => {
    if (!item?.formatted || item.isDisabled) return;
    setSelectedDay(item.formatted);
    onDateSelect?.(item.formatted);
    return item.formatted;
  };

  useEffect(() => {
    if (selectedDay) {
      const selectedDayjs = dayjs(selectedDay);
      const newWeekStart = selectedDayjs.startOf("isoWeek");

      if (!newWeekStart.isSame(currentWeekStart, "week")) {
        console.log(newWeekStart);
        setCurrentWeekStart(newWeekStart);
      }
    }
  }, [selectedDay]);

  // week label
  const startMonth = currentWeekStart.format("MMMM");
  const endMonth = currentWeekStart.endOf("isoWeek").format("MMMM");
  const year = currentWeekStart.format("YYYY");
  const weekLabel =
    startMonth === endMonth
      ? `${startMonth} ${year}`
      : `${startMonth} / ${endMonth} ${year}`;

  return (
    <View style={[containerStyle]}>
      {/* header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 10,
          flex: 1,
        }}
        onLayout={(e) => setHeaderWidth(e.nativeEvent.layout.width)}
      >
        {canGoPrevWeek ? (
          <TouchableOpacity onPress={goPrevWeek}>
            <MaterialIcons
              name="keyboard-arrow-left"
              size={35}
              style={moveIconStyle}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 35 }} />
        )}

        <Text
          style={[
            textMonthStyle,
            {
              fontSize: headerWidth
                ? Math.max(14, Math.min(25, headerWidth * 0.15)) // scale with actual width
                : 20,
              fontWeight: "500",
              textAlign: "center",
              flexShrink: 1,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {weekLabel}
        </Text>

        <TouchableOpacity onPress={goNextWeek}>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={35}
            style={moveIconStyle}
          />
        </TouchableOpacity>
      </View>

      {/* week days */}
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {weekDays.map((item, index) => {
          const isSelected = selectedDay === item.formatted;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(item)}
              disabled={item.isDisabled}
              style={[
                {
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: item.isDisabled ? 0.3 : 1,
                  borderRadius: 9999,
                  aspectRatio: 1,
                  flex: 1,
                  padding: 10,
                },
                dayBoxStyle,
                item.isToday && todayBoxStyle,
                isSelected && selectedContainerStyle,
                item.isDisabled && disabledDayStyle,
              ]}
            >
              <Text
                style={[
                  textWeekStyle,
                  isSelected && selectedDayTextStyle,
                  {
                    fontSize: 16,
                  },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  textDayStyle,

                  isSelected && selectedDayNumberStyle,
                  {
                    fontSize: 16,
                  },
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
