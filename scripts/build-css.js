const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// 读取 package.json
const pkg = require('../package.json');

// 获取当前时间
const buildTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

// 生成头部注释内容
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * Built: ${buildTime}
 * © ${new Date().getFullYear()} ${pkg.author || 'Your Company'}. ${pkg.license} License.
 * ${pkg.repository?.url || ''}
 */

`;

// 读取原始 SCSS 入口文件
const inputPath = path.join(__dirname, '../src/index.scss');
const outputPathDev = path.join(__dirname, '../dist/index.css');
const outputPathMin = path.join(__dirname, '../dist/index.min.css');

async function build() {
  try {
    // 读取源文件
    let scssContent = await fs.readFile(inputPath, 'utf8');

    // 如果第一行不是注释，则插入 banner
    if (!scssContent.trimStart().startsWith('/*!')) {
      scssContent = banner + scssContent;
    }

    // 写入临时文件（或直接编译）
    const tempPath = path.join(__dirname, '../src/_temp_with_banner.scss');
    await fs.writeFile(tempPath, scssContent, 'utf8');

    // 编译开发版（未压缩）
    execSync(`npx sass ${tempPath} ${outputPathDev} --style=expanded`, {
      stdio: 'inherit',
    });

    // 编译生产版（压缩）
    execSync(`npx sass ${tempPath} ${outputPathMin} --style=compressed`, {
      stdio: 'inherit',
    });

    // 删除临时文件
    await fs.unlink(tempPath);

    console.log('✅ CSS 构建完成，版本注释已注入');
  } catch (err) {
    console.error('❌ 构建失败:', err);
    process.exit(1);
  }
}

build();