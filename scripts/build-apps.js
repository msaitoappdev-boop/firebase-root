#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const appsJsonPath = path.join(publicDir, 'apps.json');
const templatePath = path.join(publicDir, 'apps', 'index.template.html');
const styleTemplatePath = path.join(publicDir, 'apps', 'style.template.css');

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

const apps = loadJson(appsJsonPath);
const template = loadTemplate(templatePath);
const styleTemplate = loadTemplate(styleTemplatePath);
const targetIds = process.argv.slice(2);

const selectedApps = targetIds.length > 0
  ? apps.filter((app) => targetIds.includes(app.id))
  : apps.filter((app) => app.id === 'caregiver-humanmed');

if (selectedApps.length === 0) {
  console.error('No apps matched target ids:', targetIds);
  process.exit(1);
}

function render(str, vars) {
  return Object.entries(vars).reduce((result, [key, value]) => {
    const safe = value != null ? String(value) : '';
    return result.replace(new RegExp(`{{${key}}}`, 'g'), safe);
  }, str);
}

selectedApps.forEach((app) => {
  const appDir = path.join(publicDir, 'apps', app.id);
  if (!fs.existsSync(appDir)) {
    console.warn(`skip ${app.id}: app directory not found ${appDir}`);
    return;
  }

  const targetPath = path.join(appDir, 'index.html');
  const backupPath = targetPath + '.bak';
  const styleTargetPath = path.join(appDir, 'style.css');
  const styleBackupPath = styleTargetPath + '.bak';

  const page = Object.assign({
    title: app.meta?.title || app.name,
    description: app.meta?.description || app.desc || '',
    canonical: app.meta?.canonical || `https://msaitodev.com${app.path}/`,
    themeColor: app.meta?.themeColor || '#1A237E',
    ogTitle: app.meta?.ogTitle || app.name,
    ogDescription: app.meta?.ogDescription || app.meta?.description || '',
    ogUrl: app.meta?.ogUrl || `https://msaitodev.com${app.path}/`,
    ogImage: app.meta?.ogImage || 'https://msaitodev.com/ogp.png',
    icon16: app.icon16 || `${app.path}/icon-16.png`,
    icon32: app.icon32 || `${app.path}/icon-32.png`,
    name: app.name,
    lead: app.page?.lead || '国家試験対策はこのアプリで。',
    featureQuestions: app.page?.featureQuestions || '厳選300問',
    featureFields: app.page?.featureFields || '人間と社会／介護／こころとからだ／医療的ケア／総合問題',
    playStoreUrl: app.page?.playStoreUrl || '#',
    footerText: app.page?.footerText || `© 2026 ${app.name} (msaitodev.com)`
  }, app);

  const rendered = render(template, page);

  if (fs.existsSync(targetPath)) {
    fs.copyFileSync(targetPath, backupPath);
  }
  fs.writeFileSync(targetPath, rendered, 'utf8');

  const styleVars = {
    brand: app.style?.brand || app.color || '#1976d2',
    bgSoft: app.style?.bgSoft || '#f6f5ff'
  };
  const renderedStyle = render(styleTemplate, styleVars);

  if (fs.existsSync(styleTargetPath)) {
    fs.copyFileSync(styleTargetPath, styleBackupPath);
  }
  fs.writeFileSync(styleTargetPath, renderedStyle, 'utf8');

  console.log(`Generated ${targetPath} and ${styleTargetPath} from template for ${app.id}`);
});

