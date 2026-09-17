# 白虎堂跑商助手 (PWA)

梦幻西游白虎堂跑商辅助手机应用：商品溢价查询 + 库存流水记账 + 语音录入。

## 这是什么 / 结构

纯静态前端，无需服务器代码，`index.html` 直接可跑。PWA 特性（添加到主屏幕、离线缓存）依赖 HTTPS。

| 文件 | 作用 |
|------|------|
| `index.html` | 主页面（商品溢价页 + 记账页） |
| `styles.css` | 样式 |
| `app.js` | 逻辑（溢价计算、库存记账、语音解析） |
| `data.js` | 商品/地图价格数据 |
| `manifest.webmanifest` | PWA 安装配置 + 图标 |
| `sw.js` | Service Worker，离线缓存 |
| `icon-192.png` / `icon-180.png` / `icon-512.png` | 应用图标（必需 PNG） |
| `icon.svg` / `icon-master.jpg` | 备用/源图，可删 |

本地预览：`python3 -m http.server 8377` 然后打开 `http://localhost:8377`。

## 安装到手机（重点）

PWA 必须通过 **HTTPS 公开网址**访问，手机才能把它"添加到主屏幕"变成独立 App。语音识别也只在安全上下文（HTTPS）下可用。

### 第 1 步：把这几个文件部署到一个公开托管
把整个文件夹里的文件上传到任一静态托管（全部文件放同目录根下，保持相对路径）：

推荐（任选其一，都免费）：
- **GitHub Pages** — 建仓库 → 上传文件 → Settings → Pages → 部署分支
- **Vercel** — 拖拽文件夹到 vercel.com 或 `vercel` CLI 部署
- **Netlify** — 拖拽文件夹到 app.netlify.com
- 或你自己的云服务器 / Nginx，指向该目录

部署完成后得到一个 `https://xxx` 的网址（必须在手机上能打开的公开地址）。

### 第 2 步：手机安装（装完即 App）
**Android (Chrome)**
1. 手机 Chrome 打开部署好的网址
2. 菜单(⋮) → 「添加到主屏幕」(Add to Home screen)
3. 确认安装 → 桌面出现"白虎堂跑商助手"图标，点开全屏独立运行

**iPhone (Safari)**
1. Safari 打开部署好的网址
2. 点底部「分享」按钮 → 往下滑选「添加到主屏幕」
3. 「添加」→ 桌面出现图标，独立运行

安装后**可离线使用**（Service Worker 已缓存），数据保存在手机本地（localStorage），不会上传。

## 数据说明
- 安装后的数据存于浏览器 localStorage，删除浏览器缓存/数据会清空流水账。
- 商品价格本身对照"原价基准"，玩家可根据游戏内当前价实时判断折扣与是否购入。

```
祝跑商顺利，日进斗金！
```