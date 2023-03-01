import { Result } from "@src/util/types";

const baseURI = "http://api.tushare.pro";
const APIList = {
  Indicator: "fina_indicator",
  Daily: "daily_basic",
  Income: "income",
  Cashflow: "cashflow"
};

export function getStockDaily(token: string, code: string) {
  const fields = ["close", "volume_ratio", "pe_ttm", "turnover_rate"];

  return baseListRequest(token, APIList.Daily, code, fields);
}

export function getStockIncome(token: string, code: string) {
  const fields = [
    "end_date",
    "total_revenue",
    "revenue",
    "fv_value_chg_gain",
    "invest_income",
    "total_cogs",
    "oper_cost",
    "sell_exp",
    "admin_exp",
    "operate_profit",
    "n_income",
    "rd_exp",
  ];

  return baseListRequest(token, APIList.Income, code, fields).then(
    addCoreProfitField
  );
}

export function getStockCashflow(token: string, code: string) {
  const fields = [
    "end_date",
    "n_cashflow_act",
    "loss_fv_chg",
    "n_cashflow_inv_act",
    "invest_loss",
    "decr_inventories",
  ];

  return baseListRequest(token, APIList.Cashflow, code, fields);
}

function addCoreProfitField(result: Result) {
  const { fields, lines } = result;
  const index = (name: string, fields: string[]) => fields.indexOf(name);
  const calcCoreProfit = (line: Array<number>) =>
    (line[index("operate_profit", fields)] || 0) -
    (line[index("fv_value_chg_gain", fields)] || 0) -
    (line[index("invest_income", fields)] || 0);

  fields.push("core_profit");
  lines.forEach((line) => {
    const coreProfit = calcCoreProfit(line as Array<number>);

    line.push(coreProfit);
  });

  return result;
}

export function getStockIndicators(token: string, code: string) {
  const fields = [
    "end_date",
    "roe",
    "inv_turn",
    "ar_turn",
    "fcff",
    "grossprofit_margin",
    "debt_to_assets",
    "ocf_to_profit",
    "op_yoy",
    "ocf_yoy",
  ];

  return baseListRequest(token, APIList.Indicator, code, fields);
}

function uniqStockData(items: Array<Array<number>>, index: number) {
  return items.reduce((memo, line) => {
    if (memo.length) {
      const latest = memo[memo.length - 1];
      if (latest[index] !== line[index]) {
        memo.push(line);
      }
    } else {
      memo.push(line);
    }

    return memo;
  }, [] as typeof items);
}

function shouldUniq(apiName: string) {
  return apiName !== APIList.Daily;
}

function baseListRequest(
  token: string,
  apiName: string,
  code: string,
  fields: string[],
  limit = 10
) {
  const data = {
    api_name: apiName,
    token,
    params: { ts_code: code, limit },
    fields,
  };
  return fetch(baseURI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      const fields: string[] = res.data.fields;
      const list = res.data.items ?? [];
      const lines = shouldUniq(apiName) ? uniqStockData(list, 0) : list;

      return {
        fields,
        lines,
      } as Result;
    });
}
