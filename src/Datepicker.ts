import moment, { Moment } from 'moment-jalaali'

// library imports
import { constants } from './constants'
import { IElemPosition, IOptions, ISelectedDates, ISelectedDateItem } from './types'

const defaultOptionsValue: IOptions<Datepicker> = {
  defaultValue: false,
  autoClose: false,
  multiple: false,
  mode: 'single',
  multipleSeparator: ' - ',
  rangeSeparator: ' الی ',
  numberOfMonths: 1,
  timeout: 250,
  format: 'jYYYY/jM/jD',
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
  private todayDay: number
  private todayMonth: number
  private todayYear: number
  private currentYear: number
  private currentMonth: number
  private selectedDates: ISelectedDates = []
  private inRangeDates: Array<ISelectedDateItem['momented']> = ([] = [])
  private timeoutTemp?: any
  private isOpen: boolean

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
    this.todayDay = this.today.jDate()
    this.todayMonth = this.today.jMonth()
    this.todayYear = this.today.jYear()
    this.currentMonth = this.todayMonth
    this.currentYear = this.todayYear
    this.isOpen = false
    this.handleClickOutside()

    if (this.options.defaultValue) {
      const momentedDefaultValue = this.getMomented(
        moment(
          typeof this.options.defaultValue === 'boolean' ? new Date() : this.options.defaultValue
        ).format(this.options.format)
      )

      this.currentMonth = momentedDefaultValue.jMonth()
      this.currentYear = momentedDefaultValue.jYear()

      this.setValue(momentedDefaultValue)
    }

    this.createElement()

    window.addEventListener('resize', () => {
      if (!this.isOpen) {
        return
      }
      clearTimeout(this.timeoutTemp)
      this.timeoutTemp = setTimeout(this.setPosition, this.options.timeout)
    })
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
      days.innerHTML += `<span class="${options.classNames.dayItemClassName} ${options.classNames.dayItemClassName}--disabled"></span>`
    }

    const daysInCurrentMonth = this.calculateDaysInCurrentMonth(additional)

    for (let i = 1; i <= daysInCurrentMonth.length; i++) {
      const dateValue = `${year}/${month}/${i}`
      const dayItem = document.createElement('span')
      const dayItemText = document.createTextNode(`${i}`)

      dayItem.classList.add(options.classNames.dayItemClassName)
      dayItem.dataset.date = dateValue
      dayItem.appendChild(dayItemText)

      if (options.mode === 'range') {
        dayItem.addEventListener('mouseenter', this.onDayHover)
      }

      days.appendChild(dayItem)
    }

    weeks.classList.add(options.classNames.weeksClassName)

    for (let i = 0; i < weekName.length; i++) {
      weeks.innerHTML += `<span class="${options.classNames.weekItemClassName}">${weekName[i]}</span>`
    }

    body.appendChild(weeks)
    body.appendChild(days)
    body.addEventListener('click', this.onDayClick)

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

  private onDayClick = (e: MouseEvent) => {
    const { options } = this
    const target = this.getValidDayTarget(e)

    if (!target) {
      return
    }

    const isDateValueNull = target.getAttribute('data-date')
    const dateValue = isDateValueNull ? isDateValueNull : ''
    const momented = this.getMomented(dateValue)

    this.inRangeDates = options.mode === 'range' ? [momented.clone().add(1, 'd')] : []
    this.setValue(momented)

    if (typeof options.onClick === 'function') {
      this.handleOnClickEvent(this.selectedDates)
    }

    if (options.autoClose) {
      this.close()
    }
  }

  private onDayHover = (e: MouseEvent) => {
    const { selectedDates } = this
    const target = this.getValidDayTarget(e)

    if (!target) {
      return
    }

    const dateValue = target.dataset.date

    if (!dateValue) {
      return
    }

    const momented = this.getMomented(dateValue)

    const startDate = selectedDates[0]
    const endDate = selectedDates[1]

    if (!startDate || endDate) {
      return
    }

    const diff = momented.diff(startDate.momented, 'd')
    let diffMomented = []

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        const momentedDiff = startDate.momented.clone().add(i, 'd')

        diffMomented.push(momentedDiff)
      }
    }

    this.inRangeDates = [...diffMomented]

    this.handleDaysState()
  }

  private handleDaysState = () => {
    const { options, selectedDates } = this
    const { classNames } = options
    const daysElem = this.calendarElem.querySelectorAll(`.${classNames.dayItemClassName}`)
    const startDate = selectedDates[0]

    if (!daysElem) {
      return
    }

    for (let i = 0; i < daysElem.length; i++) {
      const dayElem = daysElem[i]
      const dayDateValue = dayElem.getAttribute('data-date')

      if (dayDateValue) {
        const momented = this.getMomented(dayDateValue)
        const foundedSelectedDate = this.findSelectedDate(momented)

        if (momented.isSame(new Date(), 'd')) {
          dayElem.classList.add(classNames.todayClassName)
        } else if (dayElem.classList.contains(classNames.todayClassName)) {
          dayElem.classList.remove(classNames.todayClassName)
        }

        if (
          dayElem.classList.contains(classNames.selectedDayItemClassName) &&
          !foundedSelectedDate
        ) {
          dayElem.classList.remove(classNames.selectedDayItemClassName)
        } else if (foundedSelectedDate) {
          dayElem.classList.add(classNames.selectedDayItemClassName)
        }

        if (options.multiple && foundedSelectedDate) {
          dayElem.classList.add(classNames.selectedDayItemClassName)
        } else if (options.multiple && !foundedSelectedDate) {
          dayElem.classList.remove(classNames.selectedDayItemClassName)
        }

        if (options.mode === 'range' && startDate) {
          const isInRange = this.findInRangeDate(momented)

          if (isInRange) {
            dayElem.classList.add(classNames.inRangeDayItemClassName)
          } else {
            dayElem.classList.remove(classNames.inRangeDayItemClassName)
          }
        }
      }
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
        this.selectedDates.push({
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: momented.format(options.format),
          momented,
        })
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
        const startDate = {
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: momented.format(options.format),
          momented,
        }

        this.selectedDates = [startDate]

        this.setElemValue(startDate.momented.format(options.format) + options.rangeSeparator)
      } else if (!foundedSelectedDate && momented.isBefore(this.selectedDates[0].momented)) {
        const startDate = {
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: momented.format(options.format),
          momented,
        }

        this.selectedDates = [startDate]
        this.inRangeDates = [startDate.momented.clone().add(1, 'd')]
        this.setElemValue(startDate.momented.format(options.format) + options.rangeSeparator)
      } else if (!foundedSelectedDate && momented.isAfter(this.selectedDates[0].momented)) {
        const endDate = {
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: momented.format(options.format),
          momented,
        }

        const diff = momented.diff(this.selectedDates[0].momented, 'd') - 1
        let diffMomented = []

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
      this.selectedDates[0] = {
        ISO: momented.toISOString(),
        timestamp: momented.toDate().getTime(),
        value: momented.format(options.format),
        momented,
      }

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
}

export default Datepicker
