export type HashMap<T = string> = { [key: string]: T };

/** schema */
export const schema = [
  "product_name",
  "price",
  "stock",
  "sold",
  "sold_prices",
] as const;
/** end schema */
export type SheetLabel = (typeof schema)[number];
