import useSWR, { SWRConfiguration } from "swr";
import {
  fetchRoleAndProfile,
  normalFetch,
  postFetch,
} from "@/hooks/profile_data_fetch";

interface useSWRProps {
  pathname: string;
  cacheKey: string;
  loginStatus: boolean;
  body?: string[];
}

const onErrorRetry = (
  error: any,
  key: string,
  config: SWRConfiguration,
  revalidate: () => void,
  { retryCount }: { retryCount: number }
) => {
  if (retryCount >= 5) return;
  setTimeout(() => revalidate(), 3000);
};

export const regular_swr = (
  { item }: { item: useSWRProps },
  config?: SWRConfiguration
) => {
  const { pathname, cacheKey, loginStatus } = item;
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(loginStatus ? [cacheKey, loginStatus] : null, {
    fetcher: () => normalFetch(`${pathname}`),
    revalidateOnFocus: config?.revalidateOnFocus ?? false,
    dedupingInterval: config?.dedupingInterval ?? 10000,
    shouldRetryOnError: true,
    revalidateOnMount: config?.revalidateOnMount ?? true,
    errorRetryCount: 3,
    loadingTimeout: 3000,
    onErrorRetry,
    ...config,
  });

  return {
    data: userData,
    error: userError,
    isLoading: userLoading,
  };
};

export const auth_swr = (
  { item }: { item: useSWRProps },
  config?: SWRConfiguration
) => {
  const { pathname, cacheKey, loginStatus } = item;
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(loginStatus ? [cacheKey, loginStatus] : null, {
    fetcher: () => fetchRoleAndProfile(`${pathname}`, loginStatus ?? false),
    revalidateOnFocus: config?.revalidateOnFocus ?? false,
    revalidateOnMount: config?.revalidateOnMount ?? false,
    dedupingInterval: config?.dedupingInterval ?? 10000,
    shouldRetryOnError: true,
    errorRetryInterval: 4000,
    errorRetryCount: 3,
    loadingTimeout: 3000,
    onErrorRetry,
    ...config,
  });

  return {
    data: userData,
    error: userError,
    isLoading: userLoading,
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

  return {
    data: userData,
    error: userError,
    isLoading: userLoading,
  };
};
