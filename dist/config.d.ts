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
export declare const DEFAULT_CONFIG: InvoiceConfig;
