import moment, { Moment } from "moment-jalaali";

// library imports
import {
  IElemPosition,
  IOptions,
  ISelectedDates,
  dateValue,
} from "../models/general";
import Day from "./Day";
import { getValidatedMoment } from "../utils/getValidatedMoment";
import { defaultOptionsValue } from "../configs/defaultOptionsValue";

class PrivateDatepicker {
  // constructor elements
  private elem: HTMLElement;

  private options: IOptions<Datepicker>;

  private pickerPrivater: Datepicker;

  // rests
  private elemPosition?: IElemPosition;

  private wrapperElem: HTMLElement;

  private calendarElem: HTMLElement;

  private today: Moment;

  private todayMonth: number;

  private todayYear: number;

  private currentYear: number;

  private currentMonth: number;

  private selectedDates: ISelectedDates = [];

  private inRangeDates: Array<Moment> = [];

  private timeoutTemp?: NodeJS.Timeout | number;

  private isOpen: boolean;

  private minDate?: Moment;

  private maxDate?: Moment;

  private tempMaxDate?: Moment;

  private days: Array<Day> = [];

  private disabledDates: Array<Moment>;

  constructor(
    elem: HTMLElement | string,
    pickerPrivater: Datepicker,
    options?: IOptions<Datepicker>
  ) {
    const elemExist =
      typeof elem === "string"
        ? (document.querySelector(elem) as HTMLElement)
        : elem;

    if (!elemExist) {
      throw Error(`your element is not a valid dom`);
    } else {
      this.elem = elemExist;
    }

    this.options = Object.assign({}, defaultOptionsValue, options);
    this.pickerPrivater = pickerPrivater;
    this.wrapperElem = document.createElement("div");
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

    if (Array.isArray(defaultValue)) {
      const momented: Array<Moment> = defaultValue
        .map((item) => getValidatedMoment(item, this.options.format))
        .filter((item) => (item === null ? false : true)) as Array<Moment>;

      if (momented.length > 0) {
        this.currentMonth = momented[0].jMonth();
        this.currentYear = momented[0].jYear();
        this.setValue(defaultValue);
      }
    } else if (defaultValue) {
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

    if (!this.calendarElem.getAttribute("id")) {
      const id = this.elem.getAttribute("id");

      if (id) {
        this.calendarElem.setAttribute(
          "id",
          `${this.elem.getAttribute("id")}-calendar`
        );
      }
    }

    if (!this.isOpen) {
      const dir = document.dir;
      this.wrapperElem.classList.add(this.options.classNames.wrapperClassName);
      this.calendarElem.classList.add(classNames.baseClassName);
      this.calendarElem.classList.add(
        dir === "rtl" ? classNames.rtlClassName : classNames.ltrClassName
      );
    }

    if (inline) {
      this.calendarElem.classList.add(classNames.inlineClassName);
      this.addOpenClass();
    }

    // remove any previous data in calendar elem
    while (this.calendarElem.firstChild) {
      this.calendarElem.firstChild.remove();
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

    if (inline && this.elem.children.length === 0) {
      this.elem.appendChild(this.calendarElem);
    } else if (!inline && this.wrapperElem.children.length === 0) {
      this.wrapperElem.appendChild(this.calendarElem);
      document.body.appendChild(this.wrapperElem);
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
    const { onClick, autoClose } = this.options;

    if (typeof onClick === "function") {
      onClick(this.selectedDates, this.pickerPrivater);
    }

    if (autoClose) {
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

  private getElemPosition = (): void => {
    const elemRect = this.elem.getBoundingClientRect();

    const dir = document.dir;

    this.elemPosition = {
      y: elemRect.bottom + window.pageYOffset,
      x: dir === "rtl" ? elemRect.right : elemRect.left,
    };
  };

  private setPosition = (): void => {
    this.getElemPosition();

    if (!this.elemPosition) return;

    const { x, y } = this.elemPosition;

    this.wrapperElem.style.top = `${y}px`;
    this.wrapperElem.style.left = `${x}px`;
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
    const { classNames } = this.options;

    if (
      this.calendarElem.classList.contains(`${classNames.baseClassName}--open`)
    ) {
      return;
    }

    this.calendarElem.classList.add(
      `${classNames.baseClassName}--open`,
      `${classNames.baseClassName}--open-animated`
    );
  };

  private removeOpenClass = (): void => {
    const { classNames } = this.options;
    this.calendarElem.classList.remove(
      `${classNames.baseClassName}--open`,
      `${classNames.baseClassName}--open-animated`
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
  ): Moment | undefined => {
    const { selectedDates } = this;

    const momented = moment.isMoment(dateValue)
      ? dateValue
      : this.getMomented(dateValue);

    return selectedDates.find((item) => {
      return momented.isSame(item);
    });
  };

  private findInRangeDate = (
    dateValue: Moment | string
  ): Moment | undefined => {
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

  public setValue = (
    dateValue?: dateValue[] | dateValue,
    triggerChange = true
  ): void => {
    const { options } = this;

    if (Array.isArray(dateValue)) {
      const momented: Array<Moment> = dateValue
        .map((item) => getValidatedMoment(item, options.format))
        .filter((item) => (item === null ? false : true)) as Array<Moment>;

      if (momented !== null) {
        this.selectedDates = momented;

        if (options.multiple) {
          for (let i = 0; i < momented.length; i++) {
            const element = momented[i];
            this.setElemValue(
              `${element.format(options.format)}${options.multipleSeparator}`
            );
          }
        } else if (options.mode === "range" && momented.length > 1) {
          const diff = momented[1].diff(momented[0], "d") - 1;
          const diffMomented: Moment[] = [];
          this.setTempMaxDate(undefined);

          if (diff > 0) {
            for (let i = 1; i <= diff; i += 1) {
              const momentedDiff = momented[0].clone().add(i, "d");
              diffMomented.push(momentedDiff);
            }
          }

          this.inRangeDates = [...diffMomented];

          this.setElemValue(
            momented[0].format(options.format) +
              options.rangeSeparator +
              momented[1].format(options.format)
          );
        } else {
          if (momented[0]) {
            this.setElemValue(momented[0].format(options.format));
          } else {
            this.setElemValue("");
          }
        }

        if (triggerChange) {
          this.onChange();
        }

        return;
      } else {
        throw new Error("Please provide valid selected date");
      }
    }

    const momented = getValidatedMoment(dateValue, options.format);

    if (!momented || !dateValue) {
      this.selectedDates = [];
      this.setElemValue("");
      if (triggerChange) {
        this.onChange();
      }
      return;
    }

    const foundedSelectedDate = this.findSelectedDate(momented);

    if (options.multiple) {
      if (!foundedSelectedDate) {
        this.selectedDates.push(momented);
        this.addElemValue(
          `${momented.format(options.format)}${options.multipleSeparator}`
        );
      } else {
        this.selectedDates = this.selectedDates.filter((item) =>
          item.isSame(momented)
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
        (foundedSelectedDate && foundedSelectedDate.isSame(startDate, "d")) ||
        (startDate && endDate)
      ) {
        this.selectedDates = [momented];
        this.inRangeDates = [momented.clone().add(1, "d")];
        this.setElemValue(
          momented.format(options.format) + options.rangeSeparator
        );
      } else if (
        !foundedSelectedDate &&
        momented.isBefore(this.selectedDates[0], "d")
      ) {
        this.selectedDates = [momented];
        this.inRangeDates = [momented.clone().add(1, "d")];
        this.setElemValue(
          momented.format(options.format) + options.rangeSeparator
        );
      } else if (
        !foundedSelectedDate &&
        momented.isAfter(this.selectedDates[0])
      ) {
        const diff = momented.diff(this.selectedDates[0], "d") - 1;
        const diffMomented: Moment[] = [];
        this.setTempMaxDate(undefined);

        if (diff > 0) {
          for (let i = 1; i <= diff; i += 1) {
            const momentedDiff = this.selectedDates[0].clone().add(i, "d");
            diffMomented.push(momentedDiff);
          }
        }

        this.inRangeDates = [...diffMomented];
        this.selectedDates = [this.selectedDates[0], momented];
        this.setElemValue(
          this.selectedDates[0].format(options.format) +
            options.rangeSeparator +
            momented.format(options.format)
        );
      }
    } else {
      this.selectedDates[0] = momented;
      this.setElemValue(momented.format(options.format));
    }

    if (triggerChange) {
      this.onChange();
    }

    this.handleDaysState();
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

  public setDate = (
    dateValue?: dateValue[] | dateValue,
    triggerChange = true,
    format?: string
  ): void => {
    const finalFormat = format || this.options.format;

    if (Array.isArray(dateValue)) {
      const momented = dateValue
        .map((item) => getValidatedMoment(item, finalFormat))
        .filter((item) => (item === null ? false : true)) as Array<Moment>;

      if (
        this.options.mode === "range" &&
        momented.length === 2 &&
        (momented[0].jMonth() !== this.currentMonth ||
          momented[0].jYear() !== this.currentYear) &&
        (momented[1].jMonth() - 1 !== this.currentMonth ||
          momented[1].jYear() !== this.currentYear)
      ) {
        this.currentMonth = momented[0].jMonth();
        this.currentYear = momented[0].jYear();
      }
      this.setValue(momented, triggerChange);
      this.createElement();
      return;
    }

    const momented = getValidatedMoment(dateValue, finalFormat);

    if (!momented) {
      throw new Error("Please provide valid date");
    }

    this.currentMonth = momented.jMonth();
    this.currentYear = momented.jYear();
    this.setValue(momented, triggerChange);
    this.createElement();
  };

  public onChange = (): void => {
    const { onChange } = this.options;

    if (typeof onChange !== "function") {
      return;
    }

    onChange(this.selectedDates, this.pickerPrivater);
  };

  public setOptions = (options: IOptions<Datepicker>): void => {
    Object.assign(this.options, options);
    this.validateDisabledDates();
    this.handleDaysState();
  };
}

class Datepicker {
  public getValue: () => ISelectedDates;

  public open: () => void;

  public close: () => void;

  public destroy: () => void;

  public setDate: (
    dateValue?: dateValue[] | dateValue,
    triggerChange?: boolean,
    format?: string
  ) => void;

  public setOptions: (options: IOptions<Datepicker>) => void;

  public onChange: () => void;

  /**
   * Datepicker constructor params:
   * @param elem the element css selector
   * @param options Datepicker options
   */
  constructor(elem: HTMLElement | string, options?: IOptions<Datepicker>) {
    const datepicker = new PrivateDatepicker(elem, this, options);
    this.getValue = datepicker.getValue;
    this.open = datepicker.open;
    this.close = datepicker.close;
    this.destroy = datepicker.destroy;
    this.setDate = datepicker.setDate;
    this.onChange = datepicker.onChange;
    this.setOptions = datepicker.setOptions;
  }
}

export default Datepicker;
