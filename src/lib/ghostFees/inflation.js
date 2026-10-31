// ABS Consumer Price Index, Australia: 3.5% over the year to July 2026.
// Update this ONE constant before submitting; every screen reads it.
export const CPI = {
  rate: 3.5,
  asOf: 'July 2026',
};

// A subscription's own rise, as a percentage, one decimal.
export function risePercent(oldPrice, newPrice) {
  if (!(oldPrice > 0)) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
}

export function versusCpi(oldPrice, newPrice) {
  const percent = risePercent(oldPrice, newPrice);
  return { percent, above: percent > CPI.rate };
}