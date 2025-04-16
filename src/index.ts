import { InvoiceClient } from './client';
import { InvoiceAPI } from './api';
import { InvoiceConfig } from './config';
import { Utils } from './utils';

/**
 * 数电发票SDK
 */
export class TaxInvoice {
  private client: InvoiceClient;
  public api: InvoiceAPI;

  /**
   * 构造函数
   * @param config 配置信息
   */
  constructor(config: Partial<InvoiceConfig>) {
    this.client = new InvoiceClient(config);
    this.api = new InvoiceAPI(this.client);
  }

  /**
   * 获取客户端实例
   * @returns 客户端实例
   */
  getClient(): InvoiceClient {
    return this.client;
  }

  /**
   * 设置授权令牌
   * @param token 授权令牌
   */
  setToken(token: string): void {
    this.client.setToken(token);
  }
}

// 导出所有类和接口
export { InvoiceClient, InvoiceAPI, InvoiceConfig, Utils };

// 默认导出TaxInvoice类
export default TaxInvoice;