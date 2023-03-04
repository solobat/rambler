import { baseRequest } from "./base";

const baseURI = "https://xueqiu.com";
const stockBaseURI = "https://stock.xueqiu.com";
const APIList = {
  Timeline: `${baseURI}/statuses/stock_timeline.json`,
  Company: `${stockBaseURI}/v5/stock/f10/cn/company.json`,
};

export function getStockTimeline(code: string, source: string, count = 10) {
  return baseListRequest(APIList.Timeline, code, source, count);
}

export function getStockCompany(code: string) {
  return baseRequest(`${APIList.Company}?symbol=${code}`).then(
    (resp) => resp.data.company
  );
}

function baseListRequest(
  apiName: string,
  code: string,
  source: string,
  count = 10
) {
  const params = [
    ["symbol_id", code],
    ["count", count],
    ["source", source],
    ["page", 1],
  ];
  const str = params.map((pair) => pair.join("=")).join("&");

  return baseRequest(`${APIList.Timeline}?${str}`).then((res) => {
    return res.list ?? [];
  });
}
