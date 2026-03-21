# 电子发票/数电发票 nodejs SDK | 开票、验真、红冲一站式集成

[![npm version](https://img.shields.io/npm/v/tax-invoice.svg?style=flat)](https://www.npmjs.com/package/tax-invoice)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/fapiaoapi/invoice-sdk-nodejs/blob/master/LICENSE)

**发票 nodejs SDK** 专为电子发票、数电发票（全电发票）场景设计，支持**开票、红冲、版式文件下载**等核心功能，快速对接税务平台API。

**关键词**: 电子发票SDK,数电票nodejs,开票接口,发票api,发票开具,发票红冲,全电发票集成

---

## 📖 核心功能

### 基础认证
- ✅ **获取授权** - 快速接入税务平台身份认证
- ✅ **人脸二维码登录** - 支持数电发票平台扫码登录
- ✅ **认证状态查询** - 实时获取纳税人身份状态

### 发票开具
- 🟦 **数电蓝票开具** - 支持增值税普通/专用电子发票
- 📄 **版式文件下载** - 自动获取销项发票PDF/OFD/XML文件

### 发票红冲
- 🔍 **红冲前蓝票查询** - 精确检索待红冲的电子发票
- 🛑 **红字信息表申请** - 生成红冲凭证
- 🔄 **负数发票开具** - 自动化红冲流程

---

## 🚀 快速安装

```bash
npm install tax-invoice
```

[📦 查看npm最新版本](https://www.npmjs.com/package/tax-invoice "发票sdk")

---



[📚 查看完整中文文档](https://fa-piao.com/doc.html?source=github) 

---

## 🔍 为什么选择此SDK？
- **精准覆盖中国数电发票标准** - 严格遵循国家最新接口规范
- **开箱即用** - 无需处理XML/签名等底层细节，专注业务逻辑
- **企业级验证** - 已在生产环境处理超100万张电子发票

---

## 📊 支持的开票类型
| 发票类型       | 状态   |
|----------------|--------|
| 数电发票（普通发票） | ✅ 支持 |
| 数电发票（增值税专用发票） | ✅ 支持 |
| 数电发票（铁路电子客票）  | ✅ 支持 |
| 数电发票（航空运输电子客票行程单） | ✅ 支持  |
| 数电票（二手车销售统一发票） | ✅ 支持  |
| 数电纸质发票（增值税专用发票） | ✅ 支持  |
| 数电纸质发票（普通发票） | ✅ 支持  |
| 数电纸质发票（机动车发票） | ✅ 支持  |
| 数电纸质发票（二手车发票） | ✅ 支持  |

---

## 🤝 贡献与支持
- 提交Issue: [问题反馈](https://github.com/fapiaoapi/invoice-sdk-nodejs/issues)
- 商务合作: yuejianghe@qq.com


### 开票
```bash
const { TaxInvoice } = require('tax-invoice');


const { createClient } = require('redis');
const QRCode = require('qrcode');

// 配置信息
const appKey = '';
const appSecret = '';

const nsrsbh = ''; // 统一社会信用代码
const title = ""; // 名称（营业执照）
const username = ""; // 手机号码（电子税务局）
const password = ""; // 个人用户密码（电子税务局）
const sf = "01"; // 身份（电子税务局）
const type = "6"; //6基础 7 标准版
const fphm = "";
const kprq = "";
let  token = "";

// 初始化SDK
const taxInvoice = new TaxInvoice({
  appKey: appKey,
  appSecret: appSecret
});



// 主函数
async function main() {
  try {
    
    //一 获取授权

    // 从缓存redis中获取Token 安装npm install redis
    const client = createClient({
      url: 'redis://:test123456@localhost:6379'
    });
    await client.connect();
    const key = nsrsbh + "@" + username + "@TOKEN";
    token = await client.get(key);
    if (token) {
      taxInvoice.setToken(token);
      console.log("Token From Redis");
    } else {
      /*
      * 获取授权Token文档
      * @link https://fa-piao.com/doc.html#api1?source=github
      */
      const authResult = await taxInvoice.api.getAuthorization(nsrsbh,type);
      // const authResult = await taxInvoice.api.getAuthorization(nsrsbh,type,username,password);
      console.log('授权结果:', authResult);
      if (authResult.code === 200) {
        const newToken = authResult.data.token;
        taxInvoice.setToken(newToken);
        await client.set(key, authResult.data.token, { EX: 3600 * 24 * 30 });// 设置过期时间为30天
        console.log("授权成功，Token:", newToken);
      } else {
        console.log("授权失败:", authResult.msg);
        return;
      }
    }

    /*
     * 前端模拟数电发票/电子发票开具 (蓝字发票)
     * @link https://fa-piao.com/fapiao.html?source=github
     */

    //二 开具蓝票
    /*
     * 开具数电发票文档
     * @link https://fa-piao.com/doc.html#api6?source=github
     *
     * 开票参数说明demo
     * @link https://github.com/fapiaoapi/invoice-sdk-nodejs/blob/master/examples/tax_example.ts
     */
      const invoiceParams = {
          username: username,
          fpqqlsh: appKey + Date.now(),
          fplxdm: '82',
          kplx: '0',
          xhdwsbh: nsrsbh,
          xhdwmc: '重庆悦江河科技有限公司',
          xhdwdzdh: '重庆市渝北区仙桃街道汇业街XXXX 1912284XXXX',
          xhdwyhzh: '中国工商银行XXXX 31000867092XXXX',
          ghdwmc: '个人',
          zsfs: '0',
          fyxm: [
              {
                "fphxz": 0,
                "hsbz": 1,
                "spmc": "*软件维护服务*接口服务费",
                "spbm": "3040201030000000000",
                "je": 100,
                "sl": 0.01,
                "se": 0.99,
                "spsl": 100,
                "dj": 1,
                "dw": "次"
              },
              {
                "fphxz": 0,
                "hsbz": 1,
                "spmc": "*软件维护服务*接口服务费",
                "spbm": "3040201030000000000",
                "je": 100,
                "sl": 0.01,
                "se": 0.99,
                "spsl": 200,
                "dj": 0.5,
                "dw": "次"
              }
          ],
          hjje: 198.02,
          hjse: 1.98,
          jshj: 200
      };

    /*
     * 数电蓝票开具接口 文档
     * @link https://fa-piao.com/doc.html#api6?source=github
     */
    const invoiceResponse = await taxInvoice.api.blueTicket(invoiceParams);
    switch (invoiceResponse.code) {
      case 200:
        console.log("可以开发票了",invoiceResponse);      
        /*
        * 获取销项数电版式文件 文档 PDF/OFD/XML
        * @link https://fa-piao.com/doc.html#api7?source=github
        */
        const pdfResponse = await taxInvoice.api.getPdfOfdXml({
            "nsrsbh": nsrsbh,
            "username": username,
            "fphm": invoiceResponse.data.Fphm, 
            "downflag": 4 });
        if (pdfResponse.code === 200) {
              console.log("发票下载结果:", pdfResponse.data);
        }
        break;
      case 420:
        console.log("登录(短信认证)");
       /*
        * 前端模拟短信认证弹窗
        * @link https://fa-piao.com/fapiao.html?action=sms&source=github
        */
        // 1. 发短信验证码
        /*
        * @link https://fa-piao.com/doc.html#api2?source=github
        */
        // const loginResponse = await taxInvoice.api.loginDppt({nsrsbh, username, password, sms:""});
        // if (loginResponse.code === 200) {
        //   console.log(loginResponse.msg);
        //   console.log(`请${username}接收验证码`);
        //   // 在实际应用中，这里应该有一个等待用户输入验证码的机制
        //   // 这里简化处理，假设等待60秒
        //   console.log("等待60秒...");
        //   await new Promise(resolve => setTimeout(resolve, 60000));
          
        //   // 2. 输入验证码
        //   /*
        //   * @link https://fa-piao.com/doc.html#api2?source=github
        //   */
        //   console.log("请输入验证码");
        //   const smsCode = ""; // 这里应该获取用户输入的验证码
        //   const loginResponse2 = await taxInvoice.api.loginDppt({nsrsbh, username, password, sms:smsCode});
        //   if (loginResponse2.code === 200) {
        //     console.log(loginResponse2.data);
        //     console.log("验证成功");
        //   }
        // }
        break;
      case 430:
        console.log("人脸认证");        
        // 1. 获取人脸二维码
       /*
        * @link https://fa-piao.com/doc.html#api3?source=github
        */
        const qrCodeResponse = await taxInvoice.api.getFaceImg({nsrsbh, username, type:"1"});
        console.log("二维码:", qrCodeResponse.data);
        
        if (qrCodeResponse.data.ewmly === 'swj') {
          console.log("请使用税务局app扫码");
        } else if (qrCodeResponse.data.ewmly === 'grsds') {
          console.log("个人所得税app扫码");
        }
        if (qrCodeResponse.data.ewm.length < 500) {
          //字符串转二维码图片base64   安装 npm install qrcode
          const base64 = await QRCode.toDataURL(qrCodeResponse.data.ewm);
          console.log("二维码base64:", base64);
          qrCodeResponse.data.ewm = base64;
          // let base64Uri = 'data:image/png;base64,' + base64;
          // 前端使用示例: <img src="base64Uri" />
        }


        // 2. 认证完成后获取人脸二维码认证状态
       /*
        * @link https://fa-piao.com/doc.html#api4?source=github
        */
        // const rzid = qrCodeResponse.data.rzid;
        // const faceStatusResponse = await taxInvoice.api.getFaceState({nsrsbh, rzid, username, type:"1"});
        // console.log("code:", faceStatusResponse.code);
        // console.log("data:", faceStatusResponse.data);
        
        // if (faceStatusResponse.data) {
        //   switch (faceStatusResponse.data.slzt) {
        //     case '1':
        //       console.log("未认证");
        //       break;
        //     case '2':
        //       console.log("成功");
        //       break;
        //     case '3':
        //       console.log("二维码过期-->重新获取人脸二维码");
        //       break;
        //   }
        // }
        break;        
      case 401:
        //token过期 重新获取并缓存token
        console.log(`${invoiceResponse.code} 授权失败: ${invoiceResponse.msg}`);
        break;
      case 503:
        //服务器繁忙 重新发起请求即可
        console.log(`${invoiceResponse.code} 服务器繁忙: ${invoiceResponse.msg}`);
        break;      
      default:
        console.log(`${invoiceResponse.code} ${invoiceResponse.msg}`);
        break;
    }
  } catch (error) {
    console.error("错误: [" + (error as any).errorCode + "] " + (error as any).message);
  }
}

// 执行主函数
main();
```

[发票税额计算demo](https://github.com/fapiaoapi/invoice-sdk-nodejs/blob/master/examples/tax_example.ts "发票税额计算") |
[发票红冲demo](https://github.com/fapiaoapi/invoice-sdk-nodejs/blob/master/examples/red_invoice_example.ts "发票红冲")