export interface ISelectedDateItem {
  ISO: string
  timestamp: number
  value: any
}

export interface ISelectedDates extends Array<ISelectedDateItem> {}

export interface IElemPosition {
  top: number
  left: number
}

export interface IOptions<T> {
  // configs
  defaultValue: Date | string | boolean
  autoClose: boolean
  mode: 'single' | 'range'
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
  onClick?: (selectedDate: ISelectedDates, self: T) => void
}
