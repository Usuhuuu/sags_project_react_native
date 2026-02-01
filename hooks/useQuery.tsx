import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  fetchRoleAndProfile,
  normalFetch,
  postFetch,
  simple_fetch,
} from "../hooks/fetch_functions";
import { queryClient } from "./queryClient";

type FETCH_RETURN_TYPE<T> = {
  success: boolean;
  data?: T;
  commentsData?: {
    _id: string;
    author: {
      unique_user_ID: string;
    };
    text: string;
    created_at: string;
    replies: T[];
  };
};
type RQ_QUERY_RETURN_TYPE<T> = {
  success: boolean;
  bookingData: T;
  noBookingData: T;
  chatGroupIDs?: {
    chat: string[];
    directChat: string[];
  };
  userData?: {
    members: T;
  };
  commentsData?: {
    _id: string;
    author: {
      unique_user_ID: string;
    };
    text: string;
    created_at: string;
    replies: T[];
  };
};

export type RQ_regular_cache_key =
  | readonly [
      "booked_order",
      string, // screenSeparator
      number, // page
      string, // startTime
      string | null // endTime
    ]
  | readonly ["group_chat"];

export type RQ_simple_cache_key =
  | readonly [
      "partner_posts",
      string, // date
      string, // timezone
      number // page
    ]
  | readonly ["post_comments"];

interface UseRegularQueryProps {
  pathname: string;
  cacheKey: RQ_regular_cache_key;
  loginStatus: boolean;
}
export const useRegularQuery = (
  props: UseRegularQueryProps,
  options?: Omit<
    UseQueryOptions<RQ_QUERY_RETURN_TYPE<any>>,
    "queryKey" | "queryFn"
  >
) => {
  const { pathname, cacheKey, loginStatus } = props;
  return useQuery({
    queryKey: loginStatus ? cacheKey : [],
    queryFn: () => normalFetch(pathname) as Promise<RQ_QUERY_RETURN_TYPE<any>>,
    enabled: loginStatus && !!cacheKey && (options?.enabled ?? true),
    staleTime: 10_000,
    retry: 3,
  });
};

interface UseSimpleQueryProps {
  pathname: string;
  cacheKey: RQ_simple_cache_key;
}
export const useSimpleQuery = (
  props: UseSimpleQueryProps,
  options?: Omit<
    UseQueryOptions<FETCH_RETURN_TYPE<any>>,
    "queryKey" | "queryFn"
  >
) => {
  const { pathname, cacheKey } = props;
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => simple_fetch({ path: pathname }),
    enabled: !!cacheKey && (options?.enabled ?? true),
    staleTime: 5_000,
    retry: 3,
  });
};

interface UseAuthQueryProps {
  pathname: string;
  cacheKey: readonly [`auth_${string}`];
  loginStatus: boolean;
}
export const useAuthQuery = (
  props: UseAuthQueryProps,
  options?: Omit<
    UseQueryOptions<{ role: any; profileData: any } | undefined>,
    "queryKey" | "queryFn"
  >
) => {
  const { pathname, cacheKey, loginStatus } = props;
  return useQuery({
    queryKey: loginStatus ? cacheKey : [],
    queryFn: () => fetchRoleAndProfile(pathname, loginStatus),
    enabled: loginStatus && (options?.enabled ?? true),
    staleTime: 10_000,
    retry: 3,
  }) as any;
};

export const flushRegularQuery = () => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        (Array.isArray(key) && key[0] === "booked_order") ||
        key[0] === "group_chat"
      );
    },
  });
};
