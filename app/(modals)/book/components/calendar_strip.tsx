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
  Modal,
  StyleSheet,
} from "react-native";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import AppText from "@/constants/appTextDefault";

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
  const isToday = dayjs(formatedTime).isSame(dayjs(), "day");

  const times = useMemo(() => {
    const result: string[] = [];
    const baseDate = dayjs(formatedTime);

    let time = baseDate.startOf("day");
    const end = baseDate.endOf("day");
    const now = dayjs();

    while (time.isBefore(end)) {
      if (!isToday || time.isAfter(now)) {
        result.push(time.format("HH:mm"));
      }
      time = time.add(30, "minute");
    }

    return result;
  }, [formatedTime, isToday]);

  useEffect(() => {
    if (init) return;
    initRef.current = true;
    const now = dayjs();

    const minutes = Math.ceil(now.minute() / 30) * 30;
    const roundedNow = now.minute(minutes).second(0);

    const roundedTime = roundedNow.format("HH:mm");
    const roundedIndex = times.indexOf(roundedTime);

    if (roundedIndex >= 0) {
      setSelectedIndex(roundedIndex);

      scrollRef.current?.scrollTo({
        y: roundedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
    const timeString = times[roundedIndex];
    if (!timeString) return;

    const [hours, minutes2] = timeString.split(":").map(Number);

    const time = dayjs(formatedTime)
      .hour(hours)
      .minute(minutes2)
      .second(0)
      .toDate();

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
    const time = dayjs(formatedTime)
      .hour(hours)
      .minute(minutes2)
      .second(0)
      .toDate();
    console.log("Selected time:", time);
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
interface MonthCalendarProps {
  calendarModalVisible?: boolean;
  setCalendarModalVisible?: React.Dispatch<SetStateAction<boolean>>;
  initDate: Date;
  handleMonthFilter: ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => void;
}
export const MonthCalendar = ({
  calendarModalVisible,
  setCalendarModalVisible,
  initDate,
  handleMonthFilter,
}: MonthCalendarProps) => {
  const { colors, theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(dayjs(initDate));
  const [selectedRange, setSelectedRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMonthMatrix = (month: dayjs.Dayjs) => {
    const firstDayOfMonth = month.startOf("month");
    const daysInMonth = month.daysInMonth();
    const startDayIndex = firstDayOfMonth.day();
    const matrix: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < startDayIndex; i++) {
      week.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        matrix.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      matrix.push(week);
    }
    return matrix;
  };

  const monthMatrix = useMemo(
    () => getMonthMatrix(currentMonth),
    [currentMonth]
  );
  const isSameDay = (a?: Date, b?: Date) => a && b && dayjs(a).isSame(b, "day");

  const isBetween = (d: Date, start?: Date, end?: Date) =>
    start &&
    end &&
    dayjs(d).isAfter(start, "day") &&
    dayjs(d).isBefore(end, "day");

  const selectDate = (date: Date) => {
    if (!selectedRange.start || selectedRange.end) {
      setSelectedRange({ start: date, end: undefined });
    } else if (dayjs(date).isBefore(selectedRange.start)) {
      setSelectedRange({ start: date, end: selectedRange.start });
    } else {
      setSelectedRange({ start: selectedRange.start, end: date });
    }
  };
  const handleDone = () => {
    setCalendarModalVisible?.(false);
    handleMonthFilter({
      startDate: selectedRange.start!,
      endDate: selectedRange.end!,
    });
  };
  const width = Dimensions.get("screen").width;

  const height = width / 9;

  return (
    <Modal
      visible={calendarModalVisible}
      animationType="slide"
      accessibilityRole="alert"
      presentationStyle="formSheet"
      style={{
        backgroundColor: colors.backgroundColor,
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: colors.backgroundColor,
          flex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
            margin: 10,
          }}
        >
          <View>
            <TouchableOpacity
              onPress={() => {
                setCalendarModalVisible?.(false);
              }}
            >
              <AppText style={{ color: colors.primary, fontWeight: 500 }}>
                Clear
              </AppText>
            </TouchableOpacity>
          </View>
          <View>
            <AppText style={{ fontWeight: 400 }}>Select Date Range</AppText>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                handleDone();
              }}
            >
              <AppText style={{ color: colors.primary, fontWeight: 500 }}>
                Done
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            padding: 10,
            marginHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <AppText style={{ color: colors.themeContainerGrey }}>
            SELECTED PERIOD
          </AppText>
          <View style={{ flexDirection: "row", gap: 5, marginBottom: 30 }}>
            <AppText style={{ fontWeight: 600, fontSize: 18 }}>
              {selectedRange.start
                ? dayjs(selectedRange.start).format("MMM DD, YYYY")
                : "-- / -- / ----"}{" "}
              {selectedRange.start && selectedRange.end ? " - " : ""}
              {selectedRange.end
                ? dayjs(selectedRange.end).format("MMM DD, YYYY")
                : "-- / -- / ----"}
            </AppText>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[
                MonthCalendarStyle.separator,
                { backgroundColor: colors.containerLittleGrey },
              ]}
            >
              <AppText>This Week</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                MonthCalendarStyle.separator,
                { backgroundColor: colors.containerLittleGrey },
              ]}
            >
              <AppText>Last Month</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                MonthCalendarStyle.separator,
                { backgroundColor: colors.containerLittleGrey },
              ]}
            >
              <AppText>Last 3 Months</AppText>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.backgroundColor,
          }}
        >
          <View
            style={{
              backgroundColor: colors.backgroundColor,
              padding: 16,
              borderRadius: 16,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600" }}>
                {currentMonth.format("MMMM YYYY")}
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setCurrentMonth(() => currentMonth.subtract(1, "month"));
                  }}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={colors.darkGrey}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setCurrentMonth(() => currentMonth.add(1, "month"));
                  }}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.darkGrey}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Week Days */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              {DAYS.map((d) => (
                <Text
                  key={d}
                  style={{
                    width: height,
                    textAlign: "center",
                    fontSize: 11,
                    color: colors.darkGrey,
                  }}
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* Dates */}
            {monthMatrix.map((week, wi) => (
              <View
                key={wi}
                style={{
                  flexDirection: "row",
                  marginBottom: 6,
                  justifyContent: "space-between",
                }}
              >
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <View
                        key={di}
                        style={{
                          width: height,
                          height: height,
                        }}
                      />
                    );
                  }
                  const date = currentMonth.date(day).toDate();
                  const isStart = isSameDay(date, selectedRange.start);
                  const isEnd = isSameDay(date, selectedRange.end);
                  const inRange = isBetween(
                    date,
                    selectedRange.start,
                    selectedRange.end
                  );
                  const selected = isStart || isEnd;

                  return (
                    <TouchableOpacity
                      key={di}
                      style={{
                        width: height,
                        height: height,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: selected
                          ? colors.primary
                          : inRange
                          ? colors.primary + "33"
                          : "transparent",
                        borderTopLeftRadius: isStart ? 10 : 0,
                        borderBottomLeftRadius: isStart ? 10 : 0,
                        borderTopRightRadius: isEnd ? 10 : 0,
                        borderBottomRightRadius: isEnd ? 10 : 0,
                      }}
                      onPress={() => {
                        selectDate(date);
                      }}
                    >
                      <Text
                        style={{
                          color: selected ? "#FFF" : "#D1D5DB",
                          fontWeight: selected ? "600" : "400",
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
const MonthCalendarStyle = StyleSheet.create({
  separator: {
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#888",
  },
});

export default WeekCalendar;
