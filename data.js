/* 梦幻西游白虎堂跑商 数据 */
const DATA = {
  version: "1.0",
  description: "梦幻西游白虎堂跑商商品价格表（畅玩服通用）",
  source: "综合官方攻略及玩家实测数据整理",
  regions: [
    {
      id: "changan", name: "长安城", shortName: "CA",
      merchants: ["长安商人(302,109)", "长安货商(395,170)"],
      goods: [
        { name: "佛珠", standardPrice: 7200, buyLimit: 7000, priceRange: [5300, 11000], recommendedSell: ["北俱芦洲", "长寿村", "地府"], category: "普通", notes: "高价值商品，利润空间大" },
        { name: "扇子", standardPrice: 4050, buyLimit: 3800, priceRange: [3000, 5200], recommendedSell: ["长寿村", "北俱芦洲"], category: "普通", notes: "中等价位，稳赚型商品" },
        { name: "武器", standardPrice: 4500, buyLimit: 4000, priceRange: [3200, 7600], recommendedSell: ["长寿村", "北俱芦洲"], category: "普通", notes: "中等价位，利润尚可" },
        { name: "棉布", standardPrice: 3500, buyLimit: 3500, priceRange: [2800, 5000], recommendedSell: ["长寿村", "西梁女国"], category: "普通", notes: "部分版本有售" }
      ]
    },
    {
      id: "difu", name: "地府", shortName: "DF",
      merchants: ["地府商人(88,11)", "地府货商(65,61)"],
      goods: [
        { name: "首饰", standardPrice: 4300, buyLimit: 4300, priceRange: [3200, 7000], recommendedSell: ["北俱芦洲", "长寿村"], category: "普通", notes: "地府主力商品，利润稳定" },
        { name: "纸钱", standardPrice: 3000, buyLimit: 3000, priceRange: [2000, 4500], recommendedSell: ["北俱芦洲", "长安"], category: "普通", notes: "低价位，适合小额资金起步" },
        { name: "夜明珠", standardPrice: 8000, buyLimit: 8000, priceRange: [6000, 12000], recommendedSell: ["北俱芦洲", "长寿村"], category: "普通", notes: "高价值商品，利润最高之一" },
        { name: "珍珠", standardPrice: 5500, buyLimit: 5500, priceRange: [4200, 8500], recommendedSell: ["北俱芦洲", "长寿村"], category: "普通", notes: "部分版本有售" }
      ]
    },
    {
      id: "beiju", name: "北俱芦洲", shortName: "BJ",
      merchants: ["北俱商人(167,36)", "北俱货商(158,118)"],
      goods: [
        { name: "人参", standardPrice: 7500, buyLimit: 7500, priceRange: [6800, 10000], recommendedSell: ["地府", "长安"], category: "普通", notes: "高价值商品，卖地府利润高" },
        { name: "香油", standardPrice: 4000, buyLimit: 4000, priceRange: [2300, 5000], recommendedSell: ["长寿村", "地府"], category: "普通", notes: "又名铜油，北俱主力商品" },
        { name: "铃铛", standardPrice: 4300, buyLimit: 4300, priceRange: [3900, 6500], recommendedSell: ["地府", "长安"], category: "普通", notes: "又名铜铃，利润尚可" },
        { name: "衣甲", standardPrice: 2700, buyLimit: 2700, priceRange: [2000, 4000], recommendedSell: ["地府", "长安"], category: "普通", notes: "部分版本有售，利润较低" }
      ]
    },
    {
      id: "aolai", name: "傲来国", shortName: "AL",
      merchants: ["傲来商人(185,105)", "傲来货商(91,106)"],
      goods: [
        { name: "帽子", standardPrice: 3150, buyLimit: 3000, priceRange: [2500, 4500], recommendedSell: ["长寿村", "北俱芦洲"], category: "普通", notes: "又名布帽，低风险商品" },
        { name: "酒", standardPrice: 4050, buyLimit: 3500, priceRange: [2800, 6000], recommendedSell: ["长寿村", "北俱芦洲"], category: "普通", notes: "又名桂花酒，利润可观" },
        { name: "蜡烛", standardPrice: 1800, buyLimit: 1800, priceRange: [1200, 3000], recommendedSell: ["长寿村", "北俱芦洲"], category: "普通", notes: "最低价位商品，适合起步" },
        { name: "盐", standardPrice: 6500, buyLimit: 6500, priceRange: [5000, 9000], recommendedSell: ["长寿村"], category: "普通", notes: "高利润商品，常被抢购" }
      ]
    },
    {
      id: "changshou", name: "长寿村", shortName: "CS",
      merchants: ["长寿商人(141,49)", "长寿货商(87,71)"],
      goods: [
        { name: "面粉", standardPrice: 2700, buyLimit: 3000, priceRange: [2200, 4900], recommendedSell: ["长安", "地府"], category: "普通", notes: "低价位，销量大" },
        { name: "鹿茸", standardPrice: 7200, buyLimit: 7000, priceRange: [5500, 11000], recommendedSell: ["长安", "地府"], category: "普通", notes: "高价值商品，利润丰厚" },
        { name: "符", standardPrice: 5400, buyLimit: 5000, priceRange: [4000, 8000], recommendedSell: ["长安", "地府"], category: "普通", notes: "中等价位，利润波动较大" },
        { name: "木料", standardPrice: 3800, buyLimit: 3800, priceRange: [3000, 5800], recommendedSell: ["长安", "傲来国"], category: "普通", notes: "部分版本有售" }
      ]
    },
    {
      id: "specialty", name: "特产商品", shortName: "特产",
      merchants: ["需帮派竞赛获得特产商人权限"],
      goods: [
        { name: "锦盒", standardPrice: 5000, buyLimit: 6800, priceRange: [3200, 6800], recommendedSell: ["长寿村", "北俱芦洲"], category: "特产", region: "长安特产", notes: "长安特产，一般不会亏" },
        { name: "花", standardPrice: 4000, buyLimit: 99999, priceRange: [2000, 6000], recommendedSell: ["长寿村", "北俱芦洲"], category: "特产", region: "傲来特产", notes: "傲来特产，99.9%不会亏，多少钱都可以买" },
        { name: "木鱼", standardPrice: 6000, buyLimit: 6000, priceRange: [4000, 9000], recommendedSell: ["地府", "长安"], category: "特产", region: "长寿特产", notes: "长寿特产，6000以下买进，99%不会亏" },
        { name: "剪刀", standardPrice: 4500, buyLimit: 5000, priceRange: [3000, 7000], recommendedSell: ["长寿村"], category: "特产", region: "建邺特产", notes: "建邺特产，卖长寿利润最大" },
        { name: "麻线", standardPrice: 4000, buyLimit: 4500, priceRange: [2800, 6500], recommendedSell: ["地府"], category: "特产", region: "朱紫特产", notes: "朱紫特产，卖地府利润最大" },
        { name: "石料", standardPrice: 5000, buyLimit: 5500, priceRange: [3500, 8000], recommendedSell: ["地府"], category: "特产", region: "西梁特产", notes: "西梁特产，卖地府利润最大" }
      ]
    }
  ],
  levelRewards: [
    { level: "11-39级", initialFund: 20000, targetFund: 50000, exp: 30000, contribution: 5, prosperity: 2 },
    { level: "40-59级", initialFund: 40000, targetFund: 100000, exp: 45000, contribution: 10, prosperity: 3 },
    { level: "60-79级", initialFund: 50000, targetFund: 150000, exp: 60000, contribution: 13, prosperity: 4 },
    { level: "80级以上", initialFund: 42000, targetFund: 150000, exp: 85000, contribution: 20, prosperity: 4 }
  ],
  recommendedRoutes: [
    { name: "长安-长寿线", route: "长安→江南野外→建邺→东海湾→傲来→花果山→北俱→长寿郊外→长寿", time: "约3分40秒", description: "最经典路线，商品互补性强" },
    { name: "地府-北俱线", route: "地府→长安→江南野外→建邺→东海湾→傲来→花果山→北俱", time: "约4分钟", description: "高利润路线，夜明珠/人参利润丰厚" },
    { name: "傲来-长寿线", route: "傲来→花果山→北俱→长寿郊外→长寿", time: "约1分20秒", description: "短途刷线，适合快速周转" }
  ]
};