const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const root = process.argv[2];
if (!root) {
  console.error('Usage: node download_brownfarm_assets.js <workspaceRoot>');
  process.exit(1);
}

const assets = [
  // Shops
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhzZVEtnDZIcZqSoiSW0WtydbsrD91gICLtvT4OqWF8gobRQI-5ARBFfkHJnYPbGKErX9ylmaAxW88U3-pmQ8ttQTXgO2xVy2gdjCndvVsa-mFTIa_0PsBO2GTHk2kocCnGBh_hjwR6Dg/s1600/food_cart_icon.png', 'public/images/shared/game/shops/food_cart_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTFFic_bXJbmVzXwZ7GE1M0QWv3_hnE0hJ8b_FNXIevgpvu1pO2U0TuGLXxis-q76QeLCyFrGgisUlSXbBQdAzaDI5dnblhP-edKk7Rl3nYfaSCb6gR8tIQmojuVknv7KN-JKB2xddFQ/s1600/crepe_shop_icon.png', 'public/images/shared/game/shops/crepe_shop_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhasBuVyDkXZ-NkviB_yeEews2NMzQlVXkbS9u3Wgl8r8Zz-TgFyiLIUYTnlhoQkWXscD0_g6duAq3gpUj9x6PntyEsL1_r84C0GSvjl6IUSMr8Xwqam3g62qvhTc55E0cSLrauQ-dhJQ/s1600/fast_food_icon.png', 'public/images/shared/game/shops/fast_food_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-dO2z6wnsxjzrhkMwukjfzzPCqvuICjwfNJP9TqT4pEFW9F5rRlaOuE07pssEkyN758MwcrINloL4Akxyf49nSlljVuzbn1tHnCtJqZhKqoUnbtCYNZYYmP7nsqVDXOURSFW6MTavSA/s1600/vanila_icecream_icon.png', 'public/images/shared/game/products/vanilla_ice_cream_icon.png'],
  // Stall products
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiwgRQPd5CVjP1uT7b2alDw0bVHwqviPvrmEuPp8S56-fw1y2m0ikXnXXW5HOc60sS54M6AO1w6he2xIxCp9Z9RLdzTVjstBGH4jVOnfCTClRfo9KNYJL1CblFYJZ4FN0oer4VHLsIgfw/s1600/egg_toast_icon.png', 'public/images/shared/game/products/egg_toast_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiix_Z3C0dW7rHaWssqOQCa01_bZlPyqXkD9MTzoHSPgBEPLa9B1kROAihuoO8bb-d8dfuKHy0KPnytlqUP-cg0XX06Gkqvwjaw1AqkIblgHgT0NRetY4OX7uTIec-6PuQiPgC9oWXlvg/s1600/hot_dog_icon.png', 'public/images/shared/game/products/hot_dog_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjXZBVmGLXKYJtJZ4aDksHKN7Syf9l0iq0X7Ms-niHXGJtZm3DDYXOQXaOTVdccnpvrdb6xBQQKi0gZQNT9tXhg6887caUsiWJQOuoKo7XnIugUcNbSAajJ5X3bEtqks-hdfERPq1M7w/s1600/popcorn_icon.png', 'public/images/shared/game/products/popcorn_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijfCn9OXRgRmFCY7YaLwH0rzPPDTn_cM-6flyJaWI4YaPGC2OSLzGuEjZlQaZYY0IksOwajjqM3blYI1xuXFpo8oDPg9MPaGE2GBQRvnmwc_QA-dYSHlAR2s5EQECSX_HIiFmZQtIIA/s1600/ham_egg_sandwitch_icon.png', 'public/images/shared/game/products/ham_egg_sandwich_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEguS-IWRRpQcPXpgdZBvZ8GeEqqXqLOxD_cWdWlLkGwQHDY9ZqFygnSLHxcTPs4M9ZS8puobS8WcZ3MHVnjZTIIHdD0TjQ89tbwmFLJlS0aaDCsHl7WN4KMKBE56gsnpPx9ejMmeYTmCg/s1600/crepe_icon.png', 'public/images/shared/game/products/crepe_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgIklKD__d5XoSGmLfO0NhXXWzRLP7u6IiRzp7DMR9KvKakstNoxxes2lR21Pj1SmKlpY6TPAfeC4D5Fle23jV_fH_bTTgUwc6nr9sLGs9q4T29qeAepNuBHn4bJURMgE9Xtiq5KgQMwg/s1600/cinnamon_crepe_icon.png', 'public/images/shared/game/products/cinnamon_crepe_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYrYsNsHhQ-FAwuNOIMVFlx-nWbGtTVYxCrty1L-mDVh1OSfTgfig6sDGnmbn76YejBXiuFRAt1GDSg_AjMx9dC4D2aws-H7IIMaZOQoyHOFOEFhi-zDl4O_yiik6bTV_x-q7LqyGK0w/s1600/bacon_crepe_icon.png', 'public/images/shared/game/products/bacon_crepe_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidnIwFweaH4vZl8cwtnB5ckghqH4nzBigmcgoDH2NAjE-9Z7jILbMc3isvJYeG_Vt19qNnrqcVNEn7-B5QmJLNnT1iyaKJkXfpxHzgTVa3is1u7BGwnSMd-nSftwspMKOSCM0psrqotQ/s1600/cream_chocolate_crepe_icon.png', 'public/images/shared/game/products/cream_chocolate_crepe_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhlr8yLvy6kQg9MKBq377FZ4fBAnC0KG3Wzmj-cmGJ9295kxwccEwH7EFq9rRIxp4US-CymVNoas4Wi7eQg82SfW-uETHGrFcso7bdsnaF8DmFbxoF5jeg2eNoDh2Bw13I1jqe6sa-6tA/s1600/cream_strawberry_crepe_icon.png', 'public/images/shared/game/products/cream_strawberry_crepe_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgbuu4DLd5FnNGMJXS6vvaPhoirk8cdyOH2zw6rKFhSongm7HkQQ3hm2vSDGPM3Qo5AgIM7Vc6dRhqmlxgagJIgb2vWWDhKu11SL6rzfxZMHu0zeX46fMxdButWX0q3qCAUMMJ2NKs5hg/s1600/cream_strawberry_icecream_crepe_icon.png', 'public/images/shared/game/products/cream_strawberry_icecream_crepe_icon.png'],
  // Burger products
  ['https://1.bp.blogspot.com/-XSPhDCwhC-I/Vsldyf8nHHI/AAAAAAAABjc/LizCw-Zs1A0/s320/burger-burger.png', 'public/images/shared/game/products/burger-burger.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVy6ilsp7k4gkw11d7afgfjkWymNb0tRGvfZQw5-y3aDOnYBusGtubhksfNbHpx1CSiWORv6WUI3E4_A-YLTPzgYnwSGnBWnR_9RMLt8MZ4N_2oXImkzpgPiEtpKHEKZ6dUc4Q0py1qg/s1600/french_fries_icon.png', 'public/images/shared/game/products/french_fries_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhu8fldonvzF9ca67fTGIuAl5eqkxgwMiXDEt6WWtn2Jljw_qTl8mvEM8X1hzjaMXaXZFtFRgKWg4xg1iG_nnXrxO4V4jzr048JifA2M12tI01IBmUeUoehe2r4O2x1fG0nNW_pvS90Zw/s1600/spicy_cheese_burger_icon.png', 'public/images/shared/game/products/spicy_cheese_burger_icon.png'],
  ['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhn9Kk54iNDlXyDbluPcHIL3i-Bjq_Wp71LdC_A4ULjKt4hYMaqDoIbxc4bCv7fcq9K5631uXTAB7rNQjctBDxre_f83CNRTDExsaQqFxT7wtjyHX29p-mEMv63CLdUOp30rL4F92ogGw/s1600/apple_pie_icon.png', 'public/images/shared/game/products/apple_pie_icon.png'],
  // Juice and ice cream products
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

function fetchToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const target = url.startsWith('https:') ? https : http;
    const request = target.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchToFile(response.headers.location, filePath).then(resolve, reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const stream = fs.createWriteStream(filePath);
      response.pipe(stream);
      stream.on('finish', () => {
        stream.close(() => resolve(filePath));
      });
      stream.on('error', reject);
    });
    request.on('error', reject);
  });
}

(async () => {
  for (const [url, relativePath] of assets) {
    const filePath = path.join(root, relativePath);
    try {
      await fetchToFile(url, filePath);
      console.log(`OK ${relativePath}`);
    } catch (error) {
      console.log(`FAIL ${relativePath} :: ${error.message}`);
    }
  }
})();
