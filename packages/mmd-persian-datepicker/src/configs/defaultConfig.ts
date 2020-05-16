import Datepicker from "../Datepicker";
import { IOptions } from "../types";
import { constants } from "./constants";

export const defaultOptionsValue: IOptions<Datepicker> = {
  defaultValue: false,
  autoClose: false,
  multiple: false,
  mode: "single",
  multipleSeparator: " - ",
  rangeSeparator: " - ",
  numberOfMonths: 1,
  minDate: new Date(),
  maxDate: false,
  timeout: 250,
  format: "jYYYY/jM/jD",
  disabledDates: [],
  inline: false,
  classNames: {
    baseClassName: constants.baseClassName,
    inlineClassName: constants.inlineClassName,
    monthWrapperClassName: constants.monthWrapperClassName,
    // headers class name:
    headerClassName: constants.headerClassName,
    arrowsClassName: constants.arrowsClassName,
    arrowsRightClassName: constants.arrowsRightClassName,
    arrowsLeftClassName: constants.arrowsLeftClassName,
    titleClassName: constants.titleClassName,
    titleMonthClassName: constants.titleMonthClassName,
    titleYearClassName: constants.titleYearClassName,
    // body class name:
    bodyClassName: constants.bodyClassName,
    weeksClassName: constants.weeksClassName,
    weekItemClassName: constants.weekItemClassName,
    daysClassName: constants.daysClassName,
    dayItemClassName: constants.dayItemClassName,
    selectedDayItemClassName: constants.selectedDayItemClassName,
    inRangeDayItemClassName: constants.inRangeDayItemClassName,
    todayClassName: constants.todayClassName,
    disabledDayItemClassName: constants.disabledDayItemClassName,
    // footer class name:
    footerClassName: constants.footerClassName,
  },
  arrows: {
    left:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477.175 477.175"><path d="M145.188 238.575l215.5-215.5c5.3-5.3 5.3-13.8 0-19.1s-13.8-5.3-19.1 0l-225.1 225.1c-5.3 5.3-5.3 13.8 0 19.1l225.1 225c2.6 2.6 6.1 4 9.5 4s6.9-1.3 9.5-4c5.3-5.3 5.3-13.8 0-19.1l-215.4-215.5z"/></svg>',
    right:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477.175 477.175"><path d="M360.731 229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1 0s-5.3 13.8 0 19.1l215.5 215.5-215.5 215.5c-5.3 5.3-5.3 13.8 0 19.1 2.6 2.6 6.1 4 9.5 4 3.4 0 6.9-1.3 9.5-4l225.1-225.1c5.3-5.2 5.3-13.8.1-19z"/></svg>',
  },
  weekName: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
  monthNames: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
};
