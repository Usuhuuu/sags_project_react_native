import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type TabScreenTypes = {
  index: undefined;
  inbox: undefined;
  order: undefined;
  friend: undefined;
  chat: undefined;
  profile: undefined;
};
export type TabNavTypes = BottomTabNavigationProp<TabScreenTypes>;
