export function formatCurrency(value: number | null, currency = "USD", digits = 2) {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    notation: Math.abs(value) >= 1_000_000_000 ? "compact" : "standard",
  }).format(value);
}

export function formatNumber(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    notation: Math.abs(value) >= 1_000_000 ? "compact" : "standard",
  }).format(value);
}

export function formatPercent(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) {
    return "Unavailable";
  }

  const formatted = `${Math.abs(value).toFixed(digits)}%`;

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRange(low: number | null, high: number | null, currency = "USD") {
  if (low === null || high === null) {
    return "Unavailable";
  }

  return `${formatCurrency(low, currency)} - ${formatCurrency(high, currency)}`;
}
