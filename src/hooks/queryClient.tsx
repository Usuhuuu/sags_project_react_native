import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ErrorToast } from "react-native-toast-message";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 5,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.log("query error", error);
      ErrorToast({
        text1: "Oops!",
        text2: `Something went wrong. Please try again later.`,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.log("mutation error", error);
      ErrorToast({
        text1: "Oops!",
        text2: `Something went wrong. Please try again later.`,
      });
    },
  }),
});
