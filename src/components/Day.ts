import moment, { Moment } from 'moment-jalaali'
import { constants } from '../configs/constants'
import { getValueObject } from '../utils/getValueObject'
import { ISelectedDateItem, mode, ISelectedDates } from '../types'

interface IDay {
  date: Moment
  selectedDates: ISelectedDates
  minDate?: Moment
  onClick?: (params: ISelectedDateItem) => void
  today: Moment
  isDisabled?: boolean
  setValue: (dateValue: string | moment.Moment) => void
  setInRangeDates: (value: Array<Moment>) => void
  mode: mode
  autoClose: boolean
  format: string
  multiple: boolean
  findSelectedDate: (dateValue: Moment | string) => ISelectedDateItem | undefined
  findInRangeDate: (dateValue: Moment | string) => ISelectedDateItem['momented'] | undefined
  handleDaysState: () => void
  disabledDates: Array<Moment>
}

interface IDayUpdate {
  selectedDates: IDay['selectedDates']
  minDate: IDay['minDate']
  mode: IDay['mode']
  autoClose: IDay['autoClose']
  isDisabled?: IDay['isDisabled']
  format: IDay['format']
  multiple: IDay['multiple']
  disabledDates: Array<Moment>
}

class Day {
  private date: IDay['date']
  private isDisabled?: boolean
  private onClick?: IDay['onClick']
  private today: IDay['today']
  private mode: IDay['mode']
  private selectedDates: IDay['selectedDates']
  private minDate: IDay['minDate']
  private setValue: IDay['setValue']
  private autoClose: IDay['autoClose']
  private format: IDay['format']
  private setInRangeDates: IDay['setInRangeDates']
  private dayElem: HTMLSpanElement
  private multiple: IDay['multiple']
  private findSelectedDate: IDay['findSelectedDate']
  private findInRangeDate: IDay['findInRangeDate']
  private handleDaysState: IDay['handleDaysState']
  private disabledDates: IDay['disabledDates']

  constructor({
    date,
    onClick,
    minDate,
    today,
    isDisabled,
    mode,
    selectedDates,
    setValue,
    autoClose,
    format,
    setInRangeDates,
    multiple,
    findSelectedDate,
    findInRangeDate,
    handleDaysState,
    disabledDates,
  }: IDay) {
    this.date = date
    this.onClick = onClick
    this.today = today
    this.mode = mode
    this.minDate = minDate
    this.selectedDates = selectedDates
    this.setValue = setValue
    this.autoClose = autoClose
    this.format = format
    this.setInRangeDates = setInRangeDates
    this.dayElem = document.createElement('span')
    this.multiple = multiple
    this.findSelectedDate = findSelectedDate
    this.findInRangeDate = findInRangeDate
    this.handleDaysState = handleDaysState
    this.isDisabled = isDisabled
    this.handleDisable()
    this.disabledDates = disabledDates
  }

  private handleOnDayClick = () => {
    const { isDisabled } = this

    if (isDisabled) {
      return
    }

    const { date, minDate, setValue, mode, onClick, autoClose, format, setInRangeDates } = this

    if (minDate && date.isBefore(minDate, 'd')) {
      return
    }

    if (mode === 'range') [setInRangeDates([date.clone().add(1, 'd')])]
    else {
      setInRangeDates([])
    }

    setValue(date)

    if (typeof onClick === 'function') {
      onClick(getValueObject(date, format))
    }
  }

  private handleOnDayHover = () => {
    const { isDisabled, mode } = this

    if (isDisabled || mode === 'single') {
      return
    }

    const { selectedDates, date, minDate, setInRangeDates, handleDaysState } = this

    if (minDate && date.isBefore(this.minDate, 'd')) {
      return
    }

    const startDate = selectedDates[0]
    const endDate = selectedDates[1]

    if (!startDate || endDate) {
      return
    }

    const diff = date.diff(startDate.momented, 'd')
    let diffMomented = []

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        const momentedDiff = startDate.momented.clone().add(i, 'd')

        diffMomented.push(momentedDiff)
      }
    }

    setInRangeDates([...diffMomented])
    handleDaysState()
  }

  private handleDisable = () => {
    const { isDisabled, minDate, date } = this
    if (isDisabled || this.isInDisabledDates()) {
      this.isDisabled = true
    } else if (minDate && date.isBefore(minDate, 'd')) {
      this.isDisabled = true
    } else {
      this.isDisabled = false
    }
  }

  private isInDisabledDates = (): boolean => {
    const { disabledDates, date } = this

    if (!disabledDates) {
      return false
    }

    return !!disabledDates.find((item) => date.isSame(item, 'd'))
  }

  public getDate = () => {
    return this.date
  }

  public updateDayState = ({
    minDate,
    mode,
    selectedDates,
    isDisabled,
    autoClose,
    format,
    multiple,
  }: IDayUpdate) => {
    this.mode = mode
    this.minDate = minDate
    this.selectedDates = selectedDates
    this.autoClose = autoClose
    this.format = format
    this.multiple = multiple
    this.isDisabled = isDisabled
    const { dayElem, date } = this
    const startDate = selectedDates[0]
    this.handleDisable()

    if (this.isDisabled) {
      dayElem.classList.add(constants.disabledDayItemClassName)
    } else {
      const foundedSelectedDate = this.findSelectedDate(date)

      if (date.isSame(new Date(), 'd')) {
        dayElem.classList.add(constants.todayClassName)
      } else if (dayElem.classList.contains(constants.todayClassName)) {
        dayElem.classList.remove(constants.todayClassName)
      }

      if (dayElem.classList.contains(constants.selectedDayItemClassName) && !foundedSelectedDate) {
        dayElem.classList.remove(constants.selectedDayItemClassName)
      } else if (foundedSelectedDate) {
        dayElem.classList.add(constants.selectedDayItemClassName)
      }

      if (this.multiple && foundedSelectedDate) {
        dayElem.classList.add(constants.selectedDayItemClassName)
      } else if (this.multiple && !foundedSelectedDate) {
        dayElem.classList.remove(constants.selectedDayItemClassName)
      }

      if (mode === 'range' && startDate) {
        const isInRange = this.findInRangeDate(date)

        if (isInRange) {
          dayElem.classList.add(constants.inRangeDayItemClassName)
        } else {
          dayElem.classList.remove(constants.inRangeDayItemClassName)
        }
      }
    }
  }

  public render() {
    const { today, date, isDisabled, mode, dayElem } = this
    const dayElemText = document.createTextNode(`${date.jDate()}`)
    dayElem.appendChild(dayElemText)
    dayElem.classList.add(constants.dayItemClassName)

    if (today.isSame(date, 'd')) {
      dayElem.classList.add(constants.todayClassName)
    } else if (dayElem.classList.contains(constants.todayClassName)) {
      dayElem.classList.remove(constants.todayClassName)
    }

    if (isDisabled) {
      dayElem.classList.add(constants.disabledDayItemClassName)
    } else if (dayElem.classList.contains(constants.disabledDayItemClassName)) {
      dayElem.classList.remove(constants.disabledDayItemClassName)
    }

    if (!isDisabled) {
      dayElem.addEventListener('click', this.handleOnDayClick)

      if (mode === 'range') {
        dayElem.addEventListener('mouseenter', this.handleOnDayHover)
      }
    }

    return dayElem
  }
}

export default Day
