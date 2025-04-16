"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const config_1 = require("./config");
const utils_1 = require("./utils");
/**
 * 发票API客户端
 */
class InvoiceClient {
    /**
     * 构造函数
     * @param config 配置信息
     */
    constructor(config) {
        this.token = '';
        this.config = { ...config_1.DEFAULT_CONFIG, ...config };
        if (!this.config.appKey || !this.config.appSecret) {
            throw new Error('AppKey和AppSecret不能为空');
        }
        this.axiosInstance = axios_1.default.create({
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
    setToken(token) {
        this.token = token;
    }
    /**
     * 获取授权令牌
     * @returns 授权令牌
     */
    getToken() {
        return this.token;
    }
    /**
     * 发送请求
     * @param method HTTP方法
     * @param path 请求路径
     * @param data 请求数据
     * @returns 响应结果
     */
    async request(method, path, data = {}) {
        // 准备请求头参数
        const randomString = utils_1.Utils.generateRandomString(20);
        const timestamp = utils_1.Utils.getTimestamp();
        // 计算签名
        const signature = utils_1.Utils.calculateSignature(method, path, randomString, timestamp, this.config.appKey, this.config.appSecret);
        // 设置请求头
        const headers = {
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
        const formData = new form_data_1.default();
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // 处理嵌套对象，如fyxm[0][spmc]
                if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                    for (const subKey in data[key]) {
                        if (Object.prototype.hasOwnProperty.call(data[key], subKey)) {
                            formData.append(`${key}[${subKey}]`, data[key][subKey]);
                        }
                    }
                }
                else {
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
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new Error(`请求失败: ${error.response.status} ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}
exports.InvoiceClient = InvoiceClient;
