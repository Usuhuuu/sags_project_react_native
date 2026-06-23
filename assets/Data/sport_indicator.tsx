import { UBDistrict } from "@/app/(tabs)/inbox";

export const SPORT_INDICATOR: Record<string, UBDistrict> = {
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
