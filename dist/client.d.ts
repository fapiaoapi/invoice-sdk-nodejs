import { InvoiceConfig } from './config';
/**
 * 发票API客户端
 */
export declare class InvoiceClient {
    private config;
    private axiosInstance;
    private token;
    /**
     * 构造函数
     * @param config 配置信息
     */
    constructor(config: Partial<InvoiceConfig>);
    /**
     * 设置授权令牌
     * @param token 授权令牌
     */
    setToken(token: string): void;
    /**
     * 获取授权令牌
     * @returns 授权令牌
     */
    getToken(): string;
    /**
     * 发送请求
     * @param method HTTP方法
     * @param path 请求路径
     * @param data 请求数据
     * @returns 响应结果
     */
    request<T = any>(method: string, path: string, data?: Record<string, any>): Promise<T>;
}
