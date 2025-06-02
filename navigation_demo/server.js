const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 高德地图API密钥
const AMAP_API_KEY = process.env.AMAP_API_KEY || '8e1e34164e10f043232da14f0778e482';
const AMAP_SECURITY_KEY = process.env.AMAP_SECURITY_KEY || '6ef46ff59efbe5840a9c5707b450b58a';

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 代理高德地图API请求
app.get('/api/map-config', (req, res) => {
  res.json({
    apiKey: AMAP_API_KEY,
    securityKey: AMAP_SECURITY_KEY
  });
});

// 提供修改后的index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-proxy.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 