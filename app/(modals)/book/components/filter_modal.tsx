import Colors from "@/constants/Colors";
import { OrderScreenSeparator } from "@/interfaces/order&book_type";
import { Entypo, Fontisto } from "@expo/vector-icons";
import React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Notifier } from "react-native-notifier";

interface Filter_Modals_Props {
  screenSeparator: OrderScreenSeparator;
  setScreenSeparator: React.Dispatch<
    React.SetStateAction<OrderScreenSeparator>
  >;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
}

const Filter_Modals = ({
  screenSeparator,
  modalVisible,
  setScreenSeparator,
  setModalVisible,
  setDate,
}: Filter_Modals_Props) => {
  const { t } = useTranslation();
  const orderLangInit: any = t("orderScreen", { returnObjects: true });
  const months = [
    { number: 1, text: `${orderLangInit.months.january}` },
    { number: 2, text: `${orderLangInit.months.february}` },
    { number: 3, text: `${orderLangInit.months.march}` },
    { number: 4, text: `${orderLangInit.months.april}` },
    { number: 5, text: `${orderLangInit.months.may}` },
    { number: 6, text: `${orderLangInit.months.june}` },
    { number: 7, text: `${orderLangInit.months.july}` },
    { number: 8, text: `${orderLangInit.months.august}` },
    { number: 9, text: `${orderLangInit.months.september}` },
    { number: 10, text: `${orderLangInit.months.october}` },
    { number: 11, text: `${orderLangInit.months.november}` },
    { number: 12, text: `${orderLangInit.months.december}` },
  ];

  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  // Go to next month; auto-increase year if needed
  const incrementMonth = () => {
    setMonthIndex((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1); // move to next year
        return 0; // reset to January
      }
      return prev + 1;
    });
  };

  const decrementMonth = () => {
    setMonthIndex((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1); // move to previous year
        return 11; // go to December
      }
      return prev - 1;
    });
  };

  const incrementYear = () => setYear((prev) => prev + 1);
  const decrementYear = () => setYear((prev) => prev - 1);

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    if (
      screenSeparator === OrderScreenSeparator.HISTORY &&
      year === currentYear &&
      monthIndex > currentMonthIndex
    ) {
      setMonthIndex(currentMonthIndex);
    }

    if (
      screenSeparator === OrderScreenSeparator.TODAY_UPCOMING &&
      year === currentYear &&
      monthIndex < currentMonthIndex
    ) {
      setMonthIndex(currentMonthIndex);
    }
  }, [year, screenSeparator]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      style={{ flex: 1 }}
      animationType="fade"
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "60%",
            backgroundColor: Colors.white,
            padding: 10,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setMonthIndex(new Date().getMonth());
                setYear(new Date().getFullYear());
              }}
            >
              <Fontisto name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: Colors.dark, fontSize: 20, fontWeight: 700 }}>
              {orderLangInit.filterText}
            </Text>
          </View>
          <View style={style.filterContainer}>
            {/* Year Picker */}
            <View style={style.picker}>
              <TouchableOpacity onPress={incrementYear} style={style.button}>
                <Entypo name="triangle-up" size={24} color={Colors.dark} />
              </TouchableOpacity>
              <Text style={style.value}>{year}</Text>
              <TouchableOpacity onPress={decrementYear} style={style.button}>
                <Entypo name="triangle-down" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Month Picker */}
            <View style={style.picker}>
              {/* Up Button */}
              <TouchableOpacity onPress={incrementMonth} style={style.button}>
                <Entypo name="triangle-up" size={24} color={Colors.dark} />
              </TouchableOpacity>

              {/* Month Text */}
              <View
                style={{
                  minWidth: 80,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={style.value}>{months[monthIndex].text}</Text>
              </View>

              {/* Down Button */}
              <TouchableOpacity onPress={decrementMonth} style={style.button}>
                <Entypo name="triangle-down" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                const today = new Date();
                const selectedDate = new Date(year, monthIndex, 1);
                const separator =
                  selectedDate < today
                    ? OrderScreenSeparator.HISTORY
                    : OrderScreenSeparator.TODAY_UPCOMING;

                setMonthIndex(today.getMonth());
                setYear(today.getFullYear());
                const formattedMonth = String(
                  selectedDate.getMonth() + 1
                ).padStart(2, "0");
                setDate(`${selectedDate.getFullYear()}-${formattedMonth}-01`);
                setScreenSeparator(separator);
                setModalVisible(false);
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 20 }}>
                {orderLangInit.filter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Filter_Modals;
const style = StyleSheet.create({
  separatorContainer: {
    flexDirection: "row",
    backgroundColor: Colors.lightGrey,
    padding: 2,
    borderRadius: 10,
  },
  separator: {
    padding: 10,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  picker: {
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.grey,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 5,
  },
});
