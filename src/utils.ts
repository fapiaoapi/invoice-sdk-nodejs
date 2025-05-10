import crypto from 'crypto';
import { Decimal } from 'decimal.js';

/**
 * 工具类 - 提供签名、随机字符串等通用功能
 */
export class Utils {
  /**
   * 生成随机字符串
   * @param length 字符串长度，默认20
   * @returns 随机字符串
   */
  static generateRandomString(length: number = 20): string {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
  }

  /**
   * 获取当前时间戳（秒）
   * @returns 时间戳字符串
   */
  static getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

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
  static calculateSignature(
    method: string,
    path: string,
    randomString: string,
    timestamp: string,
    appKey: string,
    appSecret: string
  ): string {
    // 构建签名字符串
    const signContent = `Method=${method}&Path=${path}&RandomString=${randomString}&TimeStamp=${timestamp}&AppKey=${appKey}`;
    
    // 使用HMAC-SHA256计算签名
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(signContent);
    const signature = hmac.digest('hex');
    
    // 转为大写
    return signature.toUpperCase();
  }



  /**
   * 计算税额
   * @param amount 金额
   * @param taxRate 税率
   * @param isIncludeTax 是否含税，默认为false
   * @param scale 小数位数，默认2位
   * @returns 税额
   */
  static calculateTax(amount: number | string, taxRate: number | string, isIncludeTax: boolean = false, scale: number = 2): string {
    const amountDecimal = new Decimal(amount);
    const taxRateDecimal = new Decimal(taxRate);
    
    let tax: Decimal;
    if (isIncludeTax) {
      // 含税计算：税额 = 金额 / (1 + 税率) * 税率
      tax = amountDecimal.div(taxRateDecimal.add(1)).mul(taxRateDecimal);
    } else {
      // 不含税计算：税额 = 金额 * 税率
      tax = amountDecimal.mul(taxRateDecimal);
    }
    
    return tax.toFixed(scale);
  }
}
