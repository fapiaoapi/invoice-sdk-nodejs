
// import { Utils } from '../src';
const { Utils } = require('tax-invoice');
import { Decimal } from 'decimal.js';


const addFixed = (left: Decimal.Value, right: Decimal.Value, scale: number = 2): string =>
  new Decimal(left).add(right).toFixed(scale);
const subFixed = (left: Decimal.Value, right: Decimal.Value, scale: number = 2): string =>
  new Decimal(left).sub(right).toFixed(scale);
const mulFixed = (left: Decimal.Value, right: Decimal.Value, scale: number = 2): string =>
  new Decimal(left).mul(right).toFixed(scale);
const divFixed = (left: Decimal.Value, right: Decimal.Value, scale: number = 13): string =>
  new Decimal(left).div(right).toFixed(scale);

async function main() {
  /*
   * 含税金额计算示例
   *
   *   不含税单价 = 含税单价/(1+ 税率)  noTaxDj = dj / (1 + sl)
   *   不含税金额 = 不含税单价*数量  noTaxJe = noTaxDj * spsl
   *   含税金额 = 含税单价*数量  je = dj * spsl
   *   税额 = 税额 = 1 / (1 + 税率) * 税率 * 含税金额  se = 1  / (1 + sl) * sl * je
   *    hjse= se1 + se2 + ... + seN
   *    jshj= je1 + je2 + ... + jeN
   *   价税合计 =合计金额+合计税额 jshj = hjje + hjse
   *
   */

  /*
   * 含税计算示例1  无价格  无数量
   * @link `https://fa-piao.com/fapiao.html?action=data1&source=github` 
   *
   */

  let hsbz = 1;
  let amount = 200;
  let sl = 0.01;
  let se = Utils.calculateTax(amount, sl, Boolean(hsbz));
  let data: any = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*软件维护服务*接口服务费',
        spbm: '3040201030000000000',
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };

  for (const item of data.fyxm) {
    data.jshj = addFixed(data.jshj, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.hjje = subFixed(data.jshj, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);
  console.log('含税计算示例1  无价格  无数量: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 含税计算示例2  有价格 有数量
   * @link `https://fa-piao.com/fapiao.html?action=data3&source=github` 
   *
   */

  hsbz = 1;
  let spsl = 1;
  let dj = 2;
  sl = 0.03;

  let spsl2 = 1;
  let dj2 = 3;
  let sl2 = 0.01;

  let je = mulFixed(dj, spsl, 2);
  se = Utils.calculateTax(je, sl, Boolean(hsbz));

  let je2 = mulFixed(dj2, spsl2, 2);
  let se2 = Utils.calculateTax(je2, sl2, Boolean(hsbz));
  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*水冰雪*一阶水费',
        spbm: '1100301030000000000',
        ggxh: '',
        dw: '吨',
        dj: dj,
        spsl: spsl,
        je: Number(je),
        sl: sl,
        se: se
      },
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*水冰雪*二阶水费',
        spbm: '1100301030000000000',
        ggxh: '',
        dw: '吨',
        dj: dj2,
        spsl: spsl2,
        je: Number(je2),
        sl: sl2,
        se: se2
      }
    ]
  };

  for (const item of data.fyxm) {
    data.jshj = addFixed(data.jshj, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.hjje = subFixed(data.jshj, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);

  console.log('含税计算示例2  有价格 有数量: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 含税计算示例3  有价格自动算数量  购买猪肉1000元,16.8元/斤
   * @link `https://fa-piao.com/fapiao.html?action=data5&source=github` 
   *
   */
  hsbz = 1;
  amount = 1000;
  dj = 16.8;
  sl = 0.01;
  se = Utils.calculateTax(amount, sl, Boolean(hsbz));

  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*肉类*猪肉',
        spbm: '1030107010100000000',
        ggxh: '',
        dw: '斤',
        dj: dj,
        spsl: Number(divFixed(amount, dj, 13)),
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };
  for (const item of data.fyxm) {
    data.jshj = addFixed(data.jshj, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.hjje = subFixed(data.jshj, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);
  console.log('含税计算示例3  有价格自动算数量 购买猪肉1000元,16.8元/斤: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 含税计算示例4  有数量自动算价格  购买接口服务1000元7次
   * @link `https://fa-piao.com/fapiao.html?action=data7&source=github` 
   *
   */

  hsbz = 1;
  amount = 1000;
  spsl = 7;
  sl = 0.01;
  se = Utils.calculateTax(amount, sl, Boolean(hsbz));

  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*软件维护服务*接口服务费',
        spbm: '3040201030000000000',
        ggxh: '',
        dw: '次',
        dj: Number(divFixed(amount, spsl, 13)),
        spsl: spsl,
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };
  for (const item of data.fyxm) {
    data.jshj = addFixed(data.jshj, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.hjje = subFixed(data.jshj, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);
  console.log('含税计算示例4  有数量自动算价格 购买接口服务1000元7次: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 不含税计算示例
   *  金额 = 单价 * 数量  je = dj * spsl
   *  税额 = 金额 * 税率  se = je * sl
   *   hjse= se1 + se2 + ... + seN
   *   hjje= je1 + je2 + ... + jeN
   *  价税合计 =合计金额+合计税额 jshj = hjje + hjse
   *
   */

  /*
   *
   * 不含税计算示例1 无价格 无数量
   * @link `https://fa-piao.com/fapiao.html?action=data2&source=github` 
   */

  hsbz = 0;
  amount = 200;
  sl = 0.01;
  se = Utils.calculateTax(amount, sl, Boolean(hsbz));
  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*软件维护服务*接口服务费',
        spbm: '3040201030000000000',
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };

  for (const item of data.fyxm) {
    data.hjje = addFixed(data.hjje, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.jshj = addFixed(data.hjje, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);

  console.log('不含税计算示例1 无价格 无数量: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   *
   * 不含税计算示例2  有价格 有数量
   * @link `https://fa-piao.com/fapiao.html?action=data4&source=github` 
   */
  hsbz = 0;
  spsl = 1;
  dj = 2;
  sl = 0.03;

  spsl2 = 1;
  dj2 = 3;
  sl2 = 0.01;

  je = mulFixed(dj, spsl, 2);
  se = Utils.calculateTax(je, sl, Boolean(hsbz));

  je2 = mulFixed(dj2, spsl2, 2);
  se2 = Utils.calculateTax(je2, sl2, Boolean(hsbz));
  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*水冰雪*一阶水费',
        spbm: '1100301030000000000',
        ggxh: '',
        dw: '吨',
        dj: dj,
        spsl: spsl,
        je: Number(je),
        sl: sl,
        se: Number(se)
      },
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*水冰雪*而阶水费',
        spbm: '1100301030000000000',
        ggxh: '',
        dw: '吨',
        dj: dj2,
        spsl: spsl2,
        je: Number(je2),
        sl: sl2,
        se: Number(se2)
      }
    ]
  };

  for (const item of data.fyxm) {
    data.hjje = addFixed(data.hjje, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.jshj = addFixed(data.hjje, data.hjse, 2);

  data.hjje = Number(data.hjje);
  data.hjse = Number(data.hjse);
  data.jshj = Number(data.jshj);

  console.log('不含税计算示例2  有价格 有数量: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 不含税计算示例3  有价格自动算数量  购买猪肉1000元,16.8元/斤
   * @link `https://fa-piao.com/fapiao.html?action=data6&source=github` 
   *
   */
  hsbz = 0;
  amount = 1000;
  dj = 16.8;
  sl = 0.01;
  se = Utils.calculateTax(amount, sl, Boolean(hsbz));

  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*肉类*猪肉',
        spbm: '1030107010100000000',
        ggxh: '',
        dw: '斤',
        dj: dj,
        spsl: Number(divFixed(amount, dj, 13)),
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };
  for (const item of data.fyxm) {
    data.hjje = addFixed(data.hjje, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.jshj = addFixed(data.hjje, data.hjse, 2);
  console.log('不含税计算示例3  有价格自动算数量 购买猪肉1000元,16.8元/斤: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 不含税计算示例4  有数量自动算价格  购买接口服务1000元7次
   *
   * @link `https://fa-piao.com/fapiao.html?action=data8&source=github` 
   *
   */

  hsbz = 0;
  amount = 1000;
  spsl = 7;
  sl = 0.01;
  se = Utils.calculateTax(amount, sl, Boolean(hsbz));

  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*软件维护服务*接口服务费',
        spbm: '1030107010100000000',
        ggxh: '',
        dw: '次',
        dj: Number(divFixed(amount, spsl, 13)),
        spsl: spsl,
        je: amount,
        sl: sl,
        se: se
      }
    ]
  };
  for (const item of data.fyxm) {
    data.hjje = addFixed(data.hjje, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }
  data.jshj = addFixed(data.hjje, data.hjse, 2);
  console.log('不含税计算示例4  有数量自动算价格 购买接口服务1000元7次: ');
  console.log(JSON.stringify(data, null, 2));
  console.log('---------------------------------------------');

  /*
   * 免税计算示例
   *  金额 = 单价 * 数量  je = dj * spsl
   *  税额 = 0
   *  hjse = se1 + se2 + ... + seN
   *  jshj = je1 + je2 + ... + jeN
   *  价税合计 =合计金额+合计税额 jshj = hjje + hjse
   * @link `https://fa-piao.com/fapiao.html?action=data9&source=github` 
   */

  hsbz = 0;
  dj = 32263.98;
  sl = 0;
  se = '0';
  data = {
    hjje: 0,
    hjse: 0,
    jshj: 0,
    fyxm: [
      {
        fphxz: 0,
        hsbz: hsbz,
        spmc: '*经纪代理服务*国际货物运输代理服务',
        spbm: '3040802010200000000',
        ggxh: '',
        dw: '次',
        spsl: 1,
        dj: dj,
        je: dj,
        sl: sl,
        se: se,
        yhzcbs: 1,
        lslbs: 1,
        zzstsgl: '免税'
      }
    ]
  };
  for (const item of data.fyxm) {
    data.hjje = addFixed(data.hjje, item.je, 2);
    data.hjse = addFixed(data.hjse, item.se, 2);
  }

  data.jshj = addFixed(data.hjje, data.hjse, 2);

  console.log(`免税计算示例: ${JSON.stringify(data, null, 2)}`);
}

main();
