import { Moment } from "moment-jalaali";

export type ISelectedDates = Array<Moment>;

export interface IElemPosition {
  x: number;
  y: number;
}

export type mode = "single" | "range";

export type disabledDates = Array<Moment | string | Date>;

export type dateValue = Moment | Date | string;

export interface IOptions<T> {
  // configs
  defaultValue?: dateValue[] | dateValue | boolean;
  autoClose: boolean;
  mode: mode;
  multiple: boolean;
  multipleSeparator: string;
  rangeSeparator: string;
  numberOfMonths: number;
  minDate?: boolean | Moment | Date | string | null;
  maxDate?: boolean | Moment | Date | string | null;
  timeout: number;
  format: string;
  disabledDates: disabledDates;
  inline: boolean;
  highlightWeekends: boolean;
  classNames?: {
    wrapperClassName?: string;
    baseClassName?: string;
    inlineClassName?: string;
    monthWrapperClassName?: string;
    rtlClassName?: string;
    ltrClassName?: string;
    // headers class name?:
    headerClassName?: string;
    arrowsClassName?: string;
    arrowsRightClassName?: string;
    arrowsLeftClassName?: string;
    titleClassName?: string;
    titleMonthClassName?: string;
    titleYearClassName?: string;
    // body class name?:
    bodyClassName?: string;
    weeksClassName?: string;
    weekItemClassName?: string;
    daysClassName?: string;
    dayItemClassName?: string;
    selectedDayItemClassName?: string;
    inRangeDayItemClassName?: string;
    todayClassName?: string;
    disabledDayItemClassName?: string;
    offsetDayItemClassName?: string;
    weekendDayItemClassName?: string;
    // footer class name?:
    footerClassName?: string;
  };
  arrows: {
    left: string;
    right: string;
  };
  weekNames: Array<string>;
  monthNames: Array<string>;
  // events:
  onClick?: (selectedDate: ISelectedDates, self: T) => void;
  onChange?: (selectedDate: ISelectedDates, self: T) => void;
}
