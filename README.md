# AI Immersive Translate

<div align="center">

**🌐 智能悬停翻译浏览器扩展**

A free, AI-powered bilingual web page translation extension supporting BigModel API.

[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://github.com/yourusername/ai-immersive-translate)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Plasmo](https://img.shields.io/badge/built%20with-Plasmo-purple.svg)](https://plasmo.com/)

</div>

---

## ✨ 特性

### 🎯 **交互方式创新**
- **Shift + 悬停翻译** - 按住Shift键悬停即可翻译
- **智能文本识别** - 自动识别可翻译的文本块
- **即时响应** - 无需等待，实时翻译

### 🚀 **核心功能**
- **多语言支持** - 支持12+种语言互译
- **智能缓存** - 相同内容不重复翻译
- **美观界面** - 流畅动画，渐变设计
- **隐私优先** - 使用您自己的API密钥
- **深色模式** - 自动适配系统主题

### 💡 **适用场景**
- 📚 学术论文阅读（PubMed、Google Scholar等）
- 📰 新闻网站浏览
- 📖 博客文章阅读
- 🌍 外语学习辅助

---

## 🎬 使用演示

### 简单三步

```
1️⃣ 悬停在文本上
   ↓
2️⃣ 按住 Shift 键
   ↓
3️⃣ 翻译自动显示！
```

### 效果展示

**英文原文**
> The quick brown fox jumps over the lazy dog.

**⬇️ 按住Shift键后 ⬇️**

<details>
<summary>🌐 AI翻译</summary>

敏捷的棕色狐狸跳过了懒惰的狗。

</details>

---

## 📦 安装

### 方式1：加载已构建的扩展

1. 下载或克隆此仓库
```bash
git clone https://github.com/yourusername/ai-immersive-translate.git
cd ai-immersive-translate
```

2. 打开Chrome浏览器，访问 `chrome://extensions/`

3. 启用"开发者模式"（右上角开关）

4. 点击"加载已解压的扩展程序"

5. 选择 `build/chrome-mv3-prod/` 目录

### 方式2：从源码构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 加载 build/chrome-mv3-prod/ 目录
```

---

## 🚀 快速开始

### 1. 配置API密钥

1. 点击浏览器工具栏中的扩展图标
2. 点击"⚙️ Settings"
3. 输入您的 [BigModel API Key](https://open.bigmodel.cn/)
4. 选择目标语言
5. 保存设置

### 2. 开始翻译

1. 访问任何外语网站
2. 将鼠标悬停在文本上
3. 按住 **Shift** 键
4. 查看翻译结果！

---

## ⚙️ 配置选项

### API设置
- **Provider**: BigModel (智谱AI)
- **Model**: GLM-4 或 GLM-3 Turbo
- **API Key**: 从 [open.bigmodel.cn](https://open.bigmodel.cn/) 获取

### 翻译设置
- **源语言**: 自动检测或指定语言
- **目标语言**: 12+种语言可选
- **字体大小**: 可调整

### 支持的语言

🇺🇸 英语 | 🇨🇳 中文 | 🇯🇵 日语 | 🇰🇷 韩语
🇪🇸 西班牙语 | 🇫🇷 法语 | 🇩🇪 德语 | 🇮🇹 意大利语
🇵🇹 葡萄牙语 | 🇷🇺 俄语 | 🇸🇦 阿拉伯语 | 🇮🇳 印地语

---

## 📁 项目结构

```
ai-immersive-translate/
├── src/
│   ├── content.tsx          # 悬停翻译逻辑 ⭐
│   ├── popup.tsx            # 扩展弹窗
│   ├── options.tsx          # 设置页面
│   ├── background.ts        # 后台服务
│   ├── style.css            # 样式文件
│   ├── core/
│   │   ├── translator/      # 翻译引擎
│   │   ├── extractor/       # 文本提取
│   │   ├── cache/           # 缓存管理
│   │   └── renderer/        # 渲染引擎
│   ├── lib/                 # 工具库
│   └── types/               # 类型定义
├── build/                   # 构建输出
└── scripts/                 # 构建脚本
```

---

## 🛠️ 开发

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 打包发布
```bash
npm run package
```

---

## 🔄 版本历史

### v0.0.2 (2026-03-02) ⭐ Current
- ✨ 新增 Shift+悬停翻译功能
- 🎯 智能文本识别算法
- 💾 翻译缓存系统
- 🎨 全新UI设计
- 📱 响应式布局
- 🌙 深色模式支持

### v0.0.1 (2026-03-01)
- 🎉 初始版本发布
- 📄 基础翻译功能

---

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 灵感来自 [沉浸式翻译](https://immersivetranslate.com/)
- 使用 [Plasmo Framework](https://plasmo.com/) 构建
- 由 [BigModel API](https://open.bigmodel.cn/) 提供支持

---

## 🗺️ 路线图

- [ ] 支持更多AI模型（OpenAI、Google等）
- [ ] 快捷键自定义
- [ ] 翻译历史记录
- [ ] PDF文档翻译
- [ ] 词汇本功能
- [ ] 划词翻译
- [ ] 发布到Chrome Web Store

---

## 📞 联系方式

- 📧 问题反馈: [GitHub Issues](https://github.com/yourusername/ai-immersive-translate/issues)
- 💬 功能建议: [GitHub Discussions](https://github.com/yourusername/ai-immersive-translate/discussions)

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐️ Star！**

Made with ❤️ by AI Translate Team

</div>
