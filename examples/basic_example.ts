// import { TaxInvoice } from '../src';
import readline from "readline";
const { TaxInvoice } = require('tax-invoice');
const qrcode = require('qrcode-terminal');

const { createClient } = require('redis');
const QRCode = require('qrcode');

// 配置信息
const appKey = '';
const appSecret = '';

const nsrsbh = ''; // 统一社会信用代码
const title = ''; // 名称（营业执照）
const username = ''; // 手机号码（电子税务局）
const password = ''; // 个人用户密码（电子税务局）
const type = '7'; //6基础 7 标准版
const xhdwdzdh = '重庆市渝北区龙溪街道丽园路2号XXXX 1325580XXXX' //地址和电话 空格隔开
const xhdwyhzh = '工商银行XXXX 15451211XXXX'  // 开户行和银行账号 空格隔开

let token = "";
let debug = false;

// 初始化SDK
const taxInvoice = new TaxInvoice({
  appKey: appKey,
  appSecret: appSecret,
  debug: debug
});
// 初始化redis客户端
const client = createClient({
  url: 'redis://:test123456@localhost:6379'
});


// 主函数
async function main() {
  try {

    //一 获取授权 可从缓存redis中获取Token
    await getToken(false);
    /*
     * 前端模拟数电发票/电子发票开具 (蓝字发票)
     * @link https://fa-piao.com/fapiao.html?source=github
     */

    //二 开具蓝票
    const invoiceResponse = await blueTicket()
    switch (invoiceResponse.code) {
      case 200:
        // 三 下载发票
        await downloadPdfOfdXml(invoiceResponse.data.Fphm);
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
        const loginResponse = await taxInvoice.api.loginDppt({ nsrsbh, username, password, sms: "" });
        if (loginResponse.code === 200) {
          const smsCode = await new Promise<string>((resolve, reject) => {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            console.log('请在300秒内(' + getFutureTime(300) + '前)输入验证码:');
            const timer = setTimeout(() => {
              rl.close();
              const timeoutError: any = new Error('短信验证码输入超时');
              timeoutError.errorCode = 'TIMEOUT';
              reject(timeoutError);
            }, 300000);
            rl.once('line', (input) => {
              clearTimeout(timer);
              rl.close();
              resolve(input.trim());
            });
          });
          const smsLoginResponse = await taxInvoice.api.loginDppt({ nsrsbh, username, password, sms: smsCode });
          if (smsLoginResponse.code === 200) {
            console.log("短信验证成功");
            console.log("再次调用blueTicket");
            const retryInvoiceResponse = await blueTicket();
            if (retryInvoiceResponse.code === 200) {
              await downloadPdfOfdXml(retryInvoiceResponse.data.Fphm);
            } else {
              const invoiceError: any = new Error('开票失败');
              invoiceError.errorCode = retryInvoiceResponse.code;
              throw invoiceError;
            }
          } else {
            const authError: any = new Error('短信验证失败');
            authError.errorCode = smsLoginResponse.code;
            throw authError;
          }
        }
        break;
      case 430:
        console.log("人脸认证");
        /* 前端模拟人脸认证弹窗
         * @link https://fa-piao.com/fapiao.html?action=face&source=github
         */
        // 1. 获取人脸二维码
        /*
         * @link https://fa-piao.com/doc.html#api3?source=github
         */
        const qrCodeResponse = await taxInvoice.api.getFaceImg({ nsrsbh, username, type: "1" });
        if (qrCodeResponse.data.ewmly === 'swj') {
          console.log("请使用电子税务局app扫码");
        } else if (qrCodeResponse.data.ewmly === 'grsds') {
          console.log("个人所得税app扫码");
        }
        if (qrCodeResponse.data.ewm.length < 500) {
          // //字符串转二维码图片base64   安装 npm install qrcode
          // const base64 = await QRCode.toDataURL(qrCodeResponse.data.ewm);
          // console.log("二维码base64:", base64);
          // qrCodeResponse.data.ewm = base64;
          // // let base64Uri = 'data:image/png;base64,' + base64;
          // // 前端使用示例: <img src="base64Uri" />
        }
        console.log("成功做完人脸认证,请输入数字 1")
        console.log('请在300秒内(' + getFutureTime(300) + '前)输入:');
        qrcode.generate(qrCodeResponse.data.ewm, {
          small: true, // 关键设置：true 会让二维码缩小（使用半高字符）
          margin: 1    // 边距：设为 1 减少空白
        }, (qrCode: string, err: Error | null = null) => {
          console.log(qrCode);
        });
        await new Promise<void>((resolve, reject) => {
          const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
          const timer = setTimeout(() => {
            rl.close();
            const timeoutError: any = new Error('人脸认证等待输入超时');
            timeoutError.errorCode = 'TIMEOUT';
            reject(timeoutError);
          }, 300000);
          rl.once('line', (input) => {
            clearTimeout(timer);
            rl.close();
            console.log(`✅ 收到: ${input}`);
            resolve();
          });
        });
        // 2. 认证完成后获取人脸二维码认证状态
        /*
         * @link https://fa-piao.com/doc.html#api4?source=github
         */
        const rzid = qrCodeResponse.data.rzid;
        const faceStatusResponse = await taxInvoice.api.getFaceState({ nsrsbh, rzid, username, type: "1" });
        if (faceStatusResponse.data) {
          switch (faceStatusResponse.data.slzt) {
            case '1':
              console.log("人脸未认证");
              const faceStatusError: any = new Error('人脸未认证');
              faceStatusError.errorCode = faceStatusResponse.code;
              throw faceStatusError;
            case '2':
              console.log("人脸认证成功");
              const invoiceResponseAfterFace = await blueTicket();
              if (invoiceResponseAfterFace.code === 200) {
                await downloadPdfOfdXml(invoiceResponseAfterFace.data.Fphm);
              } else {
                const authError: any = new Error('人脸认证失败');
                authError.errorCode = invoiceResponseAfterFace.code;
                throw authError;
              }
              break;
            case '3':
              console.log("人脸认证二维码过期-->重新获取人脸二维码");
              const faceStatusError2: any = new Error('人脸认证二维码过期-->重新获取人脸二维码');
              faceStatusError2.errorCode = faceStatusResponse.code;
              throw faceStatusError2;
          }
        }
        break;
      case 401:
        //token过期 重新获取并缓存token
        console.log(`${invoiceResponse.code} 授权失败: ${invoiceResponse.msg}`);
        console.log("重新授权 获取token 缓存到redis");
         await getToken(true);
         console.log("再请求blueTicket");
         const invoiceResponseAfterToken = await blueTicket();
         if (invoiceResponseAfterToken.code === 200) {
            await downloadPdfOfdXml(invoiceResponseAfterToken.data.Fphm);
         } else {
            const invoiceError: any = new Error('开票失败');
            invoiceError.errorCode = invoiceResponseAfterToken.code;
            throw invoiceError;
         }
        break;
      default:
        console.log('其他错误:', `${invoiceResponse.code} ${invoiceResponse.msg}`);
        break;
    }
  } catch (error: unknown) {
    const err = error as any;
    const errorCode = err?.errorCode ?? err?.code ?? 'UNKNOWN';
    const errorMessage =
      err?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error)) ??
      '未知异常';
    console.error(`错误码: ${errorCode}`);
    console.error(`错误信息: ${errorMessage}`);
    if (Array.isArray(err?.errors) && err.errors.length > 0) {
      console.error("根因列表:");
      err.errors.forEach((item: any, index: number) => {
        const rootCode = item?.code ?? item?.errorCode ?? 'UNKNOWN';
        const rootMessage = item?.message ?? String(item);
        console.error(`  ${index + 1}. [${rootCode}] ${rootMessage}`);
      });
    }
    if (err?.stack) {
      console.error("堆栈:");
      console.error(err.stack);
    }
    console.error("=========================================\n");
  }
}

// 获取token 并缓存到redis
async function getToken(forceUpdate = false) {
  await client.connect();
  // 从缓存redis中获取Token 安装npm install redis
  const key = nsrsbh + "@" + username + "@TOKEN";
  if (forceUpdate) {
    /*
    * 获取授权Token文档
    * @link https://fa-piao.com/doc.html#api1?source=github
    */
    const authResult = await taxInvoice.api.getAuthorization(nsrsbh, type);
    // const authResult = await taxInvoice.api.getAuthorization(nsrsbh,type,username,password);
    if (authResult.code === 200) {
      const newToken = authResult.data.token;
      taxInvoice.setToken(newToken);
      await client.set(key, authResult.data.token, { EX: 3600 * 24 * 30 });// 设置过期时间为30天
    } else {
      const authError: any = new Error(`授权失败: ${authResult.msg}`);
      authError.errorCode = authResult.code;
      throw authError;
    }
  } else {
    token = await client.get(key);
    if (token) {
      taxInvoice.setToken(token);
      console.log("Token From Redis");
    } else {
      const authResult = await taxInvoice.api.getAuthorization(nsrsbh, type);
      // const authResult = await taxInvoice.api.getAuthorization(nsrsbh,type,username,password);
      if (authResult.code === 200) {
        const newToken = authResult.data.token;
        taxInvoice.setToken(newToken);
        await client.set(key, authResult.data.token, { EX: 3600 * 24 * 30 });// 设置过期时间为30天
      } else {
        const authError: any = new Error(`授权失败: ${authResult.msg}`);
        authError.errorCode = authResult.code;
        throw authError;
      }
    }
  }
}
// 开票
async function blueTicket() {
      /*
     * 开具数电发票文档
     * @link https://fa-piao.com/doc.html#api6?source=github
     *
     * 税额计算demo
     * @link https://github.com/fapiaoapi/invoice-sdk-nodejs/blob/master/examples/tax_example.ts
     */
  const invoiceParams = {
    username: username,
    fpqqlsh: appKey + Date.now(),// 建议用你的订单号
    fplxdm: '82',
    kplx: '0',
    xhdwsbh: nsrsbh,
    xhdwmc: title,
    xhdwdzdh: xhdwdzdh,
    xhdwyhzh: xhdwyhzh,
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
  return await taxInvoice.api.blueTicket(invoiceParams);
}

/**
 * 获取pdf ofd xml 下载链接
 * @param fphm 发票号
 */
async function downloadPdfOfdXml(fphm: string) {
  /*
   * 获取销项数电版式文件 文档 PDF/OFD/XML
   * @link https://fa-piao.com/doc.html#api7?source=github
   */
  const pdfResponse = await taxInvoice.api.getPdfOfdXml({
    "nsrsbh": nsrsbh,
    "username": username,
    "fphm": fphm,
    "downflag": "4"
  });
  if (pdfResponse.code === 200) {
    console.log("发票下载结果:", pdfResponse.data);
  }
}

/**
 * 获取指定秒数后的时间字符串 (格式: YYYY-MM-DD HH:mm:ss)
 * @param addSeconds 需要增加的秒数 (例如: 300)
 */
function getFutureTime(addSeconds: number): string {
  const d = new Date();
  d.setSeconds(d.getSeconds() + addSeconds); // 在当前时间基础上增加秒数

  // 辅助函数：补零
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 执行主函数
main();
