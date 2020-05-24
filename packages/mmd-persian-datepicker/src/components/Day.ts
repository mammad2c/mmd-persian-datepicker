import moment, { Moment } from "moment-jalaali";
import { constants } from "../configs/constants";
import { mode, ISelectedDates } from "../models/general";

interface IDay {
  date: Moment;
  selectedDates: ISelectedDates;
  minDate?: Moment;
  maxDate?: Moment;
  onClick?: (params: Moment) => void;
  today: Moment;
  isDisabled?: boolean;
  setValue: (dateValue: string | moment.Moment) => void;
  setInRangeDates: (value: Array<Moment>) => void;
  mode: mode;
  format: string;
  multiple: boolean;
  findSelectedDate: (dateValue: Moment | string) => Moment | undefined;
  findInRangeDate: (dateValue: Moment | string) => Moment | undefined;
  handleDaysState: () => void;
  disabledDates: Array<Moment>;
  highlightWeekends: boolean;
  setTempMaxDate: (value: Moment | undefined) => void;
}

interface IDayUpdate {
  selectedDates: IDay["selectedDates"];
  minDate: IDay["minDate"];
  maxDate: IDay["maxDate"];
  mode: IDay["mode"];
  isDisabled?: IDay["isDisabled"];
  format: IDay["format"];
  multiple: IDay["multiple"];
  highlightWeekends: IDay["highlightWeekends"];
  disabledDates: Array<Moment>;
}

class Day {
  private date: IDay["date"];

  private isDisabled?: boolean;

  private onClick?: IDay["onClick"];

  private today: IDay["today"];

  private mode: IDay["mode"];

  private selectedDates: IDay["selectedDates"];

  private minDate: IDay["minDate"];

  private maxDate: IDay["maxDate"];

  private setValue: IDay["setValue"];

  private format: IDay["format"];

  private setInRangeDates: IDay["setInRangeDates"];

  private dayElem: HTMLSpanElement;

  private multiple: IDay["multiple"];

  private findSelectedDate: IDay["findSelectedDate"];

  private findInRangeDate: IDay["findInRangeDate"];

  private handleDaysState: IDay["handleDaysState"];

  private disabledDates: IDay["disabledDates"];

  private highlightWeekends: IDay["highlightWeekends"];

  private setTempMaxDate: IDay["setTempMaxDate"];

  constructor({
    date,
    onClick,
    minDate,
    maxDate,
    today,
    isDisabled,
    mode,
    selectedDates,
    setValue,
    format,
    setInRangeDates,
    multiple,
    findSelectedDate,
    findInRangeDate,
    handleDaysState,
    disabledDates,
    highlightWeekends,
    setTempMaxDate,
  }: IDay) {
    this.date = date;
    this.onClick = onClick;
    this.today = today;
    this.mode = mode;
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.selectedDates = selectedDates;
    this.setValue = setValue;
    this.format = format;
    this.setInRangeDates = setInRangeDates;
    this.dayElem = document.createElement("span");
    this.multiple = multiple;
    this.findSelectedDate = findSelectedDate;
    this.findInRangeDate = findInRangeDate;
    this.handleDaysState = handleDaysState;
    this.isDisabled = isDisabled;
    this.handleDisable();
    this.disabledDates = disabledDates;
    this.highlightWeekends = highlightWeekends;
    this.setTempMaxDate = setTempMaxDate;
  }

  private handleOnDayClick = (): void => {
    const { isDisabled } = this;

    if (isDisabled) {
      return;
    }

    const {
      date,
      setValue,
      mode,
      onClick,
      setInRangeDates,
      disabledDates,
    } = this;

    if (mode === "range") {
      setInRangeDates([date.clone().add(1, "d")]);

      if (disabledDates && disabledDates.length !== 0) {
        let tempMaxDate: Moment | undefined;
        let j = 0;

        while (!tempMaxDate && j < disabledDates.length) {
          const disabledDate = disabledDates[j];
          if (disabledDate.isAfter(date)) {
            tempMaxDate = disabledDate.clone().subtract(1, "d");
          }
          j += 1;
        }

        if (tempMaxDate) {
          this.setTempMaxDate(tempMaxDate);
          this.handleDaysState();
        }
      }
    } else {
      setInRangeDates([]);
    }

    setValue(date);

    if (typeof onClick === "function") {
      onClick(date);
    }
  };

  private handleOnDayHover = (): void => {
    const { isDisabled, mode } = this;

    if (isDisabled || mode === "single") {
      return;
    }

    const {
      selectedDates,
      date,
      setInRangeDates,
      handleDaysState,
      disabledDates,
    } = this;
    const startDate = selectedDates[0];
    const endDate = selectedDates[1];

    if (!startDate || endDate) {
      return;
    }

    const diff = date.diff(startDate, "d");

    if (diff === 0) {
      return;
    }

    const diffMomented: Moment[] = [];
    let maxDate: Moment | undefined;

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        const momentedDiff = startDate.clone().add(i, "d");

        if (disabledDates && disabledDates.length !== 0) {
          let j = 0;
          while (!maxDate && j < disabledDates.length) {
            const disabledDate = disabledDates[j];
            if (disabledDate.isAfter(momentedDiff)) {
              maxDate = disabledDate.clone().subtract(1, "d");
            }
            j += 1;
          }
        }

        diffMomented.push(momentedDiff);
      }
    }

    if (maxDate) {
      this.setTempMaxDate(maxDate);
    }

    setInRangeDates([...diffMomented]);
    handleDaysState();
  };

  private handleDisable = (): void => {
    const { isDisabled, minDate, maxDate, date } = this;
    if (isDisabled || this.isInDisabledDates()) {
      this.isDisabled = true;
    } else if (minDate && date.isBefore(minDate, "d")) {
      this.isDisabled = true;
    } else if (maxDate && date.isAfter(maxDate, "d")) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  };

  private isInDisabledDates = (value?: Moment): boolean => {
    const { disabledDates, date } = this;

    if (!disabledDates) {
      return false;
    }

    if (value) {
      return !!disabledDates.find(() => date.isSame(value, "d"));
    }

    return !!disabledDates.find((item) => date.isSame(item, "d"));
  };

  private handleClassNames = (): void => {
    const { dayElem, date, selectedDates, mode } = this;
    dayElem.classList.add(constants.dayItemClassName);
    const startDate = selectedDates[0];

    if (this.isDisabled) {
      dayElem.classList.add(constants.disabledDayItemClassName);
      dayElem.classList.remove(constants.selectedDayItemClassName);
      dayElem.classList.remove(constants.inRangeDayItemClassName);
    } else {
      const foundedSelectedDate = this.findSelectedDate(date);
      dayElem.classList.remove(constants.disabledDayItemClassName);

      if (date.isSame(new Date(), "d")) {
        dayElem.classList.add(constants.todayClassName);
      } else if (dayElem.classList.contains(constants.todayClassName)) {
        dayElem.classList.remove(constants.todayClassName);
      }

      if (
        dayElem.classList.contains(constants.selectedDayItemClassName) &&
        !foundedSelectedDate
      ) {
        dayElem.classList.remove(constants.selectedDayItemClassName);
      } else if (foundedSelectedDate) {
        dayElem.classList.add(constants.selectedDayItemClassName);
      }

      if (this.multiple && foundedSelectedDate) {
        dayElem.classList.add(constants.selectedDayItemClassName);
      } else if (this.multiple && !foundedSelectedDate) {
        dayElem.classList.remove(constants.selectedDayItemClassName);
      }

      if (mode === "range" && startDate) {
        const isInRange = this.findInRangeDate(date);
        if (isInRange) {
          dayElem.classList.add(constants.inRangeDayItemClassName);
        } else {
          dayElem.classList.remove(constants.inRangeDayItemClassName);
        }
      } else if (mode === "range" && !startDate) {
        dayElem.classList.remove(constants.inRangeDayItemClassName);
      }
    }

    if (this.highlightWeekends && date.day() === 5) {
      dayElem.classList.add(constants.weekendDayItemClassName);
    } else {
      dayElem.classList.remove(constants.weekendDayItemClassName);
    }
  };

  private handleListeners = (): void => {
    const { isDisabled, dayElem, mode } = this;

    if (isDisabled) {
      dayElem.removeEventListener("click", this.handleOnDayClick);

      if (mode === "range") {
        dayElem.removeEventListener("mouseenter", this.handleOnDayHover);
      }
    } else {
      dayElem.addEventListener("click", this.handleOnDayClick);

      if (mode === "range") {
        dayElem.addEventListener("mouseenter", this.handleOnDayHover);
      }
    }
  };

  public getDate = (): Moment => {
    return this.date;
  };

  public updateDayState = ({
    minDate,
    maxDate,
    mode,
    selectedDates,
    isDisabled,
    format,
    disabledDates,
    multiple,
  }: IDayUpdate): void => {
    this.mode = mode;
    this.minDate = minDate;
    this.selectedDates = selectedDates;
    this.maxDate = maxDate;
    this.format = format;
    this.multiple = multiple;
    this.isDisabled = isDisabled;
    this.disabledDates = disabledDates;
    this.handleDisable();
    this.handleClassNames();
    this.handleListeners();
  };

  public render(): HTMLSpanElement {
    const { date, dayElem } = this;
    const dayElemText = document.createTextNode(`${date.jDate()}`);

    dayElem.appendChild(dayElemText);
    this.handleDisable();
    this.handleClassNames();
    this.handleListeners();

    return dayElem;
  }
}

export default Day;
