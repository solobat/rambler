const baseURI = "https://xueqiu.com";
const APIList = {
  Timeline: "/statuses/stock_timeline.json",
};

export function getStockAnnounce(code: string, count = 10) {
  return baseListRequest(APIList.Timeline, code, '公告', count);
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
  const str = params.map(pair => pair.join('=')).join('&');

  return fetch(`${baseURI}${APIList.Timeline}?${str}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      return res.list ?? [];
    });
}
