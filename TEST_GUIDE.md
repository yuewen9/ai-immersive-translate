# 🧪 快速测试指南

## 立即测试您的扩展

### 方法 1: 在 Chrome 中测试 (推荐)

#### 步骤 1: 打开 Chrome 扩展管理页面
```
在 Chrome 地址栏输入: chrome://extensions/
```

#### 步骤 2: 启用开发者模式
- 找到右上角的"开发者模式"开关
- 点击启用它

#### 步骤 3: 加载扩展
- 点击"加载已解压的扩展程序"按钮
- 在文件选择器中导航到:
  ```
  /home/jx2/project/translate_yuewen9/build/chrome-mv3-prod/
  ```
- 选择该文件夹并点击"选择文件夹"

#### 步骤 4: 查看扩展
- 扩展应该出现在扩展列表中
- 名称: "AI Immersive Translate"
- 图标: 紫色渐变方块

#### 步骤 5: 配置扩展
1. 点击 Chrome 工具栏右侧的拼图图标（扩展程序）
2. 找到 "AI Immersive Translate"
3. 点击扩展图标或点击图标旁的拼图按钮固定它

#### 步骤 6: 设置 API Key
1. 点击扩展图标
2. 点击 "⚙️ Settings" 按钮
3. 输入您的 BigModel API Key
4. 选择目标语言（如：英语）
5. 点击保存

#### 步骤 7: 测试翻译
1. 访问一个外文网站（例如: https://www.bbc.com/news）
2. 点击扩展图标
3. 点击 "🚀 Translate this page" 按钮
4. 等待翻译完成
5. 将鼠标悬停在文本上查看翻译

---

### 方法 2: 在 Edge 中测试

#### 步骤 1: 打开 Edge 扩展管理页面
```
在 Edge 地址栏输入: edge://extensions/
```

#### 步骤 2-7: 与 Chrome 相同

---

### 方法 3: 在 Firefox 中测试

#### 步骤 1: 构建 Firefox 版本
```bash
cd /home/jx2/project/translate_yuewen9
npx plasmo build --target=firefox-mv2
```

#### 步骤 2: 打开 Firefox 调试页面
```
在 Firefox 地址栏输入: about:debugging#/runtime/this-firefox
```

#### 步骤 3: 加载临时扩展
- 点击"此 Firefox"下的"加载临时附加组件"
- 选择 build/firefox-mv2-prod/ 目录中的 manifest.json 文件

#### 步骤 4-7: 与 Chrome 相同

---

## 🔑 获取 BigModel API Key

1. 访问: https://open.bigmodel.cn/
2. 注册账号
3. 进入控制台
4. 创建 API Key
5. 复制 API Key
6. 粘贴到扩展设置中

---

## 📝 测试检查清单

### 基础功能
- [ ] 扩展成功加载到浏览器
- [ ] 点击扩展图标能看到 Popup 界面
- [ ] 能打开设置页面
- [ ] 能保存 API Key
- [ ] 能选择目标语言

### 翻译功能
- [ ] 能开始页面翻译
- [ ] 翻译完成后有提示
- [ ] 翻译结果正确显示
- [ ] 鼠标悬停能看到翻译
- [ ] 原文和译文都可见

### 设置功能
- [ ] 能更改显示模式
- [ ] 能更改字体大小
- [ ] 能清除缓存
- [ ] 设置能持久保存

### 边界情况
- [ ] 空页面不会崩溃
- [ ] 无 API Key 时有提示
- [ ] 网络错误时有提示
- [ ] 能在不同类型的网站上工作

---

## 🐛 常见问题

### Q: 扩展加载失败
**A**:
- 确保选择了正确的目录（build/chrome-mv3-prod/）
- 检查 manifest.json 文件是否存在
- 查看 Chrome 扩展页面的错误信息

### Q: 翻译不工作
**A**:
- 检查 API Key 是否正确
- 确认 API Key 有足够的额度
- 打开浏览器控制台查看错误信息
- 检查网络连接

### Q: 翻译速度慢
**A**:
- 这是正常的，取决于 BigModel API 的响应速度
- 大页面需要更长时间
- 可以尝试只翻译部分内容

### Q: 找不到翻译结果
**A**:
- 确保选择了正确的显示模式（悬停、并排、上下）
- 尝试刷新页面
- 检查页面是否有特殊结构

---

## 📸 测试截图建议

测试时可以截图记录:
1. 扩展在工具栏中的显示
2. Popup 界面
3. Settings 页面
4. 翻译前后的页面对比
5. 不同的显示模式效果

---

## 🎯 下一步

测试完成后，您可以:
1. **反馈问题**: 在 GitHub Issues 中报告
2. **提出建议**: 告诉我们想要的功能
3. **贡献代码**: 提交 Pull Request
4. **分享体验**: 告诉其他人这个扩展

---

## 📞 获取帮助

- **GitHub Issues**: https://github.com/yourusername/ai-immersive-translate/issues
- **文档**: 查看 README.md 和 DEVELOPMENT.md
- **示例**: 访问 https://immersivetranslate.com/ 参考类似功能

---

**祝测试愉快！** 🚀
