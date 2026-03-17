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
      headers: {}
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

  private buildQueryString(data: Record<string, any>): string {
    const params: string[] = [];
    const appendValue = (key: string, value: any) => {
      if (value === null || value === undefined) {
        params.push(`${encodeURIComponent(key)}=`);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => appendValue(`${key}[${index}]`, item));
        return;
      }
      if (typeof value === 'object') {
        for (const subKey in value) {
          if (Object.prototype.hasOwnProperty.call(value, subKey)) {
            appendValue(`${key}[${subKey}]`, value[subKey]);
          }
        }
        return;
      }
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        appendValue(key, data[key]);
      }
    }
    return params.join('&');
  }
 
  private buildFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    const appendValue = (key: string, value: any) => {
      if (value === null || value === undefined) {
        formData.append(key, '');
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => appendValue(`${key}[${index}]`, item));
        return;
      }
      if (typeof value === 'object') {
        for (const subKey in value) {
          if (Object.prototype.hasOwnProperty.call(value, subKey)) {
            appendValue(`${key}[${subKey}]`, value[subKey]);
          }
        }
        return;
      }
      formData.append(key, value);
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        appendValue(key, data[key]);
      }
    }
    return formData;
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

    try {
      const upperMethod = method.toUpperCase();
      let axiosConfig: AxiosRequestConfig = {
        method: upperMethod,
        url: path
      };
      if (upperMethod === 'GET') {
        const query = this.buildQueryString(data);
        axiosConfig.url = query ? `${path}?${query}` : path;
        axiosConfig.headers = headers;
      } else {
        const formData = this.buildFormData(data);
        axiosConfig.data = formData;
        axiosConfig.headers = {
          ...headers,
          ...formData.getHeaders()
        };
      }

      const response = await this.axiosInstance.request(axiosConfig);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`请求失败: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}
