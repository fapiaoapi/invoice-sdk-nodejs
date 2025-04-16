/**
 * 工具类 - 提供签名、随机字符串等通用功能
 */
export declare class Utils {
    /**
     * 生成随机字符串
     * @param length 字符串长度，默认20
     * @returns 随机字符串
     */
    static generateRandomString(length?: number): string;
    /**
     * 获取当前时间戳（秒）
     * @returns 时间戳字符串
     */
    static getTimestamp(): string;
    /**
     * 计算签名
     * @param method HTTP方法
     * @param path 请求路径
     * @param randomString 随机字符串
     * @param timestamp 时间戳
     * @param appKey 应用密钥
     * @param appSecret 应用密钥
     * @returns 签名
     */
    static calculateSignature(method: string, path: string, randomString: string, timestamp: string, appKey: string, appSecret: string): string;
    /**
     * 格式化金额，保留2位小数
     * @param amount 金额
     * @returns 格式化后的金额字符串
     */
    static formatAmount(amount: number): string;
    /**
     * 计算税额
     * @param amount 金额
     * @param taxRate 税率
     * @param isIncludeTax 是否含税，默认为false
     * @returns 税额字符串
     */
    static calculateTax(amount: number | string, taxRate: number | string, isIncludeTax?: boolean): string;
    /**
     * 计算不含税金额
     * @param amount 含税金额
     * @param taxRate 税率
     * @returns 不含税金额字符串
     */
    static calculateAmountWithoutTax(amount: number | string, taxRate: number | string): string;
    /**
     * 计算含税金额
     * @param amount 不含税金额
     * @param taxRate 税率
     * @returns 含税金额字符串
     */
    static calculateAmountWithTax(amount: number | string, taxRate: number | string): string;
}
