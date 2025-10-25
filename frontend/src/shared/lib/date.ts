const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

type DateInput = Date | number | string;

const toDate = (value: DateInput): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  return new Date(value);
};

export const formatDateTime = (value: DateInput) => dateTimeFormatter.format(toDate(value));

const RELATIVE_UNITS = [
  { limit: 60, divisor: 1, unit: "сек" },
  { limit: 3600, divisor: 60, unit: "мин" },
  { limit: 86400, divisor: 3600, unit: "ч" },
  { limit: 604800, divisor: 86400, unit: "дн" },
  { limit: 2629800, divisor: 604800, unit: "нед" },
  { limit: 31557600, divisor: 2629800, unit: "мес" },
  { limit: Infinity, divisor: 31557600, unit: "г" },
] as const;

export const formatRelativeTimeFromNow = (value: DateInput, now: DateInput = Date.now()) => {
  const target = toDate(value).getTime();
  const base = toDate(now).getTime();
  const diffSeconds = Math.max(0, Math.round((base - target) / 1000));

  for (const { limit, divisor, unit } of RELATIVE_UNITS) {
    if (diffSeconds < limit) {
      const amount = Math.max(1, Math.round(diffSeconds / divisor));
      return `~${amount} ${unit} назад`;
    }
  }

  return "давно";
};
