import { DateTime } from "luxon";

export type ScrapedData = {
  name: string;
  reply: boolean;
  dateTime: DateTime;
};
