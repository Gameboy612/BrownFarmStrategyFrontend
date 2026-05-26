const fs = require('fs');
const path = require('path');
const https = require('https');

const root = process.argv[2];
if (!root) throw new Error('workspace root required');

const assets = [
  ['https://2.bp.blogspot.com/-cjsI1M6cz-g/VsxqqgWV7KI/AAAAAAAABk0/n77EtFleXPg/s320/cakeshop-creamcake.png', 'public/images/shared/game/products/cakeshop-creamcake.png'],
  ['https://4.bp.blogspot.com/-0zTWfAIvHw4/VsxqqoLWNKI/AAAAAAAABlo/m9Xz19n87sM/s320/cakeshop-rollcake.png', 'public/images/shared/game/products/cakeshop-rollcake.png'],
  ['https://1.bp.blogspot.com/-SblnVPH2K20/VsxqqKBEg1I/AAAAAAAABlo/YJdZDwoyfX8/s320/cakeshop-chocolatecake.png', 'public/images/shared/game/products/cakeshop-chocolatecake.png'],
  ['https://1.bp.blogspot.com/-R1j-79rQqcY/Vs_TRbwnaHI/AAAAAAAABms/Pwk7pv8eW04/s320/cakeshop-strawberrycake.png', 'public/images/shared/game/products/cakeshop-strawberrycake.png']
];

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, filePath).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const ws = fs.createWriteStream(filePath);
      res.pipe(ws);
      ws.on('finish', () => ws.close(() => resolve()));
      ws.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  for (const [url, relPath] of assets) {
    const filePath = path.join(root, relPath);
    try {
      await download(url, filePath);
      console.log(`OK ${relPath}`);
    } catch (error) {
      console.log(`FAIL ${relPath} :: ${error.message}`);
    }
  }
})();
