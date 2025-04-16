import crypto from 'crypto';

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
   * 格式化金额，保留2位小数
   * @param amount 金额
   * @returns 格式化后的金额字符串
   */
  static formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * 计算税额
   * @param amount 金额
   * @param taxRate 税率
   * @param isIncludeTax 是否含税，默认为false
   * @returns 税额字符串
   */
  static calculateTax(amount: number | string, taxRate: number | string, isIncludeTax: boolean = false): string {
    const amountNum = parseFloat(amount as string);
    const taxRateNum = parseFloat(taxRate as string);
    
    let tax: number;
    if (isIncludeTax) {
      // 含税计算：税额 = 金额 / (1 + 税率) * 税率
      tax = amountNum / (1 + taxRateNum) * taxRateNum;
    } else {
      // 不含税计算：税额 = 金额 * 税率
      tax = amountNum * taxRateNum;
    }
    
    return Utils.formatAmount(tax);
  }

  /**
   * 计算不含税金额
   * @param amount 含税金额
   * @param taxRate 税率
   * @returns 不含税金额字符串
   */
  static calculateAmountWithoutTax(amount: number | string, taxRate: number | string): string {
    const amountNum = parseFloat(amount as string);
    const taxRateNum = parseFloat(taxRate as string);
    
    // 不含税金额 = 含税金额 / (1 + 税率)
    const amountWithoutTax = amountNum / (1 + taxRateNum);
    
    return Utils.formatAmount(amountWithoutTax);
  }

  /**
   * 计算含税金额
   * @param amount 不含税金额
   * @param taxRate 税率
   * @returns 含税金额字符串
   */
  static calculateAmountWithTax(amount: number | string, taxRate: number | string): string {
    const amountNum = parseFloat(amount as string);
    const taxRateNum = parseFloat(taxRate as string);
    
    // 含税金额 = 不含税金额 * (1 + 税率)
    const amountWithTax = amountNum * (1 + taxRateNum);
    
    return Utils.formatAmount(amountWithTax);
  }
}