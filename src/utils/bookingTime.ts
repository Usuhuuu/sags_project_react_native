/**
 * Time-slot helpers shared by the booking flow.
 *
 * Slot strings look like "09:00~10:00". The last slot of the day ends at
 * midnight, which is written "00:00" (e.g. "23:00~00:00") — the same "00:00"
 * a 24-hour hall would use for a slot STARTING at midnight. To compute a
 * duration we must only treat a trailing "~00:00" as the end of the day
 * (24:00); otherwise selections reaching midnight compute negative hours
 * (0 - 9 = -9) and a broken price.
 */
export const normalizeSlotEnd = (slot: string): string =>
  slot.replace(/~00:00$/, "~24:00");

/** Start time ("HH:mm") of a slot string. */
export const slotStart = (slot: string): string =>
  normalizeSlotEnd(slot).split("~")[0];

/** End time ("HH:mm", midnight normalized to "24:00") of a slot string. */
export const slotEnd = (slot: string): string =>
  normalizeSlotEnd(slot).split("~")[1];

/** Duration in hours between a group's first start and last end. */
export const groupDurationHours = (group: string[]): number => {
  if (!group || group.length === 0) return 0;
  const toHour = (time: string): number => {
    const [hourStr] = time.split(":");
    return parseInt(hourStr, 10);
  };
  const startTime = slotStart(group[0]);
  const endTime = slotEnd(group[group.length - 1]);
  return toHour(endTime) - toHour(startTime);
};
