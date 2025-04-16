import { InvoiceClient } from './client';
import { InvoiceAPI } from './api';
import { InvoiceConfig } from './config';
import { Utils } from './utils';
/**
 * 数电发票SDK
 */
export declare class TaxInvoice {
    private client;
    api: InvoiceAPI;
    /**
     * 构造函数
     * @param config 配置信息
     */
    constructor(config: Partial<InvoiceConfig>);
    /**
     * 获取客户端实例
     * @returns 客户端实例
     */
    getClient(): InvoiceClient;
    /**
     * 设置授权令牌
     * @param token 授权令牌
     */
    setToken(token: string): void;
}
export { InvoiceClient, InvoiceAPI, InvoiceConfig, Utils };
export default TaxInvoice;
