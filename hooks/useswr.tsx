import useSWR, { mutate, SWRConfiguration } from "swr";
import {
  fetchRoleAndProfile,
  normalFetch,
  postFetch,
  simple_fetch,
} from "@/hooks/fetch_functions";

interface useSWRProps {
  pathname: string;
  cacheKey: string | null;
  loginStatus: boolean;
  body?: string[];
}
export type SWR_regular_cache_key =
  | readonly [
      "booked_order",
      string, // screenSeparator
      number, // page
      string, // startTime
      string | null // endTime
    ]
  | readonly ["group_chat"];

export type SWR_simple_cache_key =
  | readonly [
      "partner_posts",
      string, // date
      string, // timezone
      number // page
    ];

type SWRRegularProps = {
  pathname: string;
  cacheKey: SWR_regular_cache_key | null;
  loginStatus: boolean;
};

const onErrorRetry = (
  error: any,
  key: string,
  config: SWRConfiguration,
  revalidate: () => void,
  { retryCount }: { retryCount: number }
) => {
  console.log(error, key, "PISDA");
  if (retryCount >= 5) return;
  retryCount++;
  setTimeout(() => revalidate(), 3000);
};

export const regular_swr = (
  { item }: { item: SWRRegularProps },
  config?: SWRConfiguration
) => {
  const swrKey = item.loginStatus ? item.cacheKey : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    () => normalFetch(item.pathname),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      shouldRetryOnError: true,
      revalidateOnMount: true,
      errorRetryCount: 3,
      loadingTimeout: 3000,
      onErrorRetry,
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
};

export const simple_swr = (
  {
    item,
  }: {
    item: {
      pathname: string;
      cacheKey: SWR_simple_cache_key;
    };
  },
  config?: SWRConfiguration
) => {
  const { pathname, cacheKey } = item;

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => simple_fetch({ path: pathname }),
    {
      revalidateOnFocus: config?.revalidateOnFocus ?? false,
      revalidateOnMount: true,
      dedupingInterval: config?.dedupingInterval ?? 10000,
      shouldRetryOnError: true,
      errorRetryInterval: 5000,
      errorRetryCount: 3,
      loadingTimeout: 3000,
      onError: (err) => {
        console.log(err);
      },
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
};

export const auth_swr = (
  { item }: { item: useSWRProps },
  config?: SWRConfiguration
) => {
  const { pathname, cacheKey, loginStatus } = item;
  const swrKey = loginStatus ? [cacheKey, true] : null;
  if (!loginStatus) {
  }

  const { data, error, isLoading } = useSWR(
    swrKey,
    () => fetchRoleAndProfile(`${pathname}`, true),
    {
      revalidateOnFocus: config?.revalidateOnFocus ?? false,
      revalidateOnMount: config?.revalidateOnMount ?? false,
      dedupingInterval: config?.dedupingInterval ?? 10000,
      shouldRetryOnError: true,
      errorRetryInterval: 5000,
      errorRetryCount: 3,
      loadingTimeout: 3000,
      onError: (err) => {
        console.log(err);
      },
      ...config,
    }
  );
  if (!loginStatus) {
    mutate([cacheKey, true], undefined, { revalidate: false });
  }
  return {
    data,
    error,
    isLoading,
  };
};

export const post_auth_swr = (
  { item }: { item: useSWRProps },
  config?: SWRConfiguration
) => {
  const { pathname, cacheKey, loginStatus, body } = item;
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(
    loginStatus && body && body.length > 0 ? [cacheKey, loginStatus] : null,
    {
      fetcher: async () =>
        await postFetch({ path: pathname, body: { friend_unique_ID: body } }),
      revalidateOnFocus: config?.revalidateOnFocus ?? false,
      revalidateOnMount: config?.revalidateOnMount ?? false,
      dedupingInterval: config?.dedupingInterval ?? 10000,
      shouldRetryOnError: false,
      errorRetryInterval: 4000,
      errorRetryCount: 3,
      loadingTimeout: 3000,
      onErrorRetry,
      ...config,
    }
  );

  if (!loginStatus) {
    mutate([cacheKey, true], undefined, { revalidate: false });
  }

  return {
    data: userData,
    error: userError,
    isLoading: userLoading,
  };
};

export const flush_regular_swr = () => {
  mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === "booked_order" || key[0] === "group_chat"),
    undefined,
    { revalidate: true, throwOnError: true }
  );
};
