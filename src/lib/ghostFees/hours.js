// Turns a leak total into hours of the user's own work.
// Hourly pay = monthly pay x 12 / 52 weeks / 38-hour week.

export const HOURS_PER_WEEK = 38;

export function hourlyFromMonthly(monthly) {
  const pay = Number(monthly) || 0;
  if (pay <= 0) return 0;
  return Math.round(((pay * 12) / 52 / HOURS_PER_WEEK) * 100) / 100;
}

export function hoursOfWork(total, hourly) {
  const pay = Number(hourly) || 0;
  if (pay <= 0) return 0;
  return Math.round(((Number(total) || 0) / pay) * 10) / 10;
}