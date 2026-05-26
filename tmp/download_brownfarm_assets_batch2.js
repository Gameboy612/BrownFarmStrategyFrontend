const fs = require('fs');
const path = require('path');
const https = require('https');

const root = process.argv[2];
if (!root) throw new Error('workspace root required');

const assets = [
  ['https://3.bp.blogspot.com/-o0_Deg8gzpY/Vsxqr-3iZdI/AAAAAAAABlo/p6M4dwbUCN4/s320/juicer-apple.png', 'public/images/shared/game/products/juicer-apple.png'],
  ['https://2.bp.blogspot.com/-LNcuM7kzPaM/Vsxqsfk_BNI/AAAAAAAABlo/G4NZeSkA3k0/s320/juicer-strawberry.png', 'public/images/shared/game/products/juicer-strawberry.png'],
  ['https://1.bp.blogspot.com/--qa8nnVGM2s/VsxqsA4zgmI/AAAAAAAABlo/1xTC9gNPwbc/s320/juicer-carrot.png', 'public/images/shared/game/products/juicer-carrot.png'],
  ['https://2.bp.blogspot.com/-NZGKPoMMFWI/VsxqsaAijeI/AAAAAAAABlo/PJGd7-CzTqI/s320/juicer-tomato.png', 'public/images/shared/game/products/juicer-tomato.png'],
  ['https://3.bp.blogspot.com/-KGzdj0aKdzk/Vsxqs0Br48I/AAAAAAAABlo/CDergfPkNUE/s320/sauce-tsuyu.png', 'public/images/shared/game/products/sauce-tsuyu.png'],
  ['https://3.bp.blogspot.com/-rUdsmpXKOBU/VsxqsqjHgkI/AAAAAAAABlo/jySn4kicRPw/s320/sauce-miso.png', 'public/images/shared/game/products/sauce-miso.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-dO2z6wnsxjzrhkMwukjfzzPCqvuICjwfNJP9TqT4pEFW9F5rRlaOuE07pssEkyN758MwcrINloL4Akxyf49nSlljVuzbn1tHnCtJqZhKqoUnbtCYNZYYmP7nsqVDXOURSFW6MTavSA/s1600/vanila_icecream_icon.png', 'public/images/shared/game/products/vanilla_ice_cream_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhGuN60U5aW14t-nVxJWVNcukbr0q5uncwip-xKXtEfd9vdHHhQAh-SpGILw5NAxmjw6nZBDYpV7kcnmO3kGabYb09y2fA-Qk_B2OrXmt2bNbol5HD4qt5X_z7zEKtFLWhx3U_j7HK_Rg/s1600/chocolate_icecream_icon.png', 'public/images/shared/game/products/chocolate_icecream_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNxJ33fK2zpoJXdnwWhKxx7q_brjaFaKnktqhMFaBt1iQ23fjdG6p-XICiPGTAeTjhyq6A7lCKxLL9wqv8Sits3vHa2N0bnykn4qM4uKLHLzoc-OcchB35rmxcN0vD9Np9IK1pBZ4hhw/s1600/strawberry_icecream_icon.png', 'public/images/shared/game/products/strawberry_icecream_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjowM0yIDTOCvHKsAAOW2aplnpO0yb1ubiUxr2FuhYIXnKDJ7giPMVBUCK6B153igRBYlIG0b5j0fpZendnc8M4cX7x-IXZxzf5mB-XQ6pBCuRPcrMjBGTYQMYPOJfmp5-AOwV5PGTyDg/s1600/grape_sherbet_icon.png', 'public/images/shared/game/products/grape_sherbet_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfj-eI3btieVY9QWSCP3j38zeuMWbPfORNnx0J3FwHoZDRyyVfKG8QnJl86uMtIos_W1ZKMgjPkw06yUzTYoKEHdfDxfsIlp_4D1-hZrhgieLXMzYm0-EVo195dNIeb8IweloBF_L7ww/s1600/fruit_yogurt_icon.png', 'public/images/shared/game/products/fruit_yogurt_icon.png'],
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
