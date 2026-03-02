# 🔍 问题诊断指南

## 问题：Shift+悬停翻译没有反应

### 📋 请按以下步骤检查：

---

## 步骤1：检查控制台错误

### 打开开发者工具
1. 在要翻译的页面上，按 **F12** 键
2. 或右键点击页面 → 选择"检查"
3. 点击 **Console** 标签

### 查看是否有错误
- 🔴 如果看到红色错误信息，请截图或复制错误内容
- 🟡 如果看到黄色警告，也请记录下来
- 🔵 查找是否有 "AI Immersive Translate" 相关的消息

---

## 步骤2：检查扩展权限

### 1. 确认扩展已启用
1. 访问 `chrome://extensions/`
2. 找到 "AI Immersive Translate"
3. 确认开关是 **开启状态**（蓝色）

### 2. 检查网站权限
1. 在扩展卡片上，点击"详细信息"
2. 查看"网站访问权限"
3. 确保是"在所有网站上"或已添加当前网站

---

## 步骤3：确认API Key已设置

### 检查API Key状态
1. 点击扩展图标
2. 查看状态图标：
   - ✅ = API Key已设置
   - ⚠️ = 需要设置API Key

### 如果显示⚠️
1. 点击"⚙️ Settings"
2. 输入BigModel API Key
3. 保存

---

## 步骤4：测试基础功能

### 简单测试页面
访问以下测试页面之一：

**选项1：简单文本测试**
```
data:text/html,<html><body><h1>Hello World</h1><p>This is a test paragraph with some English text for translation.</p></body></html>
```

**选项2：空白页面测试**
1. 打开 `about:blank`
2. 在控制台输入：
```javascript
document.body.innerHTML = '<h1 style="padding:20px">Test Title</h1><p style="padding:20px">This is a test paragraph for translation.</p>';
```

### 在测试页面上操作
1. 将鼠标悬停在文本上
2. 按住 **Shift** 键
3. 查看是否有任何反应

---

## 步骤5：手动检查Content Script

### 在控制台输入以下命令：

```javascript
// 检查content script是否加载
console.log('Content script check:', typeof window !== 'undefined');

// 检查是否有事件监听器
console.log('Event listeners:', getEventListeners(document).keydown?.length);
```

---

## 常见问题和解决方案

### ❌ 问题1：完全没有反应

**可能原因：**
- Content script没有注入
- 扩展权限问题

**解决方法：**
1. 完全移除扩展
2. 重新加载扩展
3. 刷新测试页面

### ❌ 问题2：控制台显示API错误

**可能原因：**
- API Key无效
- 网络连接问题
- API额度不足

**解决方法：**
1. 检查API Key是否正确
2. 访问 https://open.bigmodel.cn/ 确认账户状态

### ❌ 问题3：有反应但翻译不显示

**可能原因：**
- CSS样式未加载
- 元素检测失败

**解决方法：**
1. 检查控制台是否有黄色警告
2. 尝试在不同类型的文本上测试

---

## 🔧 强制刷新

### 完整刷新步骤
1. 访问 `chrome://extensions/`
2. 点击扩展的"移除"按钮
3. 重启浏览器
4. 重新加载扩展
5. 重新测试

---

## 📊 提供诊断信息

如果以上步骤都无效，请提供以下信息：

### 必需信息
1. **浏览器版本：**
   - Chrome版本号
   - 访问 `chrome://version/` 查看

2. **控制台错误：**
   - 打开F12控制台
   - 截图所有红色错误

3. **测试页面：**
   - 您在哪个页面上测试的？
   - 页面URL

4. **操作步骤：**
   - 具体描述您做了什么
   - 预期看到什么
   - 实际看到什么

### 可选信息
- 操作系统版本
- 其他扩展是否干扰
- 是否在隐身模式下测试

---

## 💾 使用调试版本

如果需要更详细的调试信息：

1. 我已创建了一个调试版本
2. 它会在右上角显示调试信息
3. 实时显示Shift键状态和悬停元素

**要使用调试版本，告诉我，我会为您构建。**

---

## 📞 下一步

请完成上述检查后，告诉我：
- ✅ 哪些步骤成功了
- ❌ 在哪一步遇到了问题
- 📋 控制台的任何错误信息

我会根据您的反馈提供针对性的解决方案！
