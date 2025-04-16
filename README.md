#发票sdk

发票SDK For NodeJs- 提供完整的数电发票API接口

发票 电子发票/数电发票/全电发票/数电票/开票



[中文文档](https://open.fa-piao.com "文档")

* 获取授权
* 登录数电发票平台
* 获取人脸二维码
* 获取人脸二维码认证状态
* 获取认证状态

发票开具

* 数电蓝票开具接口
* 获取销项数电版式文件

发票红冲

* 申请红字前查蓝票信息接口
* 申请红字信息表
* 开负数发票

## 安装

通过npm安装:
[npm地址](https://www.npmjs.com/package/tax-invoice "发票sdk")

## 安装

```bash
npm install tax-invoice
```
### 开票
```bash
const { TaxInvoice, Utils } = require('tax-invoice');

// 配置信息
const appKey = '';
const appSecret = '';

const nsrsbh = '91500112MADFAQ9XXX'; // 统一社会信用代码
const title = "重庆悦江河科技有限公司"; // 名称（营业执照）
const username = "19122840xxx"; // 手机号码（电子税务局）
const password = "2354354ttxxx"; // 个人用户密码（电子税务局）
const sf = "01"; // 身份（电子税务局）
const fphm = "24502000000045823936";
const kprq = "";
const token = "";

// 初始化SDK
const taxInvoice = new TaxInvoice({
  appKey: appKey,
  appSecret: appSecret
});

// 主函数
async function main() {
  try {
    // 获取授权
    if (token) {
      taxInvoice.setToken(token);
      console.log("使用已有Token");
    } else {
      const authResult = await taxInvoice.api.getAuthorization(nsrsbh);
      console.log('授权结果:', authResult);
      
      if (authResult.code === 200) {
        const newToken = authResult.data.token;
        taxInvoice.setToken(newToken);
        console.log("授权成功，Token:", newToken);
      } else {
        console.log("授权失败:", authResult.msg);
        return;
      }
    }

    // 查询认证状态
    const loginResult = await taxInvoice.api.queryFaceAuthState({nsrsbh, username});
    console.log('认证状态66:', loginResult);

    switch (loginResult.code) {
      case 200:
        console.log("可以开发票了");
        
        // // 税额计算
        // const amount = 200;
        // const taxRate = 0.01;
        // const isIncludeTax = true; // 是否含税
        // const se = Utils.calculateTax(amount, taxRate, isIncludeTax);
        
        // console.log("价税合计：", amount);
        // console.log("税率：", taxRate);
        // console.log("合计金额：", (amount - parseFloat(se)));
        // console.log((isIncludeTax ? "含税" : "不含税") + " 合计税额：", se);
        
        // // 授信额度查询
        // const creditLimitResponse = await taxInvoice.api.queryCreditLimit({nsrsbh, username});
        // if (creditLimitResponse.code === 200) {
        //   console.log("授信额度查询结果:", creditLimitResponse.data);
        // }else{
        //   console.log(creditLimitResponse.code+"授信额度查询失败:", creditLimitResponse.msg);
        // }

        // 开具蓝票
        const invoiceParams = {
          fpqqlsh: appKey + Date.now(),
          fplxdm: '82',
          kplx: '0',
          xhdwsbh: nsrsbh,
          xhdwmc: '重庆悦江河科技有限公司',
          xhdwdzdh: '重庆市渝北区仙桃街道汇业街1号17-2 19122840xxxx',
          xhdwyhzh: '中国工商银行 310008670920023xxxx',
          ghdwmc: '个人',
          zsfs: '0',
          fyxm: [
            {
              fphxz: '0',
              spmc: '*信息技术服务*软件开发服务',
              je: '10',
              sl: '0.01',
              se: '0.1',
              hsbz: '1',
              spbm: '3040201010000000000'
            }
          ],
          hjje: '9.9',
          hjse: '0.1',
          jshj: '10'
        };

        const invoiceResponse = await taxInvoice.api.blueTicket(invoiceParams);
        console.log(invoiceResponse.code + " 开票结果: " + invoiceResponse.msg);

        if (invoiceResponse.code === 200) {
          fphm = invoiceResponse.data.Fphm;
          kprq = invoiceResponse.data.Kprq;
          console.log("发票号码: ", fphm);
          console.log("开票日期: ", kprq);
        }
         // 下载发票
        const pdfResponse = await taxInvoice.api.getPdfOfdXml({nsrsbh, fphm, downflag: '4', kprq, username});
        if (pdfResponse.code === 200) {
            console.log("发票下载结果:", pdfResponse.data);
        }
        break;
        
      case 420:
        console.log("登录(短信认证)");
        
        // // 1. 发短信验证码
        // const loginResponse = await taxInvoice.api.loginDppt({nsrsbh, username, password, sms:""});
        // if (loginResponse.code === 200) {
        //   console.log(loginResponse.msg);
        //   console.log(`请${username}接收验证码`);
        //   // 在实际应用中，这里应该有一个等待用户输入验证码的机制
        //   // 这里简化处理，假设等待60秒
        //   console.log("等待60秒...");
        //   await new Promise(resolve => setTimeout(resolve, 60000));
          
        //   // 2. 输入验证码
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
        
        // // 1. 获取人脸二维码
        // const qrCodeResponse = await taxInvoice.api.getFaceImg({nsrsbh, username, type:"1"});
        // console.log("二维码:", qrCodeResponse.data);
        
        // if (qrCodeResponse.data.ewmlyx === 'swj') {
        //   console.log("请使用税务局app扫码");
        // } else if (qrCodeResponse.data.ewmlyx === 'grsds') {
        //   console.log("个人所得税app扫码");
        // }

        // // 2. 认证完成后获取人脸二维码认证状态
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
        console.log(`${loginResult.code} 授权失败: ${loginResult.msg}`);
        break;
        
      default:
        console.log(`${loginResult.code} ${loginResult.msg}`);
        break;
    }
  } catch (error) {
    console.error("错误: [" + error.errorCode + "] " + error.message);
  }
}

// 执行主函数
main();
```

### 发票红冲

```bash
const { TaxInvoice } = require('tax-invoice');

// 配置信息
const appKey = '';
const appSecret = '';
const nsrsbh = '91510182072431XXXX'; // 纳税人识别号
const username = '19122840xxx'; // 手机号码（电子税务局）
const fphm = '25502000000038381718';
const kprq = '2025-04-13 13:35:27';
const token = '';

// 初始化SDK
const taxInvoice = new TaxInvoice({
  appKey: appKey,
  appSecret: appSecret
});

// 主函数
async function main() {
  try {
    // 设置token或获取授权
    if (token) {
      taxInvoice.setToken(token);
    } else {
      // 获取授权
      const authResponse = await taxInvoice.api.getAuthorization(nsrsbh);
      if (authResponse.code === 200) {
        console.log("授权成功，Token:", authResponse.data.token);
        taxInvoice.setToken(authResponse.data.token);
      } else {
        console.log("授权失败:", authResponse.msg);
        return;
      }
    }

    // 1. 数电申请红字前查蓝票信息接口
    const sqyy = '2';
    const queryInvoiceResponse = await taxInvoice.api.queryBlueTicket({nsrsbh, fphm, sqyy, username, nsrsbh});

    if (queryInvoiceResponse.code === 200) {
      console.log("1 可以申请红字");
      
      // 等待2秒
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. 申请红字信息表
      const applyRedParams = {
        xhdwsbh: nsrsbh,
        yfphm: fphm,
        username: username,
        sqyy: '2',
        chyydm: '01'
      };
      
      const applyRedResponse = await taxInvoice.api.applyRedInfo(applyRedParams);

      if (applyRedResponse.code === 200) {
        console.log("2 申请红字信息表");
        
        // 等待2秒
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. 开具红字发票
        const redInvoiceParams = {
          fpqqlsh: 'red' + fphm,
          username: username,
          xhdwsbh: nsrsbh,
          tzdbh: applyRedResponse.data.xxbbh,
          yfphm: fphm
        };
        
        const redInvoiceResponse = await taxInvoice.api.redTicket(redInvoiceParams);

        if (redInvoiceResponse.code === 200) {
          console.log("3 负数开具成功");
        } else {
          console.log(`${redInvoiceResponse.code} 数电票负数开具失败: ${redInvoiceResponse.msg}`);
          console.log(redInvoiceResponse.data);
        }
      } else {
        console.log(`${applyRedResponse.code} 申请红字信息表失败: ${applyRedResponse.msg}`);
        console.log(applyRedResponse.data);
      }
    } else {
      console.log(`${queryInvoiceResponse.code} 查询发票信息失败: ${queryInvoiceResponse.msg}`);
      console.log(queryInvoiceResponse.data);
    }
  } catch (error) {
    console.error(`错误: [${error.errorCode}] ${error.message}`);
  }
}

// 执行主函数
main();
```