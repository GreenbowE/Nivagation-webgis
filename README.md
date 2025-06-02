# 南昌旅游景点地图导航演示-江西理工大学WebGIS课设

这是一个基于高德地图API的南昌旅游景点导航演示项目。

## 本地开发

### 环境准备

1. 确保已安装Node.js (建议v14或更高版本)
2. 克隆此仓库到本地

### 设置环境变量

1. 复制`env.example`文件并重命名为`.env`
2. 在`.env`文件中填入您的高德地图API密钥:
   ```
   AMAP_API_KEY=您的高德地图API密钥
   AMAP_SECURITY_KEY=您的高德地图安全密钥
   ```

### 安装依赖

```bash
npm install
```

## 运行项目

### 方法1: 使用代理服务器（推荐）

这种方法使用Express服务器来保护您的API密钥，密钥不会暴露在前端代码中。

```bash
npm start
```

然后在浏览器中访问 http://localhost:3000

### 方法2: 使用静态构建

这种方法会将API密钥注入到静态HTML中，适合本地开发或受信任的环境。

```bash
npm run build
npm run static
```

然后在浏览器中访问 http://localhost:3000

## 部署到网络

### 部署到Vercel（推荐）

1. 安装Vercel CLI: `npm install -g vercel`
2. 登录Vercel: `vercel login`
3. 在Vercel仪表板中设置环境变量:
   - `AMAP_API_KEY`
   - `AMAP_SECURITY_KEY`
4. 部署: `vercel --prod`

### 部署到Netlify

1. 在Netlify仪表板中创建一个新站点
2. 连接到您的GitHub仓库
3. 设置构建命令: `npm run build`
4. 设置发布目录: `dist`
5. 在Netlify仪表板中设置环境变量

### 部署到GitHub Pages

由于GitHub Pages只支持静态网站，我们需要使用静态构建方法：

1. 构建项目: `npm run build`
2. 将`dist`目录中的内容推送到GitHub仓库的`gh-pages`分支

**注意:** 此方法会将API密钥嵌入到HTML中，仅建议用于测试或演示目的。

## 安全最佳实践

### 方法比较

1. **代理服务器方法（推荐）**
   - 优点: API密钥不暴露在前端代码中
   - 缺点: 需要服务器支持
   - 适用场景: 生产环境、公开仓库

2. **环境变量构建方法**
   - 优点: 简单，无需服务器
   - 缺点: API密钥嵌入在构建后的HTML中
   - 适用场景: 开发环境、私有仓库、受限访问的网站

### 其他安全建议

- 在高德地图开发者平台设置HTTP Referer白名单
- 启用API密钥的使用限制
- 定期轮换API密钥
- 监控API使用情况，及时发现异常

## 注意事项

- 请勿将您的API密钥直接提交到公共仓库
- 确保在生产环境中正确设置环境变量
- 如果遇到跨域问题，请在高德地图开发者平台中添加您的网站域名到白名单 
