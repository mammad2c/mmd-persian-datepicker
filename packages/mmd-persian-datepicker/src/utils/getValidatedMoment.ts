import moment, { Moment } from 'moment-jalaali'

const getValidatedMoment = (
  value: Moment | Date | string | undefined | null,
  format: string
): Moment | null => {
  if (moment.isMoment(value)) {
    return value
  } else if (typeof value === 'string') {
    return moment(value, format)
  } else if (value instanceof Date) {
    return moment(value, format)
  } else {
    return null
  }
}

export { getValidatedMoment }
