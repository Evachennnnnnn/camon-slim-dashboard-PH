#!/usr/bin/env node
/**
 * 替换 index.html 中的 D 对象
 * 用法: node replace-d.js
 * 
 * 流程:
 * 1. 读取 new-d.txt（新的 D 对象文本，以 const D = { 开头，}; 结尾）
 * 2. 读取 index.html
 * 3. 替换 index.html 中的 D 对象
 * 4. 写回 index.html
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const newPath = path.join(__dirname, 'new-d.txt');

if (!fs.existsSync(newPath)) {
  console.error('❌ new-d.txt 不存在，请先生成新的 D 对象');
  process.exit(1);
}

let content = fs.readFileSync(htmlPath, 'utf8');
const newD = fs.readFileSync(newPath, 'utf8').trim();

// 找到 D 对象起止位置
const startMarker = 'const D = {';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error('❌ 无法找到 const D = {');
  process.exit(1);
}

// 从 startIndex 开始找匹配的 };
const afterStart = content.substring(startIndex);
const endMatch = afterStart.match(/\n\};\n/);

if (!endMatch) {
  console.error('❌ 无法找到 D 对象的结束标记 };');
  process.exit(1);
}

const endIndex = startIndex + endMatch.index + endMatch[0].length;

// 替换
const newContent = content.substring(0, startIndex) + newD + '\n' + content.substring(endIndex);

fs.writeFileSync(htmlPath, newContent, 'utf8');

// 输出摘要
const lines = newD.split('\n').length;
console.log(`✅ D 对象已替换（${lines} 行）`);
console.log(`📄 index.html 大小: ${(newContent.length / 1024).toFixed(1)} KB`);
