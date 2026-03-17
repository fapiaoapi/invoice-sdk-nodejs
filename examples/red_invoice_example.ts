// import { TaxInvoice } from '../src';
const { TaxInvoice } = require('tax-invoice');


// 配置信息
const appKey = '';
const appSecret = '';
const nsrsbh = ''; // 统一社会信用代码
const username = ""; // 手机号码（电子税务局）
const fphm = '';
const kprq = '';
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
    const queryInvoiceResponse = await taxInvoice.api.queryBlueTicket({
      nsrsbh: nsrsbh, 
      fphm: fphm,
      sqyy: sqyy, 
      username: username
    });

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
    if (error instanceof Error) {
      console.error(`错误: [${(error as any).errorCode}] ${error.message}`);
    } else {
      console.error('错误:', error);
    }
  }
}

// 执行主函数
main();