import Holidays from "date-holidays";

const MARKET_CLOSE_HOUR_ET = 16;
const MARKET_OPEN_HOUR_ET = 9;
const MARKET_OPEN_MINUTE_ET = 30;
const CLOSE_SETTLEMENT_GRACE_MINUTES = 120;
const usHolidays = new Holidays("US");

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

const toUsMarketDateKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const toUsMarketDateFromTimestamp = (timestampUtc) => {
  if (!timestampUtc) {
    return null;
  }
  const sourceDate = new Date(timestampUtc);
  if (Number.isNaN(sourceDate.getTime())) {
    return null;
  }
  return toUsMarketDateKey(sourceDate);
};

const getUsDateTimeParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const valueOf = (type) => parts.find((part) => part.type === type)?.value || "";
  const weekdayText = valueOf("weekday");
  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  return {
    dateKey: `${valueOf("year")}-${valueOf("month")}-${valueOf("day")}`,
    weekday: weekdayMap[weekdayText] ?? -1,
    hour: Number(valueOf("hour")),
    minute: Number(valueOf("minute"))
  };
};

const isUsHolidayDate = (dateKey) => {
  if (!isIsoDate(dateKey)) {
    return false;
  }
  return Boolean(usHolidays.isHoliday(dateKey));
};

const previousBusinessDateKey = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (
    date.getUTCDay() === 0 ||
    date.getUTCDay() === 6 ||
    isUsHolidayDate(date.toISOString().slice(0, 10))
  );
  return date.toISOString().slice(0, 10);
};

const getExpectedLatestCloseDateUs = (now = new Date()) => {
  const usNow = getUsDateTimeParts(now);
  if (!isIsoDate(usNow.dateKey) || usNow.weekday < 0) {
    return null;
  }
  if (usNow.weekday === 0 || usNow.weekday === 6) {
    return previousBusinessDateKey(usNow.dateKey);
  }
  const minutesFromMidnight = usNow.hour * 60 + usNow.minute;
  const marketCloseWithGrace =
    MARKET_CLOSE_HOUR_ET * 60 + CLOSE_SETTLEMENT_GRACE_MINUTES;
  if (minutesFromMidnight >= marketCloseWithGrace) {
    return usNow.dateKey;
  }
  return previousBusinessDateKey(usNow.dateKey);
};

const isStaleCloseByUsMarketDate = (timestampUtc, marketDate) => {
  const usNow = getUsDateTimeParts(new Date());
  const minutesFromMidnight = usNow.hour * 60 + usNow.minute;
  const marketOpenMinute = MARKET_OPEN_HOUR_ET * 60 + MARKET_OPEN_MINUTE_ET;
  const marketCloseMinute = MARKET_CLOSE_HOUR_ET * 60;
  const marketCloseWithGraceMinute =
    marketCloseMinute + CLOSE_SETTLEMENT_GRACE_MINUTES;
  const isWeekend = usNow.weekday === 0 || usNow.weekday === 6;
  const isHoliday = isUsHolidayDate(usNow.dateKey);
  let statusLabel = null;
  if (isWeekend || isHoliday) {
    statusLabel = "[미국 장 휴장일]";
  } else if (minutesFromMidnight < marketOpenMinute) {
    statusLabel = "[미국 장 시작 대기]";
  } else if (minutesFromMidnight < marketCloseMinute) {
    statusLabel = "[미국 장 진행 중]";
  } else if (minutesFromMidnight < marketCloseWithGraceMinute) {
    statusLabel = "[미국 장 마감 후 데이터 반영 대기]";
  }

  const sourceMarketDate = isIsoDate(marketDate)
    ? String(marketDate)
    : toUsMarketDateFromTimestamp(timestampUtc);
  if (!sourceMarketDate) {
    return { isStaleClose: false, statusLabel };
  }
  const expectedLatestCloseDate = getExpectedLatestCloseDateUs(new Date());
  if (!expectedLatestCloseDate) {
    return { isStaleClose: false, statusLabel };
  }
  return {
    isStaleClose: sourceMarketDate < expectedLatestCloseDate,
    statusLabel
  };
};

export {
  isStaleCloseByUsMarketDate,
  toUsMarketDateFromTimestamp,
  toUsMarketDateKey
};
