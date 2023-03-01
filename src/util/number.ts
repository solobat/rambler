export function fixNumber(val: string | number | null) {
  if (!val) {
    return "--";
  }

  return typeof val === "string"
    ? val
    : Math.abs(val) < 1000
    ? val.toFixed(2)
    : formatNumber(val);
}

export function formatNumber(n) {
  const language = "en";

  return Intl.NumberFormat(language, { notation: "compact" }).format(n);
}
