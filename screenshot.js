const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const pages = [
    { name: 'home-desktop', url: 'http://localhost:8080', width: 1440, height: 900 },
    { name: 'home-mobile', url: 'http://localhost:8080', width: 390, height: 844 },
    { name: 'admin-desktop', url: 'http://localhost:8080/admin.html', width: 1440, height: 900 },
    { name: 'cart-desktop', url: 'http://localhost:8080/cart.html', width: 1440, height: 900 },
  ];
  
  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: p.width, height: p.height });
    await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ 
      path: `/home/phone-shop/images/screenshot-${p.name}.png`, 
      fullPage: true 
    });
    console.log(`✅ ${p.name} screenshot saved`);
    await page.close();
  }
  
  await browser.close();
  console.log('All screenshots done!');
})();
