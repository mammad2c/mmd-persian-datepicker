import { Moment } from "moment-jalaali";
import { ISelectedDateItem } from "../models/general";

const getValueObject = (date: Moment, format: string): ISelectedDateItem => {
  return {
    ISO: date.toISOString(),
    timestamp: date.toDate().getTime(),
    value: date.format(format),
    momented: date,
  };
};

export { getValueObject };
