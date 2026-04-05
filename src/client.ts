import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { InvoiceConfig, DEFAULT_CONFIG } from './config';
import { Utils } from './utils';

/**
 * 发票API客户端
 */
export class InvoiceClient {
  private config: InvoiceConfig;
  private axiosInstance: AxiosInstance;
  private token: string = '';

  private appendFormData(formData: FormData, key: string, value: any): void {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        this.appendFormData(formData, `${key}[${index}]`, item);
      });
      return;
    }
    if (typeof value === 'object') {
      Object.keys(value).forEach((subKey) => {
        this.appendFormData(formData, `${key}[${subKey}]`, value[subKey]);
      });
      return;
    }
    formData.append(key, value);
  }

  private formatDebugData(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  }

  private debugLogRequest(
    method: string,
    path: string,
    headers: Record<string, string>,
    data: Record<string, any>
  ): void {
    if (!this.config.debug) {
      return;
    }
    const requestInfo = {
      url: `${this.config.baseUrl}${path}`,
      method: method.toUpperCase(),
      headers,
      params: data
    };
    console.log('[TaxInvoice SDK][Request]');
    console.log(this.formatDebugData(requestInfo));
  }

  private debugLogResponse(path: string, statusCode: number, responseData: any): void {
    if (!this.config.debug) {
      return;
    }
    console.log('[TaxInvoice SDK][Response]');
    // console.log(this.formatDebugData({ url: `${this.config.baseUrl}${path}`, statusCode, data: responseData }));
    console.log(this.formatDebugData({ StatusCode: statusCode, data: responseData }));
  }

  private debugLogError(path: string, errorData: any): void {
    if (!this.config.debug) {
      return;
    }
    console.log('[TaxInvoice SDK][Error]');
    console.log(this.formatDebugData({ url: `${this.config.baseUrl}${path}`, data: errorData }));
  }

  /**
   * 构造函数
   * @param config 配置信息
   */
  constructor(config: Partial<InvoiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (!this.config.appKey || !this.config.appSecret) {
      throw new Error('AppKey和AppSecret不能为空');
    }

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * 设置授权令牌
   * @param token 授权令牌
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 获取授权令牌
   * @returns 授权令牌
   */
  getToken(): string {
    return this.token;
  }

  /**
   * 发送请求
   * @param method HTTP方法
   * @param path 请求路径
   * @param data 请求数据
   * @returns 响应结果
   */
  async request<T = any>(method: string, path: string, data: Record<string, any> = {}): Promise<T> {
    // 准备请求头参数
    const randomString = Utils.generateRandomString(20);
    const timestamp = Utils.getTimestamp();
    
    // 计算签名
    const signature = Utils.calculateSignature(
      method,
      path,
      randomString,
      timestamp,
      this.config.appKey,
      this.config.appSecret
    );
    
    // 设置请求头
    const headers: Record<string, string> = {
      'AppKey': this.config.appKey,
      'Sign': signature,
      'TimeStamp': timestamp,
      'RandomString': randomString
    };

    // 如果有token，添加到请求头
    if (this.token) {
      headers['Authorization'] = this.token;
    }

    this.debugLogRequest(method, path, headers, data);

    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        this.appendFormData(formData, key, data[key]);
      }
    }

    try {
      const response = await this.axiosInstance.request({
        method,
        url: path,
        data: formData,
        headers: {
          ...headers,
          ...formData.getHeaders()
        }
      });
      this.debugLogResponse(path, response.status, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.debugLogError(path, {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(`请求失败: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      }
      this.debugLogError(path, String(error));
      throw error;
    }
  }
}
