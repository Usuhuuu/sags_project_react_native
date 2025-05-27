import { PartnerBlock } from "@/app/(tabs)/inbox";
import axiosInstance from "@/hooks/axiosInstance";
import { SportHallDataType } from "@/interfaces/listing";
import { HashedSportData } from "@/utils/sport_hall_hash";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type FetchedDataType = {
  _id: string;
  zaal_ID: string;
  day: string[];
  blocks: PartnerBlock[];
  paying_peoples: OtherPoeples[];
  sport_hall: SportHallDataType;
};
type OtherPoeples = {
  userID: string;
  amountPaid: number;
  payment_status: string;
};

const OrderHistory = () => {
  const [today, setToday] = useState<string>(new Date().toISOString());
  const [fetchedData, setFetchedData] = useState<FetchedDataType>();
  const fetchHistory = async () => {
    try {
      const [year, month, day] = today.split("T")[0].split("-");
      console.log(fetchHistory);
      const response = await axiosInstance.get(
        `/auth/sporthall/book/${year}/${month}?page=1`
      );
      if (response.status === 200 && response.data.success) {
        const result = response.data.findBooks.map((hall: FetchedDataType) => {
          const tempHall = HashedSportData[hall?.zaal_ID];
          return {
            ...hall,
            sport_hall: tempHall,
          };
        });
        setFetchedData(result);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleCancel = async () => {};
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  return (
    <View>
      <TouchableOpacity onPress={() => fetchHistory()}>
        <Text>Hello</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderHistory;
