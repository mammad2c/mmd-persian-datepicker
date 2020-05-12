import moment, { Moment } from 'moment-jalaali'

// library imports
import { constants } from './constants'
import { siblings } from './utils/siblings'

interface ISelectedDateItem {
  ISO: string
  timestamp: number
  value: any
}

interface ISelectedDates extends Array<ISelectedDateItem> {}

interface IElemPosition {
  top: number
  left: number
}

interface IOptions {
  // configs
  defaultValue: Date | string | boolean
  autoClose: boolean
  multiple: boolean
  multipleSeparator: string
  numberOfMonths: number
  timeout: number
  format: string
  classNames: {
    baseClassName: string
    monthWrapperClassName: string
    // headers class name:
    headerClassName: string
    arrowsClassName: string
    arrowsRightClassName: string
    arrowsLeftClassName: string
    titleClassName: string
    titleMonthClassName: string
    titleYearClassName: string
    // body class name:
    bodyClassName: string
    weeksClassName: string
    weekItemClassName: string
    daysClassName: string
    dayItemClassName: string
    selectedDayItemClassName: string
    // footer class name:
    footerClassName: string
  }
  arrows: {
    left: string
    right: string
  }
  weekName: Array<string>
  monthNames: Array<string>
  // events:
  onClick?: (selectedDate: ISelectedDates, self: Datepicker) => void
}

const defaultOptionsValue: IOptions = {
  defaultValue: false,
  autoClose: false,
  multiple: false,
  multipleSeparator: ' - ',
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
  constructor(elem: string, options?: IOptions) {
    const datepicker = new PrivateDatepicker(elem, this, options)
    this.getValue = datepicker.getValue
    this.open = datepicker.open
    this.close = datepicker.close
  }
}

class PrivateDatepicker {
  // constructor elements
  private elem: HTMLInputElement | HTMLElement
  private options: IOptions
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
  private daysInCurrentMonth: number[] = []
  private timeoutTemp?: any
  private isOpen: boolean

  constructor(elem: string, pickerPrivater: Datepicker, options?: IOptions) {
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

  private calculateDaysInCurrentMonth = (): void => {
    const totalDays = moment.jDaysInMonth(this.currentYear, this.currentMonth)
    for (let i = 1; i <= totalDays; i++) {
      this.daysInCurrentMonth.push(i)
    }
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

    this.calculateDaysInCurrentMonth()

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
    const { options, daysInCurrentMonth, currentYear, currentMonth, selectedDates } = this
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

    for (let i = 1; i <= daysInCurrentMonth.length; i++) {
      const dateValue = `${year}/${month}/${i}`

      const todayClass =
        this.todayYear === year && this.todayMonth === month - 1 && i === this.todayDay
          ? options.classNames.dayItemClassName + '--today'
          : ''

      const indexOfSelectedDates = this.getSelectedIndex(dateValue)

      let selectedDate: string

      if (options.multiple) {
        selectedDate =
          indexOfSelectedDates !== -1 ? options.classNames.selectedDayItemClassName : ''
      } else {
        selectedDate =
          selectedDates.length > 0 && selectedDates[0].value === dateValue
            ? options.classNames.selectedDayItemClassName
            : ''
      }

      days.innerHTML += `<span data-date="${dateValue}" class="${options.classNames.dayItemClassName} ${todayClass} ${selectedDate}">${i}</span>`
    }

    weeks.classList.add(options.classNames.weeksClassName)

    for (let i = 0; i < weekName.length; i++) {
      weeks.innerHTML += `<span class="${options.classNames.weekItemClassName}">${weekName[i]}</span>`
    }

    body.appendChild(weeks)
    body.appendChild(days)

    body.addEventListener('click', (e) => {
      const target: HTMLElement = e.target as HTMLElement
      if (
        !(
          target.classList.contains(options.classNames.dayItemClassName) &&
          target.getAttribute('data-date')
        )
      ) {
        return
      }

      const isDateValueNull = target.getAttribute('data-date')
      const dateValue = isDateValueNull ? isDateValueNull : ''
      const targetSiblings = siblings(target)
      const targetParentSiblings = siblings(target.parentElement?.parentElement?.parentElement)
      const indexOfSelectedDates = this.getSelectedIndex(dateValue)

      if (!options.multiple) {
        if (targetSiblings) {
          for (let i = 0; i < targetSiblings.length; i++) {
            const element = targetSiblings[i]
            if (element.classList.contains(options.classNames.selectedDayItemClassName)) {
              element.classList.remove(options.classNames.selectedDayItemClassName)
            }
          }
        }

        if (targetParentSiblings) {
          for (let i = 0; i < targetParentSiblings.length; i++) {
            const monthWrapper = targetParentSiblings[i]

            if (monthWrapper.classList.contains(options.classNames.monthWrapperClassName)) {
              const children = monthWrapper.children[1].children[1].children
              for (let j = 0; j < children.length; j++) {
                const element = children[j]

                if (element.classList.contains(options.classNames.selectedDayItemClassName)) {
                  element.classList.remove(options.classNames.selectedDayItemClassName)
                }
              }
            }
          }
        }
      }

      if (options.multiple && indexOfSelectedDates === -1) {
        target.classList.add(options.classNames.selectedDayItemClassName)
      } else if (options.multiple && indexOfSelectedDates !== -1) {
        target.classList.remove(options.classNames.selectedDayItemClassName)
      } else if (!options.multiple) {
        target.classList.add(options.classNames.selectedDayItemClassName)
      }

      this.setValue(dateValue)

      if (typeof options.onClick === 'function') {
        this.onClickEvt(this.selectedDates)
      }

      if (options.autoClose) {
        this.close()
      }
    })

    return body
  }

  private goNextMonth = (e: MouseEvent): void => {
    this.currentMonth = this.currentMonth !== 11 ? ++this.currentMonth : 0
    if (this.currentMonth === 0) {
      this.currentYear++
    }
    this.daysInCurrentMonth = []
    this.createElement()
  }

  private goPrevMonth = (): void => {
    this.currentMonth = this.currentMonth !== 0 ? --this.currentMonth : 11
    if (this.currentMonth === 11) {
      this.currentYear--
    }
    this.daysInCurrentMonth = []
    this.createElement()
  }

  private onClickEvt = (selectedDate: ISelectedDates) => {
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
    const indexOfSelectedDates = this.getSelectedIndex(dateValue)

    if (options.multiple) {
      if (indexOfSelectedDates === -1) {
        this.selectedDates.push({
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: momented.format(options.format),
        })

        this.addElemValue(`${momented.format(options.format)}${options.multipleSeparator}`)
      } else {
        this.selectedDates.splice(indexOfSelectedDates, 1)

        this.replaceElemValue(`${momented.format(options.format)}${options.multipleSeparator}`, '')
      }
    } else {
      this.selectedDates[0] = {
        ISO: momented.toISOString(),
        timestamp: momented.toDate().getTime(),
        value: momented.format(options.format),
      }

      this.setElemValue(momented.format(options.format))
    }
  }

  private getSelectedIndex = (dateValue: Moment | string): number => {
    const { selectedDates, options } = this

    const momented = this.getMomented(dateValue)

    return selectedDates.findIndex((selectedItem) => {
      return selectedItem.value === momented.format(options.format)
    })
  }

  private isMonthOverflow = (additional: number = 0): boolean => {
    return additional + this.currentMonth >= this.options.monthNames.length
  }
}

export default Datepicker
