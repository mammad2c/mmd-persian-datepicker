import moment, { Moment } from "moment-jalaali";

// library imports
import {
  IElemPosition,
  IOptions,
  ISelectedDates,
  ISelectedDateItem,
} from "../models/general";
import Day from "./Day";
import { getValueObject } from "../utils/getValueObject";
import { getValidatedMoment } from "../utils/getValidatedMoment";
import { defaultOptionsValue } from "../configs/defaultOptionsValue";

class PrivateDatepicker {
  // constructor elements
  private elem: HTMLInputElement | HTMLElement;

  private options: IOptions<Datepicker>;

  private pickerPrivater: Datepicker;

  // rests
  private elemId: string;

  private elemPosition?: IElemPosition;

  private calendarElem: HTMLElement;

  private today: Moment;

  private todayMonth: number;

  private todayYear: number;

  private currentYear: number;

  private currentMonth: number;

  private selectedDates: ISelectedDates = [];

  private inRangeDates: Array<ISelectedDateItem["momented"]> = [];

  private timeoutTemp?: NodeJS.Timeout | number;

  private isOpen: boolean;

  private minDate?: Moment;

  private maxDate?: Moment;

  private tempMaxDate?: Moment;

  private days: Array<Day> = [];

  private disabledDates: Array<Moment>;

  constructor(
    elem: string,
    pickerPrivater: Datepicker,
    options?: IOptions<Datepicker>
  ) {
    this.elemId = elem;
    const elemExist = document.querySelector(elem) as HTMLInputElement;

    if (!elemExist) {
      throw Error(`the ${elem} not found in your dom`);
    } else {
      this.elem = elemExist;
    }

    this.options = Object.assign(defaultOptionsValue, options);
    this.pickerPrivater = pickerPrivater;
    this.calendarElem = document.createElement("div");
    this.today = moment(new Date());
    this.todayMonth = this.today.jMonth();
    this.todayYear = this.today.jYear();
    this.currentMonth = this.todayMonth;
    this.currentYear = this.todayYear;
    this.isOpen = false;
    this.disabledDates = [];
    this.handleClickOutside();
    this.validateDisabledDates();

    const { minDate, defaultValue, format, maxDate } = this.options;

    if (defaultValue) {
      const momentedDefaultValue = this.getMomented(
        moment(
          typeof defaultValue === "boolean" ? new Date() : defaultValue
        ).format(format)
      );

      this.currentMonth = momentedDefaultValue.jMonth();
      this.currentYear = momentedDefaultValue.jYear();

      this.setValue(momentedDefaultValue);
    }

    if (minDate === true) {
      this.minDate = moment(new Date());
    } else if (minDate && minDate instanceof Date) {
      this.minDate = moment(minDate);
    } else if (minDate && !moment.isMoment(minDate)) {
      this.minDate = moment(minDate, format);
    } else {
      this.minDate = undefined;
    }

    if (maxDate === true) {
      this.maxDate = moment(new Date());
    } else if (maxDate && maxDate instanceof Date) {
      this.maxDate = moment(maxDate);
    } else if (maxDate && !moment.isMoment(maxDate)) {
      this.maxDate = moment(maxDate, format);
    } else {
      this.maxDate = undefined;
    }

    this.tempMaxDate = undefined;
    this.createElement();

    if (!this.options.inline) {
      window.addEventListener("resize", this.handleResize);
    }
  }

  private handleResize = (): void => {
    if (!this.isOpen) {
      return;
    }
    if (typeof this.timeoutTemp === "number") {
      clearTimeout(this.timeoutTemp);
    }
    this.timeoutTemp = setTimeout(this.setPosition, this.options.timeout);
  };

  private calculateDaysInCurrentMonth = (additional = 0): number[] => {
    const { currentYear, currentMonth } = this;
    const monthOverflow = this.isMonthOverflow(additional);
    const month = monthOverflow ? 1 : currentMonth + additional;
    const year = monthOverflow ? currentYear + 1 : currentYear;

    const totalDays = moment.jDaysInMonth(year, month);
    const daysInCurrentMonth: number[] = [];
    for (let i = 1; i <= totalDays; i += 1) {
      daysInCurrentMonth.push(i);
    }
    return daysInCurrentMonth;
  };

  private calculateFirstDayOfMonth = (additional = 0): string => {
    const { currentMonth, currentYear } = this;
    const monthOverflow = this.isMonthOverflow(additional);
    const month = monthOverflow ? 1 : currentMonth + additional;
    const year = monthOverflow ? currentYear + 1 : currentYear;
    const firstDayOfMonth = moment(`${year}/${month + 1}/1`, "jYYYY/jM/jD")
      .day()
      .toString();
    const weekFa = ["1", "2", "3", "4", "5", "6", "0"];

    return weekFa[+firstDayOfMonth];
  };

  private createElement = (): void => {
    const { classNames, numberOfMonths, inline } = this.options;

    this.calendarElem.setAttribute(
      "id",
      `${this.elem.getAttribute("id")}-calendar`
    );
    this.calendarElem.classList.add(classNames.baseClassName);

    if (inline) {
      this.calendarElem.classList.add(classNames.inlineClassName);
      this.addOpenClass();
    }

    // remove any previous data in calendar elem
    while (this.calendarElem.firstChild) {
      this.calendarElem.removeChild(this.calendarElem.firstChild);
    }

    // create arrows
    const { arrowLeft, arrowRight } = this.createArrowsNavigation();
    this.calendarElem.appendChild(arrowRight);
    this.calendarElem.appendChild(arrowLeft);

    this.days = [];
    // append header and body for calendar
    for (let index = 0; index < numberOfMonths; index += 1) {
      const monthWrapper = this.createMonthWrapper();
      monthWrapper.appendChild(this.createHeader(index));
      monthWrapper.appendChild(this.createBody(index));
      this.calendarElem.appendChild(monthWrapper);
    }

    if (inline) {
      this.elem.appendChild(this.calendarElem);
    } else {
      document.body.appendChild(this.calendarElem);
    }

    this.handleDaysState();
    this.elem.addEventListener("click", this.open);
  };

  private createMonthWrapper = (): HTMLElement => {
    const { options } = this;
    const monthWrapper = document.createElement("div");

    monthWrapper.classList.add(options.classNames.monthWrapperClassName);
    return monthWrapper;
  };

  private createArrowsNavigation = (): {
    arrowLeft: HTMLSpanElement;
    arrowRight: HTMLSpanElement;
  } => {
    const { options } = this;
    const arrowRight = document.createElement("span");
    const arrowLeft = document.createElement("span");

    arrowRight.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsRightClassName}`
    );
    arrowRight.innerHTML = options.arrows.right;

    arrowLeft.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsLeftClassName}`
    );
    arrowLeft.innerHTML = options.arrows.left;

    arrowRight.addEventListener("click", this.goPrevMonth);
    arrowLeft.addEventListener("click", this.goNextMonth);

    return { arrowLeft, arrowRight };
  };

  private createHeader = (additional = 0): HTMLElement => {
    const { options, currentMonth, currentYear } = this;
    const { monthNames, classNames } = options;
    const header = document.createElement("div");
    const title = document.createElement("div");

    const monthOverflow = this.isMonthOverflow(additional);

    const monthName = monthOverflow
      ? monthNames[0]
      : monthNames[currentMonth + additional];

    const year = monthOverflow ? currentYear + 1 : currentYear;

    header.classList.add(classNames.headerClassName);
    title.classList.add(classNames.titleClassName);
    title.innerHTML = `
			<span class="${classNames.titleMonthClassName}">
			${monthName}
			</span>
			<span class="${classNames.titleYearClassName}">
				${year}
			</span>`;

    header.appendChild(title);

    return header;
  };

  private createBody = (additional = 0): HTMLElement => {
    const { options, currentYear, currentMonth } = this;
    const body = document.createElement("div");
    const days = document.createElement("div");
    const weeks = document.createElement("div");
    const { weekName } = options;
    const offsetStartWeek = parseInt(
      this.calculateFirstDayOfMonth(additional),
      10
    );
    const monthOverflow = this.isMonthOverflow(additional);
    const month = monthOverflow ? 1 : currentMonth + additional + 1;
    const year = monthOverflow ? currentYear + 1 : currentYear;

    body.classList.add(options.classNames.bodyClassName);
    days.classList.add(options.classNames.daysClassName);

    for (let i = 0; i < offsetStartWeek; i += 1) {
      days.innerHTML += `<span class="${options.classNames.dayItemClassName} ${options.classNames.disabledDayItemClassName}"></span>`;
    }

    const daysInCurrentMonth = this.calculateDaysInCurrentMonth(additional);

    for (let i = 1; i <= daysInCurrentMonth.length; i += 1) {
      const dateValue = `${year}/${month}/${i}`;
      const day = new Day({
        date: moment(dateValue, "jYYYY/jMM/jDD"),
        today: this.today,
        minDate: this.minDate,
        maxDate: this.tempMaxDate || this.maxDate,
        setValue: this.setValue,
        onClick: this.onDayClick,
        mode: options.mode,
        selectedDates: this.selectedDates,
        format: options.format,
        setInRangeDates: this.setInRangeDates,
        multiple: options.multiple,
        findSelectedDate: this.findSelectedDate,
        findInRangeDate: this.findInRangeDate,
        handleDaysState: this.handleDaysState,
        disabledDates: this.disabledDates,
        setTempMaxDate: this.setTempMaxDate,
      });

      days.appendChild(day.render());
      this.days.push(day);
    }

    weeks.classList.add(options.classNames.weeksClassName);

    for (let i = 0; i < weekName.length; i += 1) {
      weeks.innerHTML += `<span class="${options.classNames.weekItemClassName}">${weekName[i]}</span>`;
    }

    body.appendChild(weeks);
    body.appendChild(days);

    return body;
  };

  private goNextMonth = (): void => {
    this.currentMonth = this.currentMonth !== 11 ? this.currentMonth + 1 : 0;
    if (this.currentMonth === 0) {
      this.currentYear += 1;
    }
    this.createElement();
  };

  private goPrevMonth = (): void => {
    this.currentMonth = this.currentMonth !== 0 ? this.currentMonth - 1 : 11;
    if (this.currentMonth === 11) {
      this.currentYear -= 1;
    }
    this.createElement();
  };

  private onDayClick = (): void => {
    const { options } = this;

    if (typeof options.onClick === "function") {
      this.handleOnClickEvent(this.selectedDates);
    }

    if (options.autoClose) {
      this.close();
    }
  };

  private setInRangeDates = (value: Array<Moment>): void => {
    this.inRangeDates = value;
  };

  private handleDaysState = (): void => {
    const { days, options } = this;
    this.validateDisabledDates();

    for (let i = 0; i < days.length; i += 1) {
      const day = days[i];
      day.updateDayState({
        minDate: this.minDate,
        maxDate: this.tempMaxDate || this.maxDate,
        mode: options.mode,
        selectedDates: this.selectedDates,
        format: options.format,
        multiple: options.multiple,
        disabledDates: this.disabledDates,
      });
    }
  };

  private handleOnClickEvent = (selectedDate: ISelectedDates): void => {
    const { onClick } = this.options;

    if (!onClick) {
      return;
    }

    onClick(selectedDate, this.pickerPrivater);
  };

  private getElemPosition = (): void => {
    /**
     * calculation element top and left based on jquery offset :)
     */
    const rect: ClientRect | DOMRect = this.elem.getBoundingClientRect();
    const elemWin =
      this.elem.ownerDocument &&
      this.elem.ownerDocument.defaultView &&
      this.elem.ownerDocument.defaultView;

    if (!elemWin) throw Error(`${this.elemId} not found`);

    this.elemPosition = {
      top: rect.top - elemWin.pageYOffset,
      left: rect.left - elemWin.pageXOffset,
    };
  };

  private setPosition = (): void => {
    this.getElemPosition();
    if (!this.elemPosition) return;

    const { left, top } = this.elemPosition;
    const { offsetWidth, offsetHeight } = this.elem;
    const direction = document.dir;
    const clientWidth =
      document.documentElement && document.documentElement.clientWidth;

    if (!clientWidth) throw Error("item not found");

    const scrollBarWidthTemp = window.innerWidth - clientWidth;
    const scrollBarWidth = scrollBarWidthTemp < 0 ? 0 : scrollBarWidthTemp;

    this.calendarElem.style[direction === "rtl" ? "right" : "left"] =
      direction === "rtl"
        ? ` ${
            window.innerWidth -
            scrollBarWidth -
            (this.elem.offsetLeft + offsetWidth)
          }px`
        : `${left}px`;

    this.calendarElem.style.top = `${offsetHeight + top}px`;
  };

  private getMomented = (
    date: Date | Moment | string,
    format?: string
  ): Moment => {
    const finalFormat = format || this.options.format;

    if (moment.isMoment(date) || date instanceof Date) {
      return moment(date, finalFormat);
    }

    return moment(date, finalFormat);
  };

  private addOpenClass = (): void => {
    const { options } = this;
    this.calendarElem.classList.add(
      `${options.classNames.baseClassName}--open`,
      `${options.classNames.baseClassName}--open-animated`
    );
  };

  private removeOpenClass = (): void => {
    const { options } = this;
    this.calendarElem.classList.remove(
      `${options.classNames.baseClassName}--open`,
      `${options.classNames.baseClassName}--open-animated`
    );
  };

  private handleClickOutside = (): void => {
    /**
     * inspired by https://codepen.io/craigmdennis/pen/VYVBXR
     */
    this.calendarElem.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    });

    document.addEventListener("click", this.closeOnClickOutside);
  };

  private closeOnClickOutside = (e: MouseEvent): void => {
    if (!this.isOpen) {
      return;
    }

    if (e.target === this.elem) return;
    if (!(e.target === this.calendarElem)) {
      this.close();
    }
  };

  public setValue = (dateValue?: Moment | Date | string): void => {
    const { options } = this;

    const momented = getValidatedMoment(dateValue, options.format);

    if (!momented || !dateValue) {
      this.selectedDates = [];
      this.setElemValue("");
      return;
    }

    const foundedSelectedDate = this.findSelectedDate(momented);

    if (options.multiple) {
      if (!foundedSelectedDate) {
        this.selectedDates.push(getValueObject(momented, options.format));
        this.addElemValue(
          `${momented.format(options.format)}${options.multipleSeparator}`
        );
      } else {
        this.selectedDates = this.selectedDates.filter((item) =>
          item.momented.isSame(momented)
        );
        this.replaceElemValue(
          `${momented.format(options.format)}${options.multipleSeparator}`,
          ""
        );
      }
    } else if (options.mode === "range") {
      const startDate = this.selectedDates[0];
      const endDate = this.selectedDates[1];
      if (
        this.selectedDates.length === 0 ||
        (foundedSelectedDate &&
          foundedSelectedDate.momented.isSame(
            this.selectedDates[0].momented
          )) ||
        (startDate && endDate)
      ) {
        const newStartDate = getValueObject(momented, options.format);
        this.selectedDates = [newStartDate];
        this.setElemValue(
          newStartDate.momented.format(options.format) + options.rangeSeparator
        );
      } else if (
        !foundedSelectedDate &&
        momented.isBefore(this.selectedDates[0].momented)
      ) {
        const newStartDate = getValueObject(momented, options.format);
        this.selectedDates = [newStartDate];
        this.inRangeDates = [newStartDate.momented.clone().add(1, "d")];
        this.setElemValue(
          newStartDate.momented.format(options.format) + options.rangeSeparator
        );
      } else if (
        !foundedSelectedDate &&
        momented.isAfter(this.selectedDates[0].momented)
      ) {
        const newEndDate = getValueObject(momented, options.format);
        const diff = momented.diff(this.selectedDates[0].momented, "d") - 1;
        const diffMomented: Moment[] = [];
        this.setTempMaxDate(undefined);

        if (diff > 0) {
          for (let i = 1; i <= diff; i += 1) {
            const momentedDiff = this.selectedDates[0].momented
              .clone()
              .add(i, "d");
            diffMomented.push(momentedDiff);
          }
        }

        this.inRangeDates = [...diffMomented];
        this.selectedDates = [this.selectedDates[0], newEndDate];
        this.setElemValue(
          this.selectedDates[0].momented.format(options.format) +
            options.rangeSeparator +
            newEndDate.momented.format(options.format)
        );
      }
    } else {
      this.selectedDates[0] = getValueObject(momented, options.format);
      this.setElemValue(momented.format(options.format));
    }

    this.handleDaysState();
  };

  private setElemValue = (str: any): void => {
    if (this.options.inline) {
      return;
    }

    if (this.elem instanceof HTMLInputElement) {
      this.elem.value = str;
    } else {
      this.elem.innerHTML = str;
    }
  };

  private replaceElemValue = (search: string, replace: string): void => {
    if (this.elem instanceof HTMLInputElement) {
      this.elem.value = this.elem.value.replace(search, replace);
    } else {
      this.elem.innerHTML = this.elem.innerHTML.replace(search, replace);
    }
  };

  private addElemValue = (str: string): void => {
    if (this.elem instanceof HTMLInputElement) {
      this.elem.value += str;
    } else {
      this.elem.innerHTML += str;
    }
  };

  private findSelectedDate = (
    dateValue: Moment | string
  ): ISelectedDateItem | undefined => {
    const { selectedDates } = this;

    const momented = moment.isMoment(dateValue)
      ? dateValue
      : this.getMomented(dateValue);

    return selectedDates.find((item) => {
      return momented.isSame(item.momented);
    });
  };

  private findInRangeDate = (
    dateValue: Moment | string
  ): ISelectedDateItem["momented"] | undefined => {
    const { inRangeDates } = this;

    const momented = moment.isMoment(dateValue)
      ? dateValue
      : this.getMomented(dateValue);

    return inRangeDates.find((item) => {
      return momented.isSame(item);
    });
  };

  private isMonthOverflow = (additional = 0): boolean => {
    return additional + this.currentMonth >= this.options.monthNames.length;
  };

  private validateDisabledDates = (): void => {
    const { disabledDates, format } = this.options;

    if (!disabledDates || disabledDates.length === 0) {
      return;
    }

    this.disabledDates = disabledDates.map((item) => {
      if (typeof item === "string") {
        return moment(item, format);
      }
      if (item instanceof Date) {
        return moment(item);
      }
      return item;
    });
  };

  private setTempMaxDate = (value: Moment | undefined): void => {
    this.tempMaxDate = value;
  };

  public open = (): void => {
    if (this.isOpen) return;
    this.isOpen = true;
    if (!this.options.inline) {
      this.setPosition();
    }
    this.addOpenClass();
  };

  public close = (): void => {
    if (!this.isOpen) return;

    const { mode } = this.options;

    if (mode === "range" && !this.selectedDates[1]) {
      this.setValue();
      this.inRangeDates = [];
      this.tempMaxDate = undefined;
      this.onDayClick();
      this.handleDaysState();
    }

    this.isOpen = false;
    this.removeOpenClass();
  };

  public getValue = (): ISelectedDates => {
    return this.selectedDates;
  };

  public destroy = (): void => {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("click", this.closeOnClickOutside);
    this.elem.removeEventListener("click", this.open);
    this.calendarElem.remove();
  };

  public setDate = (dateValue?: Moment | Date | string): void => {
    const { format } = this.options;
    const momented = getValidatedMoment(dateValue, format);

    if (!momented) {
      throw new Error("Please provide valid date");
    }

    this.currentMonth = momented.jMonth();
    this.currentYear = momented.jYear();
    this.setValue(momented);
    this.createElement();
  };
}

class Datepicker {
  public getValue: () => ISelectedDates;

  public open: () => void;

  public close: () => void;

  public destroy: () => void;

  public setDate: () => void;

  /**
   * Datepicker constructor params:
   * @param elem the element css selector
   * @param options Datepicker options
   */
  constructor(elem: string, options?: IOptions<Datepicker>) {
    const datepicker = new PrivateDatepicker(elem, this, options);
    this.getValue = datepicker.getValue;
    this.open = datepicker.open;
    this.close = datepicker.close;
    this.destroy = datepicker.destroy;
    this.setDate = datepicker.setDate;
  }
}

export default Datepicker;
