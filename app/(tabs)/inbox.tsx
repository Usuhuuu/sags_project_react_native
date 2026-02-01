import React, { useCallback, useEffect, useState } from "react";
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
import Bottom_Renderer from "../listing/together/bottom_renderer";
import { MonthCalendar } from "../(modals)/book/components/calendar_strip";
import { RQ_simple_cache_key, useSimpleQuery } from "@/hooks/useQuery";
import { useIsFocused } from "@react-navigation/native";

export type PostTypes = {
  id: string;
  day: Date;
  block: {
    _id: string;
    start_time: string;
    end_time: string;
    timezone: string;
    num_players: number;
    current_player_list: string[];
    post: {
      _id: string;
      total_player_needed: number;
      likes: number;
      joinable: boolean;
      post_text: string;
      is_default_post: boolean;
      comment: string[];
      sport_type: string;
    };
    users_info: [
      {
        unique_user_ID: string;
      },
    ];
    hall_info: {
      hall_details: {
        hall_name: string;
      };
    };
  };
};

export type UBDistrict = {
  id: string;
  name: string;
  label: string;
  icon?: string;
  type?: string;
};

const TogetherScreen = () => {
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(
    dayjs(date).format("YYYY-MM-DD"),
  );
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
  const [postData, setPostData] = useState<PostTypes[]>();

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const encodedTimezone = encodeURIComponent(timezone);

  const RQ_key = [
    "partner_posts",
    formattedDate,
    encodedTimezone,
    page,
  ] as const satisfies RQ_simple_cache_key;

  const isFocused = useIsFocused();

  const { data, error, isLoading } = useSimpleQuery(
    {
      pathname: `/partner/${formattedDate}/${encodedTimezone}?page=${page}`,
      cacheKey: RQ_key,
    },
    {
      enabled: isFocused,
    },
  );
  useEffect(() => {
    setLoading(isLoading);
    if (!data?.success) return;
    setPostData((prev) => {
      if (page === 1) {
        return data.data;
      }
      const map = new Map((prev ?? []).map((item) => [item.block._id, item]));
      for (const item of data.data) {
        map.set(item.block._id, item);
      }
      return Array.from(map.values());
    });
  }, [data, isLoading, page]);

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
              selectedDates.endDate,
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
  const [filterData, setFilterData] = useState<any>(ULAANBAATAR_DISTRICTS_MAP);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 10,
      }}
    >
      <View>
        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.containerColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 4, height: 2 },
            shadowOpacity: theme === "dark" ? 0.7 : 0.1,
            shadowRadius: 4,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 42,
            marginBottom: 14,
            marginHorizontal: 6,
          }}
        >
          <Ionicons name="search" size={16} color={colors.darkGrey} />
          <TextInput
            placeholder="Search community posts..."
            placeholderTextColor={colors.darkGrey}
            style={{
              flex: 1,
              marginLeft: 8,
              color: colors.darkGrey,
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
            marginHorizontal: 6,
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
            marginHorizontal: 6,
          }}
        >
          RECENT ACTIVITY
        </Text>
      </View>
      <TogetherInsideFlatList
        data={postData}
        loading={loading}
        setLoading={setLoading}
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
  const { colors, theme } = useTheme();
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
        active && {
          borderColor: colors.primary,
          backgroundColor: theme === "dark" ? colors.containerColor : "#e0f7fa",
        },
      ]}
    >
      <Text
        style={[
          {
            fontSize: 12,
            color: theme === "dark" ? "#888" : "#aaa",
          },
          active && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={active ? colors.primary : theme === "dark" ? "#555" : "#777"}
      />
    </View>
  );
};

export default TogetherScreen;
