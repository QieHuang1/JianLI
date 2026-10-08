const { chromium } = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1007-641-0_26.1007.641.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');
const output = path.resolve(__dirname, '../../.preview-check/portfolio');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(output, 'desktop-hero.png') });
  const titles = await page.locator('.work-card').count();
  if (titles !== 11) throw new Error(`Expected 11 works, found ${titles}`);
  const playback = [];
  for (let i = 0; i < titles; i++) {
    const card = page.locator('.work-card').nth(i);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await page.waitForFunction(() => document.querySelector('dialog video')?.readyState >= 2);
    await page.waitForFunction(() => document.querySelector('dialog video')?.currentTime > 0);
    playback.push(await page.locator('dialog video').evaluate(video => ({ src: video.getAttribute('src'), duration: video.duration, currentTime: video.currentTime, width: video.videoWidth, height: video.videoHeight })));
    if (i === 0) await page.screenshot({ path: path.join(output, 'video-dialog.png') });
    await page.keyboard.press('Escape');
    if (await page.locator('dialog').evaluate(dialog => dialog.open)) throw new Error('Escape did not close dialog');
    if (await card.evaluate(el => el !== document.activeElement)) throw new Error('Focus did not return to card');
  }
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, 'desktop-full.png'), fullPage: true });
  const resume = await page.request.get('http://127.0.0.1:5173/media/resume.pdf');
  if (!resume.ok() || !(await resume.body()).subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error('Resume download failed');
  const layouts = [];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    for (const id of ['about', 'experience', 'works', 'group-0', 'group-1', 'group-2', 'group-3', 'contact']) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    const measurements = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src) }));
    if (measurements.scrollWidth > width || measurements.brokenImages.length) throw new Error(JSON.stringify(measurements));
    layouts.push(measurements);
    if (width === 390) {
      await page.screenshot({ path: path.join(output, 'mobile-full.png'), fullPage: true });
      await page.locator('#top').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, 'mobile-hero.png') });
    }
  }
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  const reducedPaused = await reduced.locator('.hero-video').evaluate(video => video.paused);
  const result = { title: await page.title(), playback, layouts, resume: resume.status(), reducedPaused, errors };
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await browser.close();
  if (errors.length || !reducedPaused) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
