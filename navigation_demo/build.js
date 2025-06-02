const fs = require('fs');
const path = require('path');

// 尝试加载.env文件
try {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    const envConfig = require('dotenv').config();
    if (envConfig.error) {
      console.warn('无法加载.env文件:', envConfig.error);
    } else {
      console.log('已加载.env文件');
    }
  }
} catch (err) {
  console.warn('加载.env文件时出错，继续使用环境变量或默认值');
}

// 读取环境变量或使用默认值（仅用于开发）
const AMAP_API_KEY = process.env.AMAP_API_KEY || '8e1e34164e10f043232da14f0778e482';
const AMAP_SECURITY_KEY = process.env.AMAP_SECURITY_KEY || '6ef46ff59efbe5840a9c5707b450b58a';

// 读取HTML文件
const htmlPath = path.join(__dirname, 'public', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 替换占位符
htmlContent = htmlContent.replace('__AMAP_API_KEY__', AMAP_API_KEY);
htmlContent = htmlContent.replace('__AMAP_SECURITY_KEY__', AMAP_SECURITY_KEY);

// 创建dist目录（如果不存在）
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 写入处理后的HTML文件
fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

// 复制其他文件到dist目录
const filesToCopy = ['script.js', 'styles.css'];
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, 'public', file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`已复制: ${file}`);
  }
});

console.log('构建完成! 文件已生成到dist目录'); 