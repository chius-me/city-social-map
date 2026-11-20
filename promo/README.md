# CITY Social Map · 宣传片与封面工程 (`promo/`)

本目录包含使用 HTML + GSAP 制作的 **CITY Social Map（`https://social.city.chius.dev`）** 宣传视频源码、原创 `118 BPM` 街头铜管放克 ABC 配乐与多平台封面模板（已加入 `.gitignore` 的二进制渲染产物与字体/音频包保存在本地 `out/`、`assets/`）。

## 目录结构

| 路径 | 说明 |
|---|---|
| `index.html` | `1920×1080` `60fps` 宣传片源码（含 GSAP 时间线、变量契约与 6 声部 `om-score` ABC 乐谱） |
| `treatment.md` | 导演企划、色彩/配乐设定与分场节拍表 |
| `covers/cover-16x9.html` | 漫画四格 × 巨字主封面模板（兼容 `16:9` 与居中 `4:3` 安全区） |
| `covers/cover-16x9-clean.html` | 网站实拍图底 × 巨字海报封面模板（兼容 `16:9` 与居中 `4:3` 安全区） |
| `covers/cover-3x4.html` | `1200×1600` (`3:4`) 小红书 / 视频号竖版封面模板 |
| `materials/` | 实拍网站截图底图（`ui-classic-map.png`、`ui-full-network.png`） |
| `vendor/` | 本地运行时依赖（`gsap.min.js`、`om.js`） |
| `assets/` *(gitignored)* | 本地头像（复制自 `../public/avatars/`）、离线字体与合成音频 `sound.wav` |
| `out/` *(gitignored)* | 本地导出成品：`promo-v4.mp4`、5 张封面 `.png`、`share/promo-v4.gif`、`share/share.md` |

## 本地预览与重新导出

若在新克隆的仓库中复现本地渲染，先补齐 `promo/assets/`：

```bash
mkdir -p promo/assets/fonts
cp -R ../public/* promo/assets/     # 从仓库根目录执行则为: cp -R public/* promo/assets/
# 另需在 promo/assets/fonts/ 放入 MPlusRounded1c、NotoSansSC、Poppins 离线字体，并运行 om sound 合成 sound.wav
```

常用预览与导出命令（以安装好的 `huashu-motion` CLI `om` 为例）：

```bash
# 打开中文实时 Studio（支持逐帧拖动、修改变量或按 C 指点修改）
om studio promo --lang zh

# 重新合成配乐并渲染带运动模糊的 1080p60 终版 MP4
om sound promo
om render promo --blur

# 重新导出封面成图（并裁切 1440×1080 4:3 版本）
om still promo/covers/cover-16x9.html --out promo/out/cover-16x9.png
om still promo/covers/cover-16x9-clean.html --out promo/out/cover-16x9-clean.png
om still promo/covers/cover-3x4.html --out promo/out/cover-3x4.png
ffmpeg -y -i promo/out/cover-16x9.png -vf "crop=1440:1080:240:0" promo/out/cover-4x3.png
ffmpeg -y -i promo/out/cover-16x9-clean.png -vf "crop=1440:1080:240:0" promo/out/cover-4x3-clean.png
```
