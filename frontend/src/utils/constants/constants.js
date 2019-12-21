export const MIN_CARD_NUMBER_IN_COLUMN = 0;

export const IS_CONSOLE_LOG_OPEN = true;

export const TOAPPLY = "toApply";
export const APPLIED = "applied";
export const PHONESCREEN = "phoneScreen";
export const ONSITEINTERVIEW = "onsiteInterview";
export const OFFER = "offer";

export const UPDATE_APPLICATION_STATUS = {
  [APPLIED]: {
    id: 1,
    value: "APPLIED"
  },
  [TOAPPLY]: {
    id: 2,
    value: "TO APPLY"
  },
  [PHONESCREEN]: {
    id: 3,
    value: "PHONE SCREEN"
  },
  [ONSITEINTERVIEW]: {
    id: 4,
    value: "ONSITE INTERVIEW"
  },
  [OFFER]: {
    id: 5,
    value: "OFFER"
  }
};

export const APPLICATION_STATUSES_IN_ORDER = [
  {
    id: "applied",
    name: "Applied",
    icon: "../../src/assets/icons/AppliedIcon@3x.png"
  },
  {
    id: "toApply",
    name: "To Apply",
    icon: "../../src/assets/icons/ToApplyIcon@3x.png"
  },
  {
    id: "phoneScreen",
    name: "Phone Screen",
    icon: "../../src/assets/icons/PhoneScreenIcon@3x.png"
  },
  {
    id: "onsiteInterview",
    name: "Onsite Interview",
    icon: "../../src/assets/icons/OnsiteInterviewIcon@3x.png"
  },
  {
    id: "offer",
    name: "Offer",
    icon: "../../src/assets/icons/OffersIcon@3x.png"
  }
];

export const TRENDING_STATUS_OPTIONS = [
  {
    id: 0,
    value: "All Applied",
    param: ""
  },
  {
    id: 2,
    value: "To Apply",
    param: "&status_id=2"
  },
  {
    id: 1,
    value: "Applied",
    param: "&status_id=1"
  },
  {
    id: 3,
    value: "Phone Screen",
    param: "&status_id=3"
  },
  {
    id: 4,
    value: "Onsite Interview",
    param: "&status_id=4"
  },
  {
    id: 5,
    value: "Offer",
    param: "&status_id=5"
  }
];

export const TRENDING_YEAR_OPTIONS = [
  {
    id: 0,
    value: "2019",
    param: "&year=2019"
  },
  {
    id: 1,
    value: "2018",
    param: "&year=2018"
  },
  {
    id: 2,
    value: "Lifetime",
    param: ""
  }
];

export const TRENDING_COUNT_OPTIONS = [
  {
    id: 0,
    value: "10",
    param: "&count=10"
  },
  {
    id: 1,
    value: "20",
    param: "&count=20"
  },
  {
    id: 2,
    value: "30",
    param: "&count=30"
  }
];

export const TRENDING_TYPE_OPTIONS = [
  {
    id: 0,
    value: "Applicants",
    param: "/api/metrics/get_top_companies"
  },
  {
    id: 1,
    value: "Positions",
    param: "/api/metrics/get_top_positions"
  }
];

export const VISIBILITY_FILTERS = {
  ALL: "all",
  COMPLETED: "completed",
  INCOMPLETE: "incomplete"
};

export const USER_TYPES = {
  undefined: 1,
  public: 2,
  student: 3,
  alumni: 4,
  career_services: 5
};

export const USER_TYPE_NAMES = {
  1: { name: "Undefined", header: "Undefined" },
  2: { name: "Public", header: "Public" },
  3: { name: "Student", header: "School" },
  4: { name: "Alumni", header: "Alumni" },
  5: { name: "Career Services", header: "Career Services" },
  6: { name: "Recruiter", header: "Recruiter" }
};

export function makeTimeBeautiful(time, type = "date") {
  var beautiful_time = "";
  var dateFull = time.toString().split("T");
  var datePart = dateFull[0].split("-");
  var monthsList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var fullMonthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var fullDaysList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  var beautifulDatePart =
    datePart[2] +
    "-" +
    monthsList[parseInt(datePart[1]) - 1] +
    "-" +
    datePart[0];
  var beautifulLongDatePart =
    fullDaysList[new Date(time).getDay()] +
    ", " +
    fullMonthsList[parseInt(datePart[1]) - 1] +
    " " +
    datePart[2] +
    ", " +
    datePart[0];
  if (type == "date" || dateFull[1] == undefined) {
    beautiful_time = beautifulDatePart;
  }
  if (type == "dateandtime" && dateFull[1] != undefined) {
    var time_part = dateFull[1].split(":");
    beautiful_time =
      beautifulDatePart + " at " + time_part[0] + ":" + time_part[1];
  }
  if (type == "longDate") {
    beautiful_time = beautifulLongDatePart;
  } else {
    beautiful_time = beautiful_time;
  }
  return beautiful_time;
}
