import { useEffect, useState } from "react";
import { formatDistanceToNowStrict, interval, parseISO } from "date-fns";

export const useTimeChanging = (initTime: string | Date, interval = 30000) => {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    if (!initTime) return;
    const data = typeof initTime === "string" ? parseISO(initTime) : initTime;
    const updateTime = () => {
      setTime(
        formatDistanceToNowStrict(time, {
          addSuffix: true,
          roundingMethod: "floor",
          unit: "minute",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, interval);

    return () => clearInterval(timer);
  }, [initTime, interval]);

  return time;
};

export function useHybridTime(timestamp?: string | Date) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (!timestamp) return;

    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    const updateTime = () => {
      const diff = (new Date().getTime() - date.getTime()) / 1000;
      const unit = diff < 60 ? "second" : undefined;
      setTimeAgo(
        formatDistanceToNowStrict(date, {
          addSuffix: true,
          roundingMethod: "floor",
          unit,
        })
      );
    };

    updateTime();
    const interval = setInterval(() => {
      updateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}
