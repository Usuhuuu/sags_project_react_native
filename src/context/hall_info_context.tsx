import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import { SportHallDataType, EsportHallDataType } from "@/types/hall_info_type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from "react";

interface HallInfoType {
  hallInfoData: Record<string, SportHallDataType | EsportHallDataType>;
  getSpecificHall: (hallId: string) => SportHallDataType | EsportHallDataType;
  getAllHalls: () => Record<string, SportHallDataType | EsportHallDataType>;
  getHallTimeSlots: (hallId: string) => {
    start_time?: string;
    end_time?: string;
  }[];
}

const HALL_DEFAULT_TIME_SLOTS = [
  {
    start_time: "08:00",
    end_time: "09:00",
  },
  {
    start_time: "09:00",
    end_time: "10:00",
  },
  {
    start_time: "10:00",
    end_time: "11:00",
  },
  {
    start_time: "11:00",
    end_time: "12:00",
  },
  {
    start_time: "12:00",
    end_time: "13:00",
  },
  {
    start_time: "13:00",
    end_time: "14:00",
  },
  {
    start_time: "14:00",
    end_time: "15:00",
  },
  {
    start_time: "15:00",
    end_time: "16:00",
  },
  {
    start_time: "16:00",
    end_time: "17:00",
  },
  {
    start_time: "17:00",
    end_time: "18:00",
  },
  {
    start_time: "18:00",
    end_time: "19:00",
  },
  {
    start_time: "19:00",
    end_time: "20:00",
  },
  {
    start_time: "20:00",
    end_time: "21:00",
  },
  {
    start_time: "21:00",
    end_time: "22:00",
  },
  {
    start_time: "22:00",
    end_time: "23:00",
  },
  {
    start_time: "23:00",
    end_time: "00:00",
  },
];
const HallInfoContext = createContext<HallInfoType | undefined>(undefined);

export const initHallInfo = async () => {
  try {
    const isExist = await AsyncStorage.getItem("hall_infos");
    if (isExist) return JSON.parse(isExist);
    const response = await axiosInstanceRegular.get("/api/hall");
    console.log("[HALL] response", response.data.hall.length);
    if (response.data) {
      await AsyncStorage.setItem("hall_version", String(response.data.version));
      await AsyncStorage.setItem(
        "hall_infos",
        JSON.stringify(response.data.hall),
      );
      return response.data.hall;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return [];
  }
};

const HallInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hallInfo, setHallInfo] = useState<
    Record<string, SportHallDataType | EsportHallDataType>
  >({});

  useEffect(() => {
    let mounted = true;
    const hallInfoGetter = async () => {
      try {
        let hallInfos = JSON.parse(
          (await AsyncStorage.getItem("hall_infos")) ?? "",
        );
        if (typeof hallInfos === "string") hallInfos = JSON.parse(hallInfos);
        if (!mounted) return;

        const hallMap: Record<string, SportHallDataType | EsportHallDataType> =
          {};

        for (const hall of hallInfos) {
          hallMap[hall._id] = {
            sportHallID: hall._id,
            ...hall,
            base_time_slots: hall.base_time_slots ?? "DEFAULT",
          };
        }
        setHallInfo(hallMap);
      } catch (err) {
        console.log(err);
      }
    };
    hallInfoGetter();
    return () => {
      mounted = false;
    };
  }, []);

  const getSpecificHall = React.useCallback(
    (hallId: string) => {
      return hallInfo[hallId];
    },
    [hallInfo],
  );
  const getAllHalls = React.useCallback(() => {
    return hallInfo;
  }, [hallInfo]);
  const getHallTimeSlots = React.useCallback(
    (hallId: string) => {
      const hall = hallInfo[hallId];
      return hall.hall_details.base_time_slots ?? HALL_DEFAULT_TIME_SLOTS;
    },
    [hallInfo],
  );

  const value = React.useMemo(
    () => ({
      hallInfoData: hallInfo,
      getSpecificHall: getSpecificHall,
      getAllHalls: getAllHalls,
      getHallTimeSlots: getHallTimeSlots,
    }),
    [hallInfo],
  );
  return (
    <HallInfoContext.Provider value={value}>
      {children}
    </HallInfoContext.Provider>
  );
};

export const useHallInfo = () => {
  const context = useContext(HallInfoContext);

  if (!context) {
    throw new Error("useHallInfo must be used within HallInfoProvider");
  }

  return context;
};

export default HallInfoProvider;
