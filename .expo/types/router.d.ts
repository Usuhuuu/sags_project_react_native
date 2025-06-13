/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(modals)/SavedHalls` | `/(modals)/authentication/login` | `/(modals)/authentication/modals/childModal` | `/(modals)/authentication/modals/innerModals/changeNameModal` | `/(modals)/authentication/modals/innerModals/memberModal` | `/(modals)/authentication/modals/mainChatModal` | `/(modals)/authentication/signup` | `/(modals)/authentication/signup_modal` | `/(modals)/authentication/third_party_instance` | `/(modals)/cameraModal` | `/(modals)/context/Languages` | `/(modals)/context/authContext` | `/(modals)/context/errorContext` | `/(modals)/context/reduxStore` | `/(modals)/context/savedHall` | `/(modals)/context/store/bookStore` | `/(modals)/context/store/friendStore` | `/(modals)/context/store/notificationStore` | `/(modals)/friendReqModal` | `/(modals)/functions/refresh` | `/(modals)/functions/review` | `/(modals)/sags` | `/(tabs)` | `/(tabs)/` | `/(tabs)/chat` | `/(tabs)/friend` | `/(tabs)/inbox` | `/(tabs)/profile` | `/SavedHalls` | `/_sitemap` | `/authentication/login` | `/authentication/modals/childModal` | `/authentication/modals/innerModals/changeNameModal` | `/authentication/modals/innerModals/memberModal` | `/authentication/modals/mainChatModal` | `/authentication/signup` | `/authentication/signup_modal` | `/authentication/third_party_instance` | `/cameraModal` | `/chat` | `/context/Languages` | `/context/authContext` | `/context/errorContext` | `/context/reduxStore` | `/context/savedHall` | `/context/store/bookStore` | `/context/store/friendStore` | `/context/store/notificationStore` | `/friend` | `/friendReqModal` | `/functions/refresh` | `/functions/review` | `/inbox` | `/listing/ZaalReview` | `/listing/book/CallWaveButton` | `/listing/book/modal_calendar` | `/listing/book/payment` | `/listing/book/support_components/swipe_remove` | `/listing/detail` | `/listing/explore` | `/listing/notification` | `/profile` | `/sags` | `/settings/mainSettings` | `/settings/profileSettings`;
      DynamicRoutes: `/(modals)/chat/${Router.SingleRoutePart<T>}` | `/(modals)/user/${Router.SingleRoutePart<T>}` | `/chat/${Router.SingleRoutePart<T>}` | `/listing/${Router.SingleRoutePart<T>}` | `/listing/book/${Router.SingleRoutePart<T>}` | `/user/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(modals)/chat/[item]` | `/(modals)/user/[friend_name]` | `/chat/[item]` | `/listing/[sportHallID]` | `/listing/book/[zaal_id]` | `/user/[friend_name]`;
    }
  }
}
