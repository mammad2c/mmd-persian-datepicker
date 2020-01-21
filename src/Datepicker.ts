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
  autoClose: boolean
  multiple: boolean
  multipleSeparator: string
  timeout: number
  format: string
  classNames: {
    baseClassName: string
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
  monthName: Array<string>
  onClick?: (selectedDate: ISelectedDates, self: Datepicker) => void
}

const defaultOptionsValue: IOptions = {
  autoClose: false,
  multiple: false,
  multipleSeparator: ' - ',
  timeout: 250,
  format: 'jYYYY/jM/jD',
  classNames: {
    baseClassName: constants.baseClassName,
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
    footerClassName: constants.footerClassName
  },
  arrows: {
    left:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477.175 477.175"><path d="M145.188 238.575l215.5-215.5c5.3-5.3 5.3-13.8 0-19.1s-13.8-5.3-19.1 0l-225.1 225.1c-5.3 5.3-5.3 13.8 0 19.1l225.1 225c2.6 2.6 6.1 4 9.5 4s6.9-1.3 9.5-4c5.3-5.3 5.3-13.8 0-19.1l-215.4-215.5z"/></svg>',
    right:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477.175 477.175"><path d="M360.731 229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1 0s-5.3 13.8 0 19.1l215.5 215.5-215.5 215.5c-5.3 5.3-5.3 13.8 0 19.1 2.6 2.6 6.1 4 9.5 4 3.4 0 6.9-1.3 9.5-4l225.1-225.1c5.3-5.2 5.3-13.8.1-19z"/></svg>'
  },
  weekName: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  monthName: [
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
    'اسفند'
  ]
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
    this.createElement()
    this.isOpen = false
    this.handleClickOutside()
    window.addEventListener('resize', () => {
      if (!this.isOpen) {
        return
      }
      clearTimeout(this.timeoutTemp)
      this.timeoutTemp = setTimeout(this.setPosition, this.options.timeout)
    })
  }

  private calculateDaysInCurrentMonth = (): void => {
    const totalDays = moment.jDaysInMonth(this.currentYear, this.currentMonth)
    for (let i = 1; i <= totalDays; i++) {
      this.daysInCurrentMonth.push(i)
    }
  }

  private calculateFirstDayOfMonth = (): string => {
    const firstDayOfMonth = moment(`${this.currentYear}/${this.currentMonth + 1}/1`, 'jYYYY/jM/jD')
      .day()
      .toString()
    const weekFa = ['1', '2', '3', '4', '5', '6', '0']
    return weekFa[+firstDayOfMonth]
  }

  private createElement = (): void => {
    const options = this.options
    this.calendarElem.setAttribute('id', `${this.elem.getAttribute('id')}-calendar`)
    this.calendarElem.classList.add(options.classNames.baseClassName)

    this.calculateDaysInCurrentMonth()

    // remove any previous data in calendar elem
    while (this.calendarElem.firstChild) {
      this.calendarElem.removeChild(this.calendarElem.firstChild)
    }

    // append header and body for calendar
    this.calendarElem.appendChild(this.createHeader())
    this.calendarElem.appendChild(this.createBody())

    document.body.appendChild(this.calendarElem)

    this.elem.addEventListener('click', this.open)
  }

  private createHeader = (): HTMLElement => {
    const { options } = this,
      header = document.createElement('div'),
      arrowRight = document.createElement('span'),
      title = document.createElement('div'),
      arrowLeft = document.createElement('span')

    header.classList.add(options.classNames.headerClassName)

    arrowRight.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsRightClassName}`
    )
    arrowRight.innerHTML = options.arrows.right

    title.classList.add(options.classNames.titleClassName)
    title.innerHTML = `
			<span class="${options.classNames.titleMonthClassName}">
			${options.monthName[this.currentMonth]}
			</span>
			<span class="${options.classNames.titleYearClassName}">
				${this.currentYear}
			</span>`

    arrowLeft.classList.add(
      `${options.classNames.arrowsClassName}`,
      `${options.classNames.arrowsLeftClassName}`
    )
    arrowLeft.innerHTML = options.arrows.left

    arrowRight.addEventListener('click', this.goPrevMonth)
    arrowLeft.addEventListener('click', this.goNextMonth)

    header.appendChild(arrowRight)
    header.appendChild(title)
    header.appendChild(arrowLeft)

    return header
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

  private createBody = (): HTMLElement => {
    const { options, daysInCurrentMonth, currentYear, currentMonth, selectedDates } = this,
      body = document.createElement('div'),
      days = document.createElement('div'),
      weeks = document.createElement('div'),
      weekName = options.weekName,
      offsetStartWeek = parseInt(this.calculateFirstDayOfMonth())

    body.classList.add(options.classNames.bodyClassName)

    days.classList.add(options.classNames.daysClassName)

    for (let i = 0; i < offsetStartWeek; i++) {
      days.innerHTML += `<span class="${options.classNames.dayItemClassName} ${options.classNames.dayItemClassName}--disabled"></span>`
    }

    for (let i = 1; i <= daysInCurrentMonth.length; i++) {
      const dateValue = `${currentYear}/${currentMonth + 1}/${i}`

      const todayClass =
        this.todayYear === this.currentYear &&
        this.todayMonth === this.currentMonth &&
        i === this.todayDay
          ? options.classNames.dayItemClassName + '--today'
          : ''

      const indexOfSelectedDates = selectedDates.findIndex(selectedItem => {
        return selectedItem.value === dateValue
      })
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

    body.addEventListener('click', e => {
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
      const momented = this.getMomented(dateValue)
      const targetSiblings = siblings(target)
      const indexOfSelectedDates = selectedDates.findIndex(selectedItem => {
        return selectedItem.value === dateValue
      })

      if (!options.multiple) {
        for (let i = 0; i < targetSiblings.length; i++) {
          const element = targetSiblings[i]
          if (element.classList.contains(options.classNames.selectedDayItemClassName)) {
            element.classList.remove(options.classNames.selectedDayItemClassName)
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

      if (options.multiple) {
        if (indexOfSelectedDates === -1) {
          this.selectedDates.push({
            ISO: momented.toISOString(),
            timestamp: momented.toDate().getTime(),
            value: dateValue
          })

          this.addElemValue(`${momented.format(options.format)}${options.multipleSeparator}`)
        } else {
          this.selectedDates.splice(indexOfSelectedDates, 1)

          this.replaceElemValue(
            `${momented.format(options.format)}${options.multipleSeparator}`,
            ''
          )
        }
      } else {
        this.selectedDates[0] = {
          ISO: momented.toISOString(),
          timestamp: momented.toDate().getTime(),
          value: dateValue
        }
        this.setElemValue(dateValue)
      }

      if (typeof options.onClick === 'function') {
        this.onClickEvt(this.selectedDates)
      }

      if (options.autoClose) {
        this.close()
      }
    })

    return body
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
      left: rect.left - elemWin.pageXOffset
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

  private getMomented = (date: string, format?: string): Moment => {
    return moment(`${date}`, format ? format : this.options.format)
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
    this.calendarElem.addEventListener('click', e => {
      e.preventDefault()
      e.stopImmediatePropagation()
    })

    document.addEventListener('click', e => {
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

  public getValue = (): ISelectedDates => {
    return this.selectedDates
  }
}

export default Datepicker
