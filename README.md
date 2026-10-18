# 序绘 · 函数与数列图像生成器

中文交互式数学绘图工具。支持最多四条曲线对比、数列散点及连线、参数 a、坐标范围调整、滚轮缩放、拖拽平移和 PNG 导出。所有计算在浏览器内完成，无需 API 密钥或后端。

## 开发

需要 Node.js 20.19+ 或 22.12+。

```sh
npm ci
npm run dev
```

开发服务器默认使用 5173 端口。生产构建：`npm run build`；本地验证产物：`npm run preview`；数学逻辑测试：`npm test`。

函数示例：`sin(x)`、`a*x^2`、`1/x`。数列示例：`1/n`、`(-1)^n/n`、`2*n+1`，n 从 1 开始。使用 `^` 表示乘方，`pi` 表示圆周率，三角函数使用弧度。参数 a 可在 −5 至 5 之间调整。数列视图最多显示 2000 项。

表达式由 mathjs 解析，只允许指定数学运算和函数，不执行任意 JavaScript。曲线通过有限采样绘制，极窄尖峰或复杂间断附近的图像可能需要调整坐标范围进一步观察。

## GitHub Pages 网页发布

本项目包含 `.github/workflows/pages.yml` 自动发布工作流。在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。推送至 main 后工作流会自动测试、构建并发布；首次开启 Pages 后，也可在 **Actions → Deploy website to GitHub Pages → Run workflow** 手动执行。

成功发布后网址为：https://zsxz9470-bot.github.io/Function-and-sequence-image-generator/ 。首次部署完成前此地址不可用；可在 Actions 页面查看结果。构建使用相对资源路径，支持仓库子路径。

下载源码：在 GitHub 仓库页面选择 **Code → Download ZIP**，解压后按照上面的开发说明运行。
