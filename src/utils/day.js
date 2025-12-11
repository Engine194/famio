export const daysMap = new Map([
  ["en", ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]],
  ["vi", ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]],
]);

export const padZero = (value, maxSize = 2) => {
  return (+value).toString().padStart(maxSize, "0");
};

export const timeSelections = {
  hour: Array.from({ length: 24 }).map((_, index) => index),
  minute: Array.from({ length: 60 }).map((_, index) => index),
};

export const combineTimeComponents = (components) => {
  const { hour = 0, minute = 0 } = components || {};
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Parses a time string in the format 'hh:mm:ss' and returns an object
 * with numeric hour, minute, and second properties.
 *
 * @param {string} timeString - The time string to parse (e.g., '12:34:56').
 * @returns {{ hour: number, minute: number }} The parsed time components.
 */
export const getTimeComponents = (timeString) => {
  // timeString: hh:mm:ss
  const components = timeString.split(":");
  return {
    hour: Number(components[0]),
    minute: Number(components[1]),
  };
};

export const convertUTCTimeToLocal = (configedTime) => {
  const { hour, minute } = getTimeComponents(configedTime);
  const now = new Date();
  const dateString = `${padZero(now.getFullYear(), 4)}-${padZero(
    now.getMonth() + 1
  )}-${padZero(now.getDate())}T${padZero(hour)}:${padZero(minute)}:00.000Z`;
  const configedDate = new Date(dateString);
  return `${padZero(configedDate.getHours())}:${padZero(
    configedDate.getMinutes()
  )}`;
};

export const convertLocalTimeToUTC = (timeLocal) => {
  const { hour, minute } = getTimeComponents(timeLocal);
  const now = new Date();
  now.setHours(hour);
  now.setMinutes(minute);
  return `${padZero(now.getUTCHours())}:${padZero(now.getUTCMinutes())}`;
};

/**
 * Converts a GMT/UTC offset string (like "+HH:MM" or "-HH:MM") to total minutes.
 * @param {string} offsetString - The offset string (e.g., "-12:00").
 * @returns {number} The total offset in minutes (e.g., -720).
 */
export const offsetToMinutes = (offsetString) => {
  // 1. Determine the sign (e.g., -1 for negative, 1 for positive)
  const sign = offsetString.startsWith("-") ? -1 : 1;

  // 2. Extract the absolute hours and minutes part (e.g., "12:00")
  const parts = offsetString.substring(1).split(":");

  // 3. Convert parts to numbers
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  // 4. Calculate total minutes and apply the sign
  const totalMinutes = (hours * 60 + minutes) * sign;

  return totalMinutes;
};

export const fullTimezone = [
  {
    offset: "-12:00",
    example_locations: ["Baker Island (unpopulated)"],
  },
  {
    offset: "-11:00",
    example_locations: ["Samoa (Standard Time)", "Midway Atoll", "Niue"],
  },
  {
    offset: "-10:00",
    example_locations: ["Hawaii", "Tahiti", "Cook Islands"],
  },
  {
    offset: "-09:30",
    example_locations: ["Marquesas Islands"],
  },
  {
    offset: "-09:00",
    example_locations: ["Alaska (Standard Time)", "Gambier Islands"],
  },
  {
    offset: "-08:00",
    example_locations: ["Pacific Standard Time (e.g., Los Angeles, Vancouver)"],
  },
  {
    offset: "-07:00",
    example_locations: ["Mountain Standard Time (e.g., Denver, Phoenix)"],
  },
  {
    offset: "-06:00",
    example_locations: [
      "Central Standard Time (e.g., Chicago, Mexico City)",
      "Costa Rica",
    ],
  },
  {
    offset: "-05:00",
    example_locations: [
      "Eastern Standard Time (e.g., New York, Toronto)",
      "Bogota",
      "Lima",
    ],
  },
  {
    offset: "-04:30",
    example_locations: ["Caracas, Venezuela"],
  },
  {
    offset: "-04:00",
    example_locations: [
      "Atlantic Standard Time (e.g., Halifax)",
      "Barbados",
      "La Paz",
    ],
  },
  {
    offset: "-03:30",
    example_locations: ["Newfoundland, Canada"],
  },
  {
    offset: "-03:00",
    example_locations: ["Buenos Aires", "Sao Paulo", "Greenland (most areas)"],
  },
  {
    offset: "-02:00",
    example_locations: ["South Georgia and the South Sandwich Islands"],
  },
  {
    offset: "-01:00",
    example_locations: ["Cape Verde", "Azores"],
  },
  {
    offset: "+00:00",
    example_locations: [
      "London (Winter)",
      "Dublin (Winter)",
      "Iceland",
      "Ghana",
      "Lisbon",
    ],
  },
  {
    offset: "+01:00",
    example_locations: [
      "Central European Time (e.g., Paris, Berlin)",
      "West Africa Time",
    ],
  },
  {
    offset: "+02:00",
    example_locations: [
      "Eastern European Time (e.g., Cairo, Athens)",
      "South Africa",
      "Israel",
    ],
  },
  {
    offset: "+03:00",
    example_locations: ["Moscow", "Baghdad", "Kuwait", "Nairobi"],
  },
  {
    offset: "+03:30",
    example_locations: ["Tehran, Iran"],
  },
  {
    offset: "+04:00",
    example_locations: ["Dubai", "Abu Dhabi", "Tbilisi", "Yerevan"],
  },
  {
    offset: "+04:30",
    example_locations: ["Kabul, Afghanistan"],
  },
  {
    offset: "+05:00",
    example_locations: ["Pakistan", "Tashkent", "Maldives"],
  },
  {
    offset: "+05:30",
    example_locations: ["India", "Sri Lanka"],
  },
  {
    offset: "+05:45",
    example_locations: ["Kathmandu, Nepal"],
  },
  {
    offset: "+06:00",
    example_locations: ["Bangladesh", "Almaty", "Yekaterinburg"],
  },
  {
    offset: "+06:30",
    example_locations: ["Myanmar (Burma)", "Cocos Islands"],
  },
  {
    offset: "+07:00",
    example_locations: ["Bangkok", "Hanoi", "Jakarta", "Novosibirsk"],
  },
  {
    offset: "+08:00",
    example_locations: ["China", "Singapore", "Hong Kong", "Perth"],
  },
  {
    offset: "+08:45",
    example_locations: ["Eucla, Australia"],
  },
  {
    offset: "+09:00",
    example_locations: ["Tokyo", "Seoul", "Irkutsk"],
  },
  {
    offset: "+09:30",
    example_locations: ["Adelaide", "Darwin, Australia"],
  },
  {
    offset: "+10:00",
    example_locations: ["Sydney (Winter)", "Brisbane", "Guam", "Vladivostok"],
  },
  {
    offset: "+10:30",
    example_locations: ["Lord Howe Island, Australia"],
  },
  {
    offset: "+11:00",
    example_locations: ["Solomon Islands", "New Caledonia"],
  },
  {
    offset: "+11:30",
    example_locations: ["Norfolk Island"],
  },
  {
    offset: "+12:00",
    example_locations: ["Fiji", "Auckland (Winter)", "Marshall Islands"],
  },
  {
    offset: "+12:45",
    example_locations: ["Chatham Islands, New Zealand"],
  },
  {
    offset: "+13:00",
    example_locations: ["Tonga", "Phoenix Islands"],
  },
  {
    offset: "+14:00",
    example_locations: ["Kiribati (Line Islands)"],
  },
];

export const getBrowserTimeZone = () => {
  const now = new Date();
  const offset = - now.getTimezoneOffset();
  const index = fullTimezone.findIndex(
    (item) => offsetToMinutes(item.offset) === offset
  );
  return index;
};
