// import { TaxInvoice } from '../src';
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