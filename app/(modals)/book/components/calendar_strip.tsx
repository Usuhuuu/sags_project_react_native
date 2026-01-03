import React, {
  useState,
  useMemo,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { FlatList, ScrollView } from "react-native-gesture-handler";

dayjs.extend(isoWeek);

interface WeekCalendarProps {
  onDateSelect?: (date: Date) => void;
  containerStyle?: ViewStyle;
  dayBoxStyle?: ViewStyle;
  selectedContainerStyle?: ViewStyle;
  selectedDayTextStyle?: TextStyle;
  selectedDayNumberStyle?: TextStyle;
  todayBoxStyle?: ViewStyle;
  disabledDayStyle?: ViewStyle;
  selectedDay: Date;
  setSelectedDay: React.Dispatch<SetStateAction<Date>>;
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
  const initialDayjs = dayjs(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    initialDayjs.startOf("isoWeek")
  );

  const [headerWidth, setHeaderWidth] = useState(0);
  // generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = currentWeekStart.add(i, "day");

      return {
        date, // dayjs object
        jsDate: date.toDate(), // native Date()
        formatted: date.format("YYYY-MM-DDTHH:mm:ss"),
        label: date.format("dd"),
        day: date.format("D"),
        isToday: date.isSame(dayjs(), "day"),
        isDisabled: date.isBefore(initialDayjs, "day"),
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
    setSelectedDay(new Date(item.formatted));
    onDateSelect?.(new Date(item.formatted));
    return item.formatted;
  };

  useEffect(() => {
    if (selectedDay) {
      const selectedDayjs = dayjs(selectedDay);
      const newWeekStart = selectedDayjs.startOf("isoWeek");

      if (!newWeekStart.isSame(currentWeekStart, "week")) {
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
          const isSelected = dayjs(selectedDay).isSame(item.jsDate, "day");
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

interface WeekCalendarWithoutMonthProps {
  onDateSelect?: ({
    updateField,
    value,
  }: {
    updateField: "tier" | "hours" | "startTime" | "bookingDate";
    value: string | number | Date;
  }) => void;
  containerStyle?: ViewStyle;
  dayBoxStyle?: ViewStyle;
  todayBoxStyle?: ViewStyle;
  disabledDayStyle?: ViewStyle;
  selectedDayTextStyle?: TextStyle;
  selectedDayNumberStyle?: TextStyle;
  selectedContainerStyle?: ViewStyle;
  textWeekStyle?: TextStyle;
  textDayStyle?: TextStyle;
  selectedDay?: Date;
  setSelectedDay?: (date: Date) => void;
  monthTextStyle?: TextStyle;
}

interface WeekDay {
  date: Dayjs;
  jsDate: Date;
  formatted: string;
  label: string;
  day: string;
  isToday: boolean;
  isDisabled: boolean;
}

export const WeekCalendarWithoutMonth: React.FC<
  WeekCalendarWithoutMonthProps
> = ({
  containerStyle,
  dayBoxStyle,
  todayBoxStyle,
  selectedDayTextStyle,
  selectedDayNumberStyle,
  selectedContainerStyle,
  selectedDay,
  setSelectedDay,
  textWeekStyle,
  textDayStyle,
  monthTextStyle,
}) => {
  const today = dayjs();
  const { colors } = useTheme();
  const [days, setDays] = useState<WeekDay[]>(() => generateDays(today, 14));

  function generateDays(start: Dayjs, count: number) {
    const result: WeekDay[] = [];
    for (let i = 0; i < count; i++) {
      const date = start.add(i, "day");
      result.push({
        date: date,
        jsDate: date.toDate(),
        formatted: date.format("YYYY-MM-DDTHH:mm:ss"),
        label: date.format("ddd"),
        day: date.format("D"),
        isToday: date.isSame(today, "day"),
        isDisabled: false,
      });
    }
    return result;
  }

  const loadNextDays = () => {
    const lastDay = days[days.length - 1].date;
    const newDays = generateDays(lastDay.add(1, "day"), 7);
    setDays([...days, ...newDays]);
  };

  const handleSelect = (item: WeekDay) => {
    setSelectedDay?.(new Date(item.jsDate));
  };

  const widthPerDay = Dimensions.get("screen").width / 5 - 16;

  return (
    <View
      style={[
        containerStyle,
        {
          shadowColor: colors.shadowColor,
          shadowOpacity: 0.5,
          shadowOffset: { width: 2, height: 2 },
          paddingVertical: 10,
          borderRadius: 10,
        },
      ]}
    >
      <FlatList
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          width: "100%",
          height: "100%",
        }}
        keyExtractor={(item) => item.jsDate.toString()}
        renderItem={({ item }) => {
          const isSelected = dayjs(selectedDay).isSame(item.jsDate, "day");

          // Calculate week label based on this item's week
          const weekLabel = item.date.format("MMM");

          return (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={[
                {
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 15,
                  aspectRatio: 1,
                  marginHorizontal: 3,
                  width: widthPerDay,
                  shadowColor: isSelected ? colors.primary : colors.shadowColor,
                },
                dayBoxStyle,
                item.isToday && todayBoxStyle,
                isSelected && selectedContainerStyle,
              ]}
            >
              <Text style={[textWeekStyle, isSelected && selectedDayTextStyle]}>
                {item.label}
              </Text>
              <Text
                style={[textDayStyle, isSelected && selectedDayNumberStyle]}
              >
                {item.day}
              </Text>
              <Text
                style={[monthTextStyle, isSelected && selectedDayTextStyle]}
              >
                {weekLabel}
              </Text>
            </TouchableOpacity>
          );
        }}
        onEndReached={loadNextDays}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
};
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;

export const TimePicker15Min = ({
  formatedTime,
  onSelect,
  init,
  setInited,
}: {
  formatedTime: string | Date | undefined;
  onSelect: ({
    updateField,
    value,
  }: {
    updateField: "tier" | "hours" | "startTime" | "bookingDate";
    value: string | number | Date;
  }) => void;
  init: boolean;
  setInited: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const initRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const times = useMemo(() => {
    const result: string[] = [];
    let time = dayjs().startOf("day");
    while (time.isBefore(dayjs().endOf("day"))) {
      result.push(time.format("HH:mm"));
      time = time.add(30, "minute");
    }
    return result;
  }, []);

  useEffect(() => {
    if (init) return;
    initRef.current = true;
    const now = dayjs();

    const minutes = Math.ceil(now.minute() / 30) * 30;
    const roundedNow = now.minute(minutes).second(0);

    const roundedIndex = roundedNow.hour() * 2 + roundedNow.minute() / 30;
    setSelectedIndex(roundedIndex);

    scrollRef.current?.scrollTo({
      y: roundedIndex * ITEM_HEIGHT,
      animated: false,
    });
    const timeString = times[roundedIndex];
    if (!timeString) return;

    const [hours, minutes2] = timeString.split(":").map(Number);

    const time = dayjs(formatedTime).hour(hours).minute(minutes2).toDate();

    const timeFormated = dayjs(time).format("YYYY-MM-DDTHH:mm:ss");
    onSelect?.({ updateField: "bookingDate", value: time });
    onSelect?.({ updateField: "startTime", value: timeFormated });
    setInited(true);
  }, [init]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    if (index < 0 || index >= times.length) return;

    setSelectedIndex(index);

    const timeString = times[index];
    if (!timeString) return;

    const [hours, minutes2] = timeString.split(":").map(Number);
    const time = dayjs(formatedTime).hour(hours).minute(minutes2).toDate();
    const timeFormated = dayjs(time).format("YYYY-MM-DDTHH:mm:00");
    onSelect?.({ updateField: "bookingDate", value: time });
    onSelect?.({ updateField: "startTime", value: timeFormated });
  };

  const isPeakTime = (timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0]);
    return hour >= 18 && hour <= 22;
  };

  return (
    <View
      style={{
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        backgroundColor: colors.containerColor,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        borderRadius: 20,
      }}
    >
      <View
        style={{
          position: "absolute",
          height: ITEM_HEIGHT - 10,
          width: "90%",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.themeContainerGrey,
          backgroundColor: colors.backgroundColor,
          zIndex: 0,
        }}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
        }}
      >
        {times.map((time, index) => {
          const isSelected = index === selectedIndex;
          const showPeak = isSelected && isPeakTime(time);
          return (
            <View
              key={time}
              style={{
                height: ITEM_HEIGHT,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: Dimensions.get("window").width * 0.8,
              }}
            >
              <Text
                style={[
                  {
                    fontSize: 28,
                    fontWeight: "600",
                  },
                  isSelected
                    ? {
                        color: colors.themeColorTextPure,
                        fontSize: 32,
                        fontWeight: "700",
                      }
                    : {
                        color: colors.darkGrey,
                      },
                ]}
              >
                {time}
              </Text>

              {showPeak && (
                <View
                  style={{
                    backgroundColor: colors.backgroundColor,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    PEAK
                  </Text>
                </View>
              )}

              {isSelected && (
                <View
                  style={{
                    position: "absolute",
                    right: 20,
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: 10 }}>
                    ▲▼
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <Text
        style={{
          color: colors.themeContainerGrey,
          fontSize: 12,
          marginTop: 10,
          position: "absolute",
          bottom: -25,
        }}
      >
        Scroll to select time (30 min intervals)
      </Text>
    </View>
  );
};

export default WeekCalendar;
