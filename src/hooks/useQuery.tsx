import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  QueryFunction,
} from "@tanstack/react-query";
import {
  fetchRoleAndProfile,
  normalFetch,
  simple_fetch,
} from "./util/fetch_function";
import { queryClient } from "./queryClient";

import {
  ContractorBookingType,
  ContractorStatisticType,
} from "@/types/contractor_response_type";

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
type RQ_QUERY_RETURN_TYPE<T> =
  | {
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
      contractorData?: {
        // statistical data type
        statistic: ContractorStatisticType;
        // booking data type
        book: ContractorBookingType[];
      };
      userStatData?: any;
      friendData?: {
        friends: any;
        recieved_requests: any;
        sended_requests: any;
      };
    }
  | any;

export type RQ_regular_cache_key =
  | readonly [
      "booked_order",
      string, // screenSeparator
      number, // page
      string, // startTime
      string | null, // endTime
    ]
  | readonly ["group_chat"]
  | readonly ["contractor_main"]
  | readonly [
      "contractor_order",
      "UPCOMING" | "ACTIVE" | "HISTORY", // bookingType
      number, // page
      string, // startTime
    ]
  | readonly ["esport_stat"]
  | [
      "auth_friend",
      string, // SCREEN TYPE (SEPARATOR)
      number, // PAGE
    ];

export type RQ_simple_cache_key =
  | readonly [
      "partner_posts",
      string, // date
      string, // timezone
      number, // page
    ]
  | readonly ["post_comments"];

interface UseRegularQueryProps {
  pathname: string;
  cacheKey: RQ_regular_cache_key;
  loginStatus: boolean;
}

export type RQ_infinite_cache_key = readonly [
  "booked_order",
  string, // screenSeparator
  string, // startTime
  string | null, // endTime
];
export const useRegularQuery = (
  props: UseRegularQueryProps,
  options?: Omit<
    UseQueryOptions<RQ_QUERY_RETURN_TYPE<any>>,
    "queryKey" | "queryFn"
  >,
) => {
  const { pathname, cacheKey, loginStatus } = props;
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => normalFetch(pathname) as Promise<RQ_QUERY_RETURN_TYPE<any>>,
    ...options,
    enabled: loginStatus && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 1000 * 10,
    refetchOnReconnect: options?.refetchOnReconnect ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
  });
};

type RegularQueryData = RQ_QUERY_RETURN_TYPE<any>;
interface UseRegularInfiniteQueryProps {
  pathname: (page: number) => string;
  cacheKey: RQ_infinite_cache_key;
  loginStatus: boolean;
}
export function useRegularInfiniteQuery(
  props: UseRegularInfiniteQueryProps,
  options?: Omit<
    UseInfiniteQueryOptions<
      RegularQueryData,
      Error,
      RegularQueryData,
      RQ_infinite_cache_key,
      number
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) {
  const { pathname, cacheKey, loginStatus } = props;

  const queryFn: QueryFunction<
    RegularQueryData,
    RQ_infinite_cache_key,
    number
  > = async ({ pageParam }) => {
    try {
      return (await normalFetch(pathname(pageParam))) as RegularQueryData;
    } catch (err: any) {
      const res = err?.response;
      if (
        res?.status === 400 &&
        res?.data?.success === false &&
        res?.data?.message === "NO MORE"
      )
        return {
          success: true,
          bookingData: [],
          noBookingData: [],
        };

      throw err;
    }
  };

  return useInfiniteQuery({
    queryKey: cacheKey,
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const bookingData = lastPage?.bookingData;
      if (!Array.isArray(bookingData)) return undefined;
      if (bookingData.length < 10) return undefined;
      return allPages.length + 1;
    },
    ...options,
    enabled: loginStatus && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 1000 * 10,
    refetchOnReconnect: options?.refetchOnReconnect ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
  });
}

interface UseSimpleQueryProps {
  pathname: string;
  cacheKey: RQ_simple_cache_key;
}
export const useSimpleQuery = (
  props: UseSimpleQueryProps,
  options?: Omit<
    UseQueryOptions<FETCH_RETURN_TYPE<any>>,
    "queryKey" | "queryFn"
  >,
) => {
  const { pathname, cacheKey } = props;
  return useQuery({
    queryKey: cacheKey,
    queryFn: () => simple_fetch({ path: pathname }),
    ...options,
    enabled: !!cacheKey && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5_000,
    retry: options?.retry ?? 1,
  });
};

interface UseAuthQueryProps {
  pathname: string;
  cacheKey: readonly [`auth_status`];
  loginStatus: boolean;
}
export const useAuthQuery = (
  props: UseAuthQueryProps,
  options?: Omit<
    UseQueryOptions<{ role: any; profileData: any } | undefined>,
    "queryKey" | "queryFn"
  >,
) => {
  const { pathname, cacheKey, loginStatus } = props;

  return useQuery({
    queryKey: cacheKey,
    queryFn: () => fetchRoleAndProfile(pathname, loginStatus),
    ...options,
    enabled: loginStatus && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 30_000,
    retry: options?.retry ?? 1,
    refetchOnReconnect: options?.refetchOnReconnect ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
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

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
