import moment, { Moment } from 'moment-jalaali'

// library imports
import { constants } from './configs/constants'
import { IElemPosition, IOptions, ISelectedDates, ISelectedDateItem, disabledDates } from './types'
import Day from './components/Day'
import { getValueObject } from './utils/getValueObject'

const defaultOptionsValue: IOptions<Datepicker> = {
  defaultValue: false,
  autoClose: false,
  multiple: false,
  mode: 'single',
  multipleSeparator: ' - ',
  rangeSeparator: ' - ',
  numberOfMonths: 1,
  minDate: new Date(),
  maxDate: false,
  timeout: 250,
  format: 'jYYYY/jM/jD',
  disabledDates: [],
  classNames: {
    baseClassName: constants.baseClassName,
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
  weekName: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  monthNames: [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],
}

class Datepicker {
  public getValue: () => ISelectedDates
  public open: () => void
  public close: () => void

  /**
   * Datepicker constructor params:
   * @param elem the element css selector
   * @param options Datepicker options
   */
  constructor(elem: string, options?: IOptions<Datepicker>) {
    const datepicker = new PrivateDatepicker(elem, this, options)
    this.getValue = datepicker.getValue
    this.open = datepicker.open
    this.close = datepicker.close
  }
}

class PrivateDatepicker {
  // constructor elements
  private elem: HTMLInputElement | HTMLElement
  private options: IOptions<Datepicker>
  private pickerPrivater: Datepicker

  // rests
  private elemId: string
  private elemPosition?: IElemPosition
  private calendarElem: HTMLElement
  private today: Moment
  private todayMonth: number
  private todayYear: number
  private currentYear: number
  private currentMonth: number
  private selectedDates: ISelectedDates = []
  private inRangeDates: Array<ISelectedDateItem['momented']> = ([] = [])
  private timeoutTemp?: any
  private isOpen: boolean
  private minDate?: Moment
  private maxDate?: Moment
  private tempMaxDate?: Moment
  private days: Array<Day> = []
  private disabledDates: Array<Moment>

  constructor(elem: string, pickerPrivater: Datepicker, options?: IOptions<Datepicker>) {
    this.elemId = elem
    const elemExist = document.querySelector(elem) as HTMLInputElement

    if (!elemExist) {
      throw Error(`the ${elem} not found in your dom`)
    } else {
      this.elem = elemExist
    }

    this.options = Object.assign(defaultOptionsValue, options)
    this.pickerPrivater = pickerPrivater
    this.calendarElem = document.createElement('div')
    this.today = moment(new Date())
    this.todayMonth = this.today.jMonth()
    this.todayYear = this.today.jYear()
    this.currentMonth = this.todayMonth
    this.currentYear = this.todayYear
    this.isOpen = false
    this.disabledDates = []
    this.handleClickOutside()
    this.validateDisabledDates()

    const { minDate, defaultValue, format, maxDate } = this.options

    if (defaultValue) {
      const momentedDefaultValue = this.getMomented(
        moment(typeof defaultValue === 'boolean' ? new Date() : defaultValue).format(format)
      )

      this.currentMonth = momentedDefaultValue.jMonth()
      this.currentYear = momentedDefaultValue.jYear()

      this.setValue(momentedDefaultValue)
    }

    if (minDate === true) {
      this.minDate = moment(new Date())
    } else if (minDate && minDate instanceof Date) {
      this.minDate = moment(minDate)
    } else if (minDate && !moment.isMoment(minDate)) {
      this.minDate = moment(minDate, format)
    } else {
      this.minDate = undefined
    }

    if (maxDate === true) {
      this.maxDate = moment(new Date())
    } else if (maxDate && maxDate instanceof Date) {
      this.maxDate = moment(maxDate)
    } else if (maxDate && !moment.isMoment(maxDate)) {
      this.maxDate = moment(maxDate, format)
    } else {
      this.maxDate = undefined
    }

    this.tempMaxDate = undefined

    this.createElement()

    window.addEventListener('resize', () => {
      if (!this.isOpen) {
        return
      }
      clearTimeout(this.timeoutTemp)
      this.timeoutTemp = setTimeout(this.setPosition, this.options.timeout)
    })
  }

  private calculateDaysInCurrentMonth = (additional: number = 0): number[] => {
    const { currentYear, currentMonth } = this
    const monthOverflow = this.isMonthOverflow(additional)
    const month = monthOverflow ? 1 : currentMonth + additional
    const year = monthOverflow ? currentYear + 1 : currentYear

    const totalDays = moment.jDaysInMonth(year, month)
    let daysInCurrentMonth = []
    for (let i = 1; i <= totalDays; i++) {
      daysInCurrentMonth.push(i)
    }
    return daysInCurrentMonth
  }

  private calculateFirstDayOfMonth = (additional: number = 0): string => {
    const { currentMonth, currentYear, options } = this
    const monthOverflow = this.isMonthOverflow(additional)
    const month = monthOverflow ? 1 : currentMonth + additional
    const year = monthOverflow ? currentYear + 1 : currentYear
    const firstDayOfMonth = moment(`${year}/${month + 1}/1`, 'jYYYY/jM/jD')
      .day()
      .toString()
    const weekFa = ['1', '2', '3', '4', '5', '6', '0']

    return weekFa[+firstDayOfMonth]
  }

  private createElement = (): void => {
    const { options } = this
    this.calendarElem.setAttribute('id', `${this.elem.getAttribute('id')}-calendar`)
    this.calendarElem.classList.add(options.classNames.baseClassName)

    // remove any previous data in calendar elem
    while (this.calendarElem.firstChild) {
      this.calendarElem.removeChild(this.calendarElem.firstChild)
    }

    // create arrows
    const { arrowLeft, arrowRight } = this.createArrowsNavigation()
    this.calendarElem.appendChild(arrowRight)
    this.calendarElem.appendChild(arrowLeft)

    this.days = []
    // append header and body for calendar
    for (let index = 0; index < options.numberOfMonths; index++) {
      const monthWrapper = this.createMonthWrapper()
      monthWrapper.appendChild(this.createHeader(index))
      monthWrapper.appendChild(this.createBody(index))
      this.calendarElem.appendChild(monthWrapper)
    }

    document.body.appendChild(this.calendarElem)
    this.handleDaysState()
    this.elem.addEventListener('click', this.open)
  }

  private createMonthWrapper = (): HTMLElement => {
    const { options } = this
    const monthWrapper = document.createElement('div')

    monthWrapper.classList.add(options.classNames.monthWrapperClassName)
    return monthWrapper
  }

  private createArrowsNavigation = () => {
    const { options } = this
    const arrowRight = document.createElement('span')
    const arrowLeft = document.createElement('span')

    arrowRight.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsRightClassName}`
    )
    arrowRight.innerHTML = options.arrows.right

    arrowLeft.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsLeftClassName}`
    )
    arrowLeft.innerHTML = options.arrows.left

    arrowRight.addEventListener('click', this.goPrevMonth)
    arrowLeft.addEventListener('click', this.goNextMonth)

    return { arrowLeft, arrowRight }
  }

  private createHeader = (additional: number = 0): HTMLElement => {
    const { options, currentMonth, currentYear } = this
    const { monthNames, classNames } = options
    const header = document.createElement('div')
    const title = document.createElement('div')

    const monthOverflow = this.isMonthOverflow(additional)

    const monthName = monthOverflow ? monthNames[0] : monthNames[currentMonth + additional]

    const year = monthOverflow ? currentYear + 1 : currentYear

    header.classList.add(classNames.headerClassName)
    title.classList.add(classNames.titleClassName)
    title.innerHTML = `
			<span class="${classNames.titleMonthClassName}">
			${monthName}
			</span>
			<span class="${classNames.titleYearClassName}">
				${year}
			</span>`

    header.appendChild(title)

    return header
  }

  private createBody = (additional: number = 0): HTMLElement => {
    const { options, currentYear, currentMonth, selectedDates } = this
    const body = document.createElement('div')
    const days = document.createElement('div')
    const weeks = document.createElement('div')
    const { weekName } = options
    const offsetStartWeek = parseInt(this.calculateFirstDayOfMonth(additional))
    const monthOverflow = this.isMonthOverflow(additional)
    const month = monthOverflow ? 1 : currentMonth + additional + 1
    const year = monthOverflow ? currentYear + 1 : currentYear

    body.classList.add(options.classNames.bodyClassName)
    days.classList.add(options.classNames.daysClassName)

    for (let i = 0; i < offsetStartWeek; i++) {
      days.innerHTML += `<span class="${options.classNames.dayItemClassName} ${options.classNames.disabledDayItemClassName}"></span>`
    }

    const daysInCurrentMonth = this.calculateDaysInCurrentMonth(additional)

    for (let i = 1; i <= daysInCurrentMonth.length; i++) {
      const dateValue = `${year}/${month}/${i}`
      const day = new Day({
        date: moment(dateValue, 'jYYYY/jMM/jDD'),
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
      })

      days.appendChild(day.render())
      this.days.push(day)
    }

    weeks.classList.add(options.classNames.weeksClassName)

    for (let i = 0; i < weekName.length; i++) {
      weeks.innerHTML += `<span class="${options.classNames.weekItemClassName}">${weekName[i]}</span>`
    }

    body.appendChild(weeks)
    body.appendChild(days)

    return body
  }

  private goNextMonth = (): void => {
    this.currentMonth = this.currentMonth !== 11 ? ++this.currentMonth : 0
    if (this.currentMonth === 0) {
      this.currentYear++
    }
    this.createElement()
  }

  private goPrevMonth = (): void => {
    this.currentMonth = this.currentMonth !== 0 ? --this.currentMonth : 11
    if (this.currentMonth === 11) {
      this.currentYear--
    }
    this.createElement()
  }

  private getValidDayTarget = (e: MouseEvent): HTMLElement | null => {
    const { options } = this
    const target: HTMLElement = e.target as HTMLElement
    if (
      !(
        target.classList.contains(options.classNames.dayItemClassName) &&
        target.getAttribute('data-date')
      )
    ) {
      return null
    }

    return target
  }

  private onDayClick = (selectedDate: ISelectedDateItem) => {
    const { options } = this

    if (typeof options.onClick === 'function') {
      this.handleOnClickEvent(this.selectedDates)
    }

    if (options.autoClose) {
      this.close()
    }
  }

  private setInRangeDates = (value: Array<Moment>) => {
    this.inRangeDates = value
  }

  private handleDaysState = () => {
    const { days, options } = this
    this.validateDisabledDates()

    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      day.updateDayState({
        minDate: this.minDate,
        maxDate: this.tempMaxDate || this.maxDate,
        mode: options.mode,
        selectedDates: this.selectedDates,
        format: options.format,
        multiple: options.multiple,
        disabledDates: this.disabledDates,
      })
    }
  }

  private handleOnClickEvent = (selectedDate: ISelectedDates) => {
    const { onClick } = this.options

    if (!onClick) {
      return
    }

    onClick(selectedDate, this.pickerPrivater)
  }

  private getElemPosition = (): void => {
    /**
     * calculation element top and left based on jquery offset :)
     */
    const rect: ClientRect | DOMRect = this.elem.getBoundingClientRect()
    const elemWin =
      this.elem.ownerDocument &&
      this.elem.ownerDocument.defaultView &&
      this.elem.ownerDocument.defaultView

    if (!elemWin) throw Error(`${this.elemId} not found`)

    this.elemPosition = {
      top: rect.top - elemWin.pageYOffset,
      left: rect.left - elemWin.pageXOffset,
    }
  }

  private setPosition = (): void => {
    this.getElemPosition()
    if (!this.elemPosition) return

    const { left, top } = this.elemPosition
    const { offsetWidth, offsetHeight } = this.elem
    const direction = document.dir
    const clientWidth = document.documentElement && document.documentElement.clientWidth

    if (!clientWidth) throw Error('item not found')

    const scrollBarWidthTemp = window.innerWidth - clientWidth
    const scrollBarWidth = scrollBarWidthTemp < 0 ? 0 : scrollBarWidthTemp

    this.calendarElem.style[direction === 'rtl' ? 'right' : 'left'] =
      direction === 'rtl'
        ? ` ${window.innerWidth - scrollBarWidth - (this.elem.offsetLeft + offsetWidth)}px`
        : `${left}px`

    this.calendarElem.style.top = `${offsetHeight + top}px`
  }

  private getMomented = (date: Date | Moment | string, format?: string): Moment => {
    const finalFormat = format ? format : this.options.format

    if (moment.isMoment(date) || date instanceof Date) {
      return moment(date, finalFormat)
    }

    return moment(date, finalFormat)
  }

  private addOpenClass = (): void => {
    const { options } = this
    this.calendarElem.classList.add(
      `${options.classNames.baseClassName}--open`,
      `${options.classNames.baseClassName}--open-animated`
    )
  }

  private removeOpenClass = (): void => {
    const { options } = this
    this.calendarElem.classList.remove(
      `${options.classNames.baseClassName}--open`,
      `${options.classNames.baseClassName}--open-animated`
    )
  }

  private handleClickOutside = (): void => {
    /**
     * inspired by https://codepen.io/craigmdennis/pen/VYVBXR
     */
    this.calendarElem.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopImmediatePropagation()
    })

    document.addEventListener('click', (e) => {
      if (e.target == this.elem) return
      if (!(e.target == this.calendarElem)) {
        this.close()
      }
    })
  }

  private setElemValue = (str: any): void => {
    if (this.elem instanceof HTMLInputElement) {
      this.elem.value = str
    } else {
      this.elem.innerHTML = str
    }
  }

  private replaceElemValue = (search: string, replace: string): void => {
    if (this.elem instanceof HTMLInputElement) {
      this.elem.value = this.elem.value.replace(search, replace)
    } else {
      this.elem.innerHTML = this.elem.innerHTML.replace(search, replace)
    }
  }

  private addElemValue = (str: string): void => {
    if (this.elem instanceof HTMLInputElement) {
      this.elem.value += str
    } else {
      this.elem.innerHTML += str
    }
  }

  private setValue = (dateValue: Moment | string) => {
    const { options } = this
    const momented = moment.isMoment(dateValue) ? dateValue : this.getMomented(dateValue)
    const foundedSelectedDate = this.findSelectedDate(dateValue)

    if (options.multiple) {
      if (!foundedSelectedDate) {
        this.selectedDates.push(getValueObject(momented, options.format))
        this.addElemValue(`${momented.format(options.format)}${options.multipleSeparator}`)
      } else {
        this.selectedDates = this.selectedDates.filter((item) => item.momented.isSame(momented))
        this.replaceElemValue(`${momented.format(options.format)}${options.multipleSeparator}`, '')
      }
    } else if (options.mode === 'range') {
      const startDate = this.selectedDates[0]
      const endDate = this.selectedDates[1]
      if (
        this.selectedDates.length === 0 ||
        (foundedSelectedDate &&
          foundedSelectedDate.momented.isSame(this.selectedDates[0].momented)) ||
        (startDate && endDate)
      ) {
        const startDate = getValueObject(momented, options.format)
        this.selectedDates = [startDate]
        this.setElemValue(startDate.momented.format(options.format) + options.rangeSeparator)
      } else if (!foundedSelectedDate && momented.isBefore(this.selectedDates[0].momented)) {
        const startDate = getValueObject(momented, options.format)
        this.selectedDates = [startDate]
        this.inRangeDates = [startDate.momented.clone().add(1, 'd')]
        this.setElemValue(startDate.momented.format(options.format) + options.rangeSeparator)
      } else if (!foundedSelectedDate && momented.isAfter(this.selectedDates[0].momented)) {
        const endDate = getValueObject(momented, options.format)
        const diff = momented.diff(this.selectedDates[0].momented, 'd') - 1
        let diffMomented = []
        this.setTempMaxDate(undefined)

        if (diff > 0) {
          for (let i = 1; i <= diff; i++) {
            const momentedDiff = this.selectedDates[0].momented.clone().add(i, 'd')
            diffMomented.push(momentedDiff)
          }
        }

        this.inRangeDates = [...diffMomented]
        this.selectedDates = [this.selectedDates[0], endDate]
        this.setElemValue(
          this.selectedDates[0].momented.format(options.format) +
            options.rangeSeparator +
            endDate.momented.format(options.format)
        )
      }
    } else {
      this.selectedDates[0] = getValueObject(momented, options.format)
      this.setElemValue(momented.format(options.format))
    }

    this.handleDaysState()
  }

  private findSelectedDate = (dateValue: Moment | string): ISelectedDateItem | undefined => {
    const { selectedDates } = this

    const momented = moment.isMoment(dateValue) ? dateValue : this.getMomented(dateValue)

    return selectedDates.find((item) => {
      return momented.isSame(item.momented)
    })
  }

  private findInRangeDate = (
    dateValue: Moment | string
  ): ISelectedDateItem['momented'] | undefined => {
    const { inRangeDates } = this

    const momented = moment.isMoment(dateValue) ? dateValue : this.getMomented(dateValue)

    return inRangeDates.find((item) => {
      return momented.isSame(item)
    })
  }

  private isMonthOverflow = (additional: number = 0): boolean => {
    return additional + this.currentMonth >= this.options.monthNames.length
  }

  private validateDisabledDates = (): void => {
    const { disabledDates, format } = this.options

    if (!disabledDates || disabledDates.length === 0) {
      return
    }

    this.disabledDates = disabledDates.map((item) => {
      if (typeof item === 'string') {
        return moment(item, format)
      } else if (item instanceof Date) {
        return moment(item)
      } else {
        return item
      }
    })
  }

  private setTempMaxDate = (value: Moment | undefined) => {
    this.tempMaxDate = value
  }

  public open = (): void => {
    if (this.isOpen) return
    this.isOpen = true
    this.setPosition()
    this.addOpenClass()
  }

  public close = (): void => {
    if (!this.isOpen) return
    this.isOpen = false
    this.removeOpenClass()
  }

  public getValue = (): ISelectedDates => {
    return this.selectedDates
  }
}

export default Datepicker
