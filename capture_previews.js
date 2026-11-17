const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = '/home/gamp/.gemini/antigravity-cli/brain/66574e5b-2a52-4283-948c-d0712a93712c/screenshots';

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log('Capturing Landing Page...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '1_landing_page.png') });

  // 2. Mobile Feedback Form
  console.log('Capturing Mobile Feedback Form...');
  await page.setViewport({ width: 420, height: 880, isMobile: true });
  await page.goto('http://localhost:3000/r/trattoria-bella?table=4', { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '2_mobile_feedback_form.png') });

  // 3. Complete and submit feedback to show voucher confirmation
  console.log('Interacting with feedback form to capture voucher confirmation...');
  // Click 5th star
  const stars = await page.$$('button[aria-label*="star"]');
  if (stars.length >= 5) {
    await stars[4].click();
  }
  await page.type('#positive', 'Remarkable dining experience! The truffle gnocchi was heavenly.');
  await page.type('input[placeholder*="Your Name"]', 'Victoria Sinclair');
  await page.type('input[placeholder*="Phone Number"]', '+1 (555) 890-2341');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '3_mobile_form_filled.png') });

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForSelector('.shadow-inner, h2');
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '4_mobile_voucher_confirmed.png') });
  }

  // 4. Owner Dashboard
  console.log('Capturing Owner Dashboard...');
  await page.setViewport({ width: 1366, height: 850, isMobile: false });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  
  // Click autofill demo button
  const demoBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent.includes('Fill Demo'));
    if (fillBtn) {
      fillBtn.click();
      return true;
    }
    return false;
  });

  if (demoBtn) {
    await new Promise(r => setTimeout(r, 500));
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '5_owner_dashboard.png') });

    // 5. QR Code Generator
    console.log('Capturing QR Code Generator...');
    await page.goto('http://localhost:3000/dashboard/qr', { waitUntil: 'networkidle2' });
    await page.waitForSelector('svg');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '6_table_qr_generator.png') });
  }

  await browser.close();
  console.log('All screenshots captured successfully in', OUTPUT_DIR);
}

main().catch(err => {
  console.error('Error capturing previews:', err);
  process.exit(1);
});
