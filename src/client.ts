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

    // 创建FormData
    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // 处理嵌套对象，如fyxm[0][spmc]
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          for (const subKey in data[key]) {
            if (Object.prototype.hasOwnProperty.call(data[key], subKey)) {
              formData.append(`${key}[${subKey}]`, data[key][subKey]);
            }
          }
        } else {
          // 直接添加键值对，不拆分字符串
          formData.append(key, data[key]);
        }
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

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`请求失败: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}