import { IComment } from "@src/server/db/database";

export const FieldsMap = {
  roe: "ROE",
  close: "收盘价",
  volume_ratio: "量比",
  pe_ttm: "PE",
  turnover_rate: "换手率",
  name: "名称",
  ts_code: "代码",
  ann_date: "公告日期",
  end_date: "报告期",
  inv_turn: "存货周转率",
  ar_turn: "应收账款周转率",
  fcff: "自由现金流",
  grossprofit_margin: "销售毛利率",
  debt_to_assets: "资产负债率",
  op_yoy: "利润同比",
  ocf_yoy: "经营现金流同比",
  industry: "行业",
  pb: "PB",
  pe: "PE",
  dv_ratio: "股息率",
  total_mv: "市值",
  ocf_to_profit: "经现利润比",
  total_revenue: "营业总收入",
  revenue: "营业收入",
  core_profit: "核心利润",
  fv_value_chg_gain: "公允价值变动",
  invest_income: "投资净收益",
  total_cogs: "营业总成本",
  oper_cost: "营业成本",
  sell_exp: "销售费用",
  admin_exp: "管理费用",
  operate_profit: "营业利润",
  n_income: "净利润",
  rd_exp: "研发费用",
  n_cashflow_act: "经营现金流量净额",
  n_cashflow_inv_act: "投资现金流量净额",
  loss_fv_chg: "公允价值变动损失",
  invest_loss: "投资损失",
  decr_inventories: "存货的减少",
};

export function sortComments(list: IComment[]) {
  const symbols = ["$", "%", "!", "#", "["].reverse();
  const isSp = (item) => symbols.some((s) => item.text.startsWith(s));
  const shouldSort = list.some(isSp);

  if (shouldSort) {
    return list.sort((a, b) => {
      const aIndex = symbols.indexOf(a.text[0]);
      const bIndex = symbols.indexOf(b.text[0]);

      return aIndex < bIndex ? 1 : -1;
    });
  } else {
    return list;
  }
}
