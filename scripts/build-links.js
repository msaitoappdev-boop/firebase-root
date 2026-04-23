#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const appsJsonPath = path.join(publicDir, 'apps.json');
const templatePath = path.join(publicDir, 'links.template.html');
const targetPath = path.join(publicDir, 'links.html');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: file not found ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadTemplate(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: template not found ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function render(str, vars) {
  return Object.entries(vars).reduce((result, [key, value]) => {
    const safe = value != null ? String(value) : '';
    return result.replace(new RegExp(`{{${key}}}`, 'g'), safe);
  }, str);
}

const apps = loadJson(appsJsonPath);
const template = loadTemplate(templatePath);

// 各アプリのリンクHTMLを生成
const linksHtml = apps.map(app => {
  const color = app.color || '#0b7';
  const descHtml = app.desc ? `<span class="link-desc">${app.desc}</span>` : '';
  
  // インデントを揃えるためにあえてテンプレートリテラル内の空白を調整しています
  return `      <a href="${app.path}" class="link-item link-item-dynamic" style="--app-color: ${color}">
        <span class="link-name">${app.name}</span>
        ${descHtml}
      </a>`;
}).join('\n');

const rendered = render(template, {
  links: linksHtml
});

// 既存ファイルのバックアップ
if (fs.existsSync(targetPath)) {
  const backupPath = targetPath + '.bak';
  fs.copyFileSync(targetPath, backupPath);
}

try {
  fs.writeFileSync(targetPath, rendered, 'utf8');
  console.log(`Successfully generated ${targetPath}`);
} catch (err) {
  console.error(`Failed to write file: ${err.message}`);
}