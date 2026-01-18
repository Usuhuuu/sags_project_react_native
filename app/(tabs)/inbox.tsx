import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TogetherInsideFlatList from "../listing/together/together_inside_flatlist";
import { useTheme } from "../(modals)/context/themeContext";
import dayjs from "dayjs";
import { axiosInstanceRegular } from "@/hooks/axiosInstance";
import Bottom_Renderer from "../listing/together/bottom_renderer";
import { MonthCalendar } from "../(modals)/book/components/calendar_strip";

const POSTS: Post[] = [
  {
    id: "1",
    user: "PixelHunter",
    badge: "DIAMOND RANK · RECRUITMENT",
    time: "14M AGO",
    text: "Searching for a 5-man team at the Sport Hall. Prefer Diamond rank or above for the upcoming weekend qualifiers.",
    likes: 12,
    comments: 4,
    joinable: true,
  },
  {
    id: "2",
    user: "GhostProtocol",
    badge: "PRO ELITE",
    time: "2H AGO",
    text: "Does anyone have recommendations for low-latency monitors available at the lounge? Thinking of upgrading my setup for the next season.",
    likes: 104,
    comments: 28,
    joinable: false,
  },
  {
    id: "3",
    user: "NovaCore",
    badge: "SCRIM SESSION",
    time: "5H AGO",
    text: "LFM: Mid-lane specialist for a scrim session tomorrow night. 8 PM start. DM for invite code.",
    likes: 3,
    comments: 1,
    joinable: true,
  },
];
type Post = {
  id: string;
  user: string;
  badge: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  joinable: boolean;
};

export type UBDistrict = {
  id: string;
  name: string;
  label: string;
  icon?: string;
  type?: string;
};

const Page = () => {
  const { colors, theme } = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
  const [page, setPage] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("BGD");
  const [selectedSportType, setSelectedSportType] =
    useState<string>("basket_ball");
  const [modelBottomRenderType, setModelBottomRenderType] = useState<
    "district" | "sport_type"
  >("district");

  const [initDate, setInitDate] = useState<Date>(new Date());
  const [monthCalendarVisible, setMonthCalendarVisible] =
    useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date;
    endDate: Date;
  }>();

  const ULAANBAATAR_DISTRICTS_MAP: Record<string, UBDistrict> = {
    BGD: {
      id: "BGD",
      name: "Bayangol",
      label: "Баянгол дүүрэг",
    },
    BZD: {
      id: "BZD",
      name: "Bayanzurkh",
      label: "Баянзүрх дүүрэг",
    },
    SKD: {
      id: "SKD",
      name: "Sukhbaatar",
      label: "Сүхбаатар дүүрэг",
    },
    CHD: {
      id: "CHD",
      name: "Chingeltei",
      label: "Чингэлтэй дүүрэг",
    },
    HUD: {
      id: "HUD",
      name: "Khan-Uul",
      label: "Хан-Уул дүүрэг",
    },
    SHD: {
      id: "SHD",
      name: "Songinokhairkhan",
      label: "Сонгинохайрхан дүүрэг",
    },
    NBD: {
      id: "NBD",
      name: "Nalaikh",
      label: "Налайх дүүрэг",
    },
    BCD: {
      id: "BCD",
      name: "Baganuur",
      label: "Багануур дүүрэг",
    },
    BHD: {
      id: "BHD",
      name: "Bagakhangai",
      label: "Багахангай дүүрэг",
    },
  };
  const SPORT_INDICATOR: Record<string, UBDistrict> = {
    // -------- SPORTS --------
    basket_ball: {
      id: "basket_ball",
      type: "sport",
      name: "Basketball",
      label: "Сагсан бөмбөг",
      icon: "basketball",
    },
    foot_ball: {
      id: "foot_ball",
      type: "sport",
      name: "Football",
      label: "Хөлбөмбөг",
      icon: "soccer-ball-o",
    },
    volley_ball: {
      id: "volley_ball",
      type: "sport",
      name: "Volleyball",
      label: "Волейбол",
      icon: "volleyball",
    },
    badminton: {
      id: "badminton",
      type: "sport",
      name: "Badminton",
      label: "Бадминтон",
    },
    tennis: {
      id: "tennis",
      type: "sport",
      name: "Tennis",
      label: "Талбайн теннис",
    },

    // -------- ESPORTS --------
    computer: {
      id: "computer",
      type: "esport",
      name: "PC Gaming",
      label: "Компьютер тоглоом",
      icon: "desktop",
    },
    playstation: {
      id: "playstation",
      type: "esport",
      name: "PlayStation",
      label: "PlayStation",
      icon: "game-controller",
    },
    xbox: {
      id: "xbox",
      type: "esport",
      name: "Xbox",
      label: "Xbox",
      icon: "xbox",
    },
  };

  const [filterData, setFilterData] = useState<any>(ULAANBAATAR_DISTRICTS_MAP);
  const fetchData = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const encodedTimezone = encodeURIComponent(timezone);
      const response = await axiosInstanceRegular.get(
        `/timeslots/partner/${date}/${encodedTimezone}?page=${page}`
      );
    } catch (err) {
      console.log("Error fetching data:", err);
    }
  };

  const filterSection = [
    {
      label: `Location: ${
        ULAANBAATAR_DISTRICTS_MAP[selectedDistrict]?.name || "Select"
      }`,
      id: "district",
    },
    {
      label: `Date: ${
        selectedDates
          ? `${dayjs(selectedDates.startDate).format("MMM D")} - ${dayjs(
              selectedDates.endDate
            ).format("MMM D")}`
          : "Select"
      }`,
      id: "date",
      type: "list",
    },
    {
      label: `Sport Type: ${
        SPORT_INDICATOR[selectedSportType]?.name || "Select"
      }`,
      id: "sport_type",
    },
  ];
  useEffect(() => {
    fetchData();
  }, [page]);

  const selectFunc = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {
    console.log("Selected dates: ", startDate, endDate);
    setSelectedDates({ startDate, endDate });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 16,
      }}
    >
      <View>
        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#0f0f0f",
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 42,
            marginBottom: 14,
          }}
        >
          <Ionicons name="search" size={16} color={colors.darkGrey} />
          <TextInput
            placeholder="Search community posts..."
            placeholderTextColor={colors.darkGrey}
            style={{
              flex: 1,
              marginLeft: 8,
              color: "#fff",
              fontSize: 14,
            }}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            marginBottom: 10,
            gap: 10,
          }}
        >
          {filterSection.map((filter) => {
            const isSelected = filter.id === modelBottomRenderType;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => {
                  if (filter.id === "district") {
                    setFilterData(ULAANBAATAR_DISTRICTS_MAP);
                    setModelBottomRenderType("district");
                    setModalVisible(true);
                  } else if (filter.id === "sport_type") {
                    setFilterData(SPORT_INDICATOR);
                    setModelBottomRenderType("sport_type");
                    setModalVisible(true);
                  } else if (filter.id === "date") {
                    setMonthCalendarVisible(true);
                  }
                }}
              >
                <Chip label={filter.label} active={isSelected} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text
          style={{
            fontSize: 11,
            letterSpacing: 1,
            color: "#555",
            marginBottom: 12,
          }}
        >
          RECENT ACTIVITY
        </Text>
      </View>
      <TogetherInsideFlatList
        data={POSTS}
        loading={isLoading}
        setLoading={setIsLoading}
      />
      <Bottom_Renderer
        visible={modalVisible}
        setVisible={setModalVisible}
        renderData={filterData}
        selectedData={
          modelBottomRenderType === "district"
            ? selectedDistrict
            : selectedSportType
        }
        onSelect={(item) => {
          if (item.type === "district") {
            setSelectedDistrict(item.id);
          } else if (item.type === "sport_type") {
            setSelectedSportType(item.id);
          }
        }}
        selectingType={modelBottomRenderType}
      />
      <MonthCalendar
        calendarModalVisible={monthCalendarVisible}
        setCalendarModalVisible={setMonthCalendarVisible}
        initDate={initDate}
        handleMonthFilter={selectFunc}
      />
    </View>
  );
};

const Chip = ({ label, active = false }: any) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          height: 32,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.darkGrey,
          backgroundColor: colors.containerColor,
        },
        active && { borderColor: colors.primary, backgroundColor: "#001b20" },
      ]}
    >
      <Text
        style={[
          {
            fontSize: 12,
            color: "#aaa",
          },
          active && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={active ? "#00e5ff" : "#777"}
      />
    </View>
  );
};

export default Page;
