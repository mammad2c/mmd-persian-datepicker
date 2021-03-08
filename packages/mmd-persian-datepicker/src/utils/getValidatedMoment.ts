import moment, { Moment } from "moment-jalaali";

const getValidatedMoment = (
  value: Moment | Date | string | undefined | null,
  format: string
): Moment | null => {
  if (moment.isMoment(value)) {
    return value;
  }
  if (typeof value === "string") {
    return moment(value, format);
  }
  if (value instanceof Date) {
    return moment(value, format);
  }
  return null;
};

export { getValidatedMoment };
