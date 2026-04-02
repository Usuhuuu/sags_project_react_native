import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

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
