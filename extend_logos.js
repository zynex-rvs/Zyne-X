const sharp = require('sharp');
const fs = require('fs');

async function extendImage(path) {
  const tempPath = path + '.tmp.png';
  
  await sharp(path)
    .extend({
      top: 150,
      bottom: 150,
      left: 150,
      right: 150,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(tempPath);
    
  // Rename temp to original
  fs.renameSync(tempPath, path);
  console.log('Extended: ' + path);
}

async function main() {
  await extendImage('public/zynex-logo.png');
  await extendImage('public/rivals-logo.png');
}

main().catch(console.error);
