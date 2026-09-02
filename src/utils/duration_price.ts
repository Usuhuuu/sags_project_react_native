import { DurationPrice, HallCategoryType } from "@/types/hall_info_type";
import { HallTypesSeparator } from "@/types/hall_separator_type";

/** Returns the cheapest configured package combination that covers a duration. */
export function calculateDurationPrice(
  prices: DurationPrice[] | undefined,
  durationMinutes: number,
): number | null {
  if (!Array.isArray(prices) || !Number.isFinite(durationMinutes)) return null;

  const target = Math.ceil(durationMinutes);
  if (target <= 0) return null;
  const packages = prices
    .map((item) => ({
      duration: Number(item.durationMinutes),
      price: Number(item.price),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.duration) &&
        item.duration > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0,
    );
  if (packages.length === 0) return null;

  const limit = target + Math.max(...packages.map((item) => item.duration)) - 1;
  const costs: Array<number | undefined> = Array(limit + 1);
  costs[0] = 0;
  for (let duration = 1; duration <= limit; duration += 1) {
    for (const item of packages) {
      const previous = duration - item.duration;
      if (previous < 0 || costs[previous] === undefined) continue;
      const nextCost = costs[previous]! + item.price;
      if (costs[duration] === undefined || nextCost < costs[duration]!) {
        costs[duration] = nextCost;
      }
    }
  }

  let best: number | undefined;
  for (let duration = target; duration <= limit; duration += 1) {
    const cost = costs[duration];
    if (cost !== undefined && (best === undefined || cost < best)) best = cost;
  }
  return best ?? null;
}

export interface HallPriceMapType {
  [HallTypesSeparator.SPORTHALL]: "sport";
  [HallTypesSeparator.BILLIARDHALL]: "esport";
  [HallTypesSeparator.BOWLINGHALL]: "esport";
  [HallTypesSeparator.COMPUTERGAMESHALL]: "esport";
  [HallTypesSeparator.PLAYSTATIONHALL]: "esport";
}

export const hallPriceMap: HallPriceMapType = {
  [HallTypesSeparator.SPORTHALL]: "sport",
  [HallTypesSeparator.BILLIARDHALL]: "esport",
  [HallTypesSeparator.BOWLINGHALL]: "esport",
  [HallTypesSeparator.COMPUTERGAMESHALL]: "esport",
  [HallTypesSeparator.PLAYSTATIONHALL]: "esport",
};

export function getHallTypeFromCategories(hallMain: HallCategoryType[]) {
  if (!hallMain.length) return null;
  const subSet = new Set(hallMain);
  if (
    subSet.has("basket_ball") ||
    subSet.has("foot_ball") ||
    subSet.has("volley_ball")
  )
    return HallTypesSeparator.SPORTHALL;
  if (subSet.has("billiards")) return HallTypesSeparator.BILLIARDHALL;
  if (subSet.has("bowling")) return HallTypesSeparator.BOWLINGHALL;
  if (subSet.has("computer") || subSet.has("playstation"))
    return HallTypesSeparator.COMPUTERGAMESHALL;

  return null;
}
