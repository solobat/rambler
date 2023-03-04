import { Result } from "@src/util/types";
import dayjs from "dayjs";
import { baseRequest } from "./base";

const baseURI = "https://api-one-wscn.awtmt.com/apiv1";
const APIList = {
  Calendar: `${baseURI}/finance/macrodatas`,
};

export function getInvestCalendar(date: string) {
  const start = dayjs(`${date} 00:00:00`).unix()
  const end = dayjs(`${date} 23:59:59`).unix()

  return baseRequest(`${APIList.Calendar}?start=${start}&end=${end}`).then(resp => {
    const list = resp.data.items as Array<any>;
    const fields = ['public_date', 'country', 'title', 'importance', 'actual', 'forecast', 'previous', 'wscn_ticker'];
    const lines = list.map(item => fields.map(field => item[field]));

    return {
      fields, lines
    } as Result
  })
}