import { InvoiceClient } from './client';
/**
 * 发票API接口
 */
export declare class InvoiceAPI {
    private client;
    /**
     * 构造函数
     * @param client 客户端实例
     */
    constructor(client: InvoiceClient);
    /**
     * 获取授权
     * @param nsrsbh 纳税人识别号
     * @returns 授权结果
     */
    getAuthorization(nsrsbh: string): Promise<any>;
    /**
     * 登录数电发票平台
     * @param params 登录参数
     * @returns 登录结果
     */
    loginDppt(params: {
        nsrsbh: string;
        username: string;
        password: string;
        sms?: string;
        sf?: string;
        ewmlx?: string;
        ewmid?: string;
    }): Promise<any>;
    /**
     * 获取人脸二维码
     * @param params 请求参数
     * @returns 二维码结果
     */
    getFaceImg(params: {
        nsrsbh: string;
        username?: string;
        type?: string;
    }): Promise<any>;
    /**
     * 获取人脸二维码认证状态
     * @param params 请求参数
     * @returns 认证状态
     */
    getFaceState(params: {
        nsrsbh: string;
        rzid: string;
        username?: string;
        type?: string;
    }): Promise<any>;
    /**
     * 获取认证状态
     * @param params 请求参数
     * @returns 认证状态
     */
    queryFaceAuthState(params: {
        nsrsbh: string;
        username?: string;
    }): Promise<any>;
    /**
     * 数电蓝票开具接口
     * @param params 开票参数
     * @returns 开票结果
     */
    blueTicket(params: any): Promise<any>;
    /**
     * 获取销项数电版式文件
     * @param params 请求参数
     * @returns 版式文件
     */
    getPdfOfdXml(params: {
        downflag: string;
        nsrsbh: string;
        fphm: string;
        kprq?: string;
        addSeal?: string;
        username?: string;
    }): Promise<any>;
    /**
     * 数电申请红字前查蓝票信息接口
     * @param params 请求参数
     * @returns 蓝票信息
     */
    queryBlueTicket(params: any): Promise<any>;
    /**
     * 申请红字信息表
     * @param params 请求参数
     * @returns 申请结果
     */
    applyRedInfo(params: any): Promise<any>;
    /**
     * 数电票开负数发票
     * @param params 请求参数
     * @returns 开票结果
     */
    redTicket(params: any): Promise<any>;
    /**
     * 切换电子税务局账号
     * @param params 请求参数
     * @returns 切换结果
     */
    changeUser(params: any): Promise<any>;
    /**
     * 授信额度查询
     * @param params 请求参数
     * @returns 查询结果
     */
    queryCreditLimit(params: any): Promise<any>;
    /**
    * 自定义请求
    * @param path 路径
    * @param params 请求参数
    * @param method 方法
    * @returns 查询结果
    */
    http(path: string, params: any, method: string): Promise<any>;
}
