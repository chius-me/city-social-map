<div align="right"><a href="./README.md">English</a> | 简体中文</div>

<div align="center">

<img src="./public/favicon.svg" width="56" height="56" alt="CITY Social Map">

# CITY Social Map · 《小城日常》人物关系图

《CITY THE ANIMATION》（小城日常，京都动画 2025）与原作《CITY》交互式人物关系图谱及星图探索站。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/chius-cc/city-social-map/actions/workflows/deploy.yml/badge.svg)](https://github.com/chius-cc/city-social-map/actions/workflows/deploy.yml)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?logo=cloudflare&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)

[在线体验](https://social.city.chius.dev) · [人物星图](https://social.city.chius.dev/#mode=network&char=nagumo) · [CITY 头像工坊](https://avatar.city.chius.dev) · [问题反馈](https://github.com/chius-cc/city-social-map/issues) · [Awesome CITY](https://github.com/chius-cc/awesome-citytheanimation)

</div>

> “这座城市，绝非寻常之地。有欢笑、有爱、也有热泪盈眶的瞬间。”
>
> 65 位居民 · 8 大阵营 · 65 条人物关系 · 中文 / EN / 日本語

**CITY Social Map** 将新井圭一笔下热闹又脱线的小城人物关系网搬上浏览器：参考动画官网 [`city-the-animation.com`](https://city-the-animation.com/) 的绘本喜剧视觉风格打造，既可漫游全景人物关系图，也能一键切换为以角色为中心的星图雷达。

在线访问：**https://social.city.chius.dev**

![经典全景图谱](./docs/screenshot-map.webp)

![人物中心星图与档案抽屉](./docs/screenshot-ego.webp)

## 功能亮点

- **全景关系图谱**：完整还原 **65 位居民**、**8 大阵营**（含真壁立涌同时横跨「真壁家 ∩ CITY 南高中足球部」的交叠区域，以及游离全城之外的约翰·列侬彩蛋）与 **65 条原著关系连线**；所有人物节点均嵌入阵营配色圆形头像，点击连线或悬停节点可随时阅读关系梗概。
- **人物星图 & 全城网络**：在 **中心星图（Ego Radar）** 中将任意角色置于中心，四色 C-I-T-Y 光环环绕，直观呈现直连关系、方向箭头与可选外环「二度 & 同阵营（`+N`）」节点，支持点击周围头像切换中心与自由拖拽布局；也可切换至 **全城网络**，让节点大小随关联度缩放，按 **家庭 / 血缘**、**友情 / 好友**、**恋爱 / 暗恋**、**雇佣 / 隶属**、**宿敌 / 冲突**、**师生 / 粉丝** 六大类别筛选并一键高亮关联子图。
- **角色档案卡 & 居民名鉴**：全员配备清晰头像（支持点击放大预览）、权威 **中文 / EN / 日本語** 译名与 58 位 2025 动画声优（CV）、经典台词气泡、一键 **「以 TA 为中心展开星图」**，并将关联人物按关系类别分组呈现。
- **六度小城 · 关系路径查找**：计算任意两位 CITY 居民之间的最短关系连线路径与头像轨迹，还原约翰·列侬“零连接”彩蛋。
- **原汁原味官网美学**：还原四色招牌色板、飘浮字母彩纸背景、旋转 `conic-gradient` 画框、四色变形菜单按钮，以及支持姓名、声优、阵营、球衣号的即时搜索。

## 在线直达

| 视图 / 入口 | URL | 说明 |
| --- | --- | --- |
| 全景图谱 | [`/`](https://social.city.chius.dev/) | 查看 65 位居民完整关系拓扑与关系图层筛选 |
| 角色档案 | [`/#char=wako`](https://social.city.chius.dev/#char=wako) | 直接定位到「泉和子」并打开右侧头像档案 |
| 人物星图（Ego Radar） | [`/#mode=network&char=nagumo`](https://social.city.chius.dev/#mode=network&char=nagumo) | 以「南云美鸟」为中心展开星图雷达 |
| 全城网络 | [`/#mode=network&sub=full`](https://social.city.chius.dev/#mode=network&sub=full) | 按关联度缩放节点并按阵营聚类的全城关系网 |

## 本地运行

需要 Node.js 22+。

```bash
npm install
npm run dev      # 启动本地开发服务 (http://localhost:5173)
npm run build    # 类型检查并构建生产产物
```

## 参考与致谢

- **原始关系图拓扑**：[File:CITY Social Map by VayItsHere.jpeg](https://city.wiki.gg/wiki/File:CITY_Social_Map_by_VayItsHere.jpeg)，由社区作者 **VayItsHere / Mokkachino (Discord)** 于 2025 年 6 月创作并收录于 [CITY Wiki](https://city.wiki.gg/)。
- **精选资料清单**：[`chius-cc/awesome-citytheanimation`](https://github.com/chius-cc/awesome-citytheanimation)。
- **姊妹项目**：[`chius-cc/city-avatar`](https://github.com/chius-cc/city-avatar)（[`avatar.city.chius.dev`](https://avatar.city.chius.dev)）。
- **视觉风格参考**：[《CITY THE ANIMATION》官方网站](https://city-the-animation.com/)。
- **译名与声优校对**：动画官方制作人员表、[Bangumi 番组计划](https://bgm.tv/subject/514358)、[AniList](https://anilist.co/anime/181841/CITY-THE-ANIMATION) 与 [萌娘百科](https://zh.moegirl.org.cn/CITY)。

## 📄 许可证

本仓库软件源代码采用 [MIT 许可证](LICENSE) 开源。

本项目为非官方粉丝致敬与交互展示作品。原作《CITY》及《CITY THE ANIMATION》角色设定、动画肖像及相关版权归 © あらゐけいいち・講談社／CITY THE ANIMATION 製作委員会所有。

---

<div align="center">
  <sub>Crafted with ❤️ by <a href="https://chius.cc">Chius</a> · Powered by Cloudflare & GitHub</sub>
</div>
