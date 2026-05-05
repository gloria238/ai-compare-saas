export type AIResult = Record<
  string, // 产品名，例如 iPhone
  Record<
    string, // feature，例如 price
    string | number | null
  >
>

// export type ProductComparison = {
//   [productName: string]: {
//     [feature: string]: string
//   }
// }

// export type AIResponse =
//   | ProductComparison
//   | {
//       raw: string
//     }

    // 产品对比结构（每个产品 -> 特性键值对）
export type ProductComparison = {
  [productName: string]: {
    [feature: string]: string;
  };
};

// AI 可能的三种响应
export type AIResponse =
  | { raw: string }                              // 解析失败降级
  | { comparison: ProductComparison; summary?: string; winner?: string }; // 正常结果