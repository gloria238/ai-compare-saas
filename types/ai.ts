// types/ai.ts

// 基础的产品对比类型（每个产品名对应一个特性对象）
export type ProductComparison = {
  [productName: string]: {
    [feature: string]: string;
  };
};

// 结构化对比结果，包含比较数据、总结和胜出者
export interface StructuredResult {
  comparison: ProductComparison;
  summary?: string;
  winner?: string;
}

// AI 响应：可能是原始文本（解析失败）或结构化结果
export type AIResponse =
  | { raw: string }
  | StructuredResult;