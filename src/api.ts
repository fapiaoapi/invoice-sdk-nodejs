import { InvoiceClient } from './client';

/**
 * 发票API接口
 */
export class InvoiceAPI {
  private client: InvoiceClient;

  /**
   * 构造函数
   * @param client 客户端实例
   */
  constructor(client: InvoiceClient) {
    this.client = client;
  }

  /**
   * 获取授权
   * @param nsrsbh 纳税人识别号
   * @returns 授权结果
   */
  async getAuthorization(nsrsbh: string): Promise<any> {
    const result = await this.client.request('POST', '/v5/enterprise/authorization', { nsrsbh });
    
    // 如果成功，设置token
    if (result.code === 200 && result.data && result.data.token) {
      this.client.setToken(result.data.token);
    }
    
    return result;
  }

  /**
   * 登录数电发票平台
   * @param params 登录参数
   * @returns 登录结果
   */
  async loginDppt(params: {
    nsrsbh: string;
    username: string;
    password: string;
    sms?: string;
    sf?: string;
    ewmlx?: string;
    ewmid?: string;
  }): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/loginDppt', params);
  }

  /**
   * 获取人脸二维码
   * @param params 请求参数
   * @returns 二维码结果
   */
  async getFaceImg(params: {
    nsrsbh: string;
    username?: string;
    type?: string;
  }): Promise<any> {
    return this.client.request('GET', '/v5/enterprise/getFaceImg', params);
  }

  /**
   * 获取人脸二维码认证状态
   * @param params 请求参数
   * @returns 认证状态
   */
  async getFaceState(params: {
    nsrsbh: string;
    rzid: string;
    username?: string;
    type?: string;
  }): Promise<any> {
    return this.client.request('GET', '/v5/enterprise/getFaceState', params);
  }

  /**
   * 获取认证状态
   * @param params 请求参数
   * @returns 认证状态
   */
  async queryFaceAuthState(params: {
    nsrsbh: string;
    username?: string;
  }): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/queryFaceAuthState', params);
  }

  /**
   * 数电蓝票开具接口
   * @param params 开票参数
   * @returns 开票结果
   */
  async blueTicket(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/blueTicket', params);
  }

  /**
   * 获取销项数电版式文件
   * @param params 请求参数
   * @returns 版式文件
   */
  async getPdfOfdXml(params: {
    downflag: string;
    nsrsbh: string;
    fphm: string;
    kprq?: string;
    addSeal?: string;
    username?: string;
  }): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/pdfOfdXml', params);
  }

  /**
   * 数电申请红字前查蓝票信息接口
   * @param params 请求参数
   * @returns 蓝票信息
   */
  async queryBlueTicket(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/retMsg', params);
  }

  /**
   * 申请红字信息表
   * @param params 请求参数
   * @returns 申请结果
   */
  async applyRedInfo(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/hzxxbsq', params);
  }

  /**
   * 数电票开负数发票
   * @param params 请求参数
   * @returns 开票结果
   */
  async redTicket(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/hzfpkj', params);
  }

  /**
   * 切换电子税务局账号
   * @param params 请求参数
   * @returns 切换结果
   */
  async changeUser(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/changeUser', params);
  }

  /**
   * 授信额度查询
   * @param params 请求参数
   * @returns 查询结果
   */
  async queryCreditLimit(params: any): Promise<any> {
    return this.client.request('POST', '/v5/enterprise/creditLine', params);
  }
   /**
   * 自定义请求
   * @param path 路径
   * @param params 请求参数
   * @param method 方法
   * @returns 查询结果
   */
   async http(path:string,params: any,method:string): Promise<any> {
    return this.client.request(method, path, params);
  }
}