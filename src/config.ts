/**
 * SDK配置类
 */
export interface InvoiceConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  timeout?: number;
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: InvoiceConfig = {
  baseUrl: 'https://api.fa-piao.com',
  appKey: '',
  appSecret: '',
  timeout: 30000
};