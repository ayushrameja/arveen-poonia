import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';
const [url = 'http://localhost:4321/', label = 'scroll-current', distanceScale = '1', chapter = 'opening'] = process.argv.slice(2);
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Invalid report label');
const directory = new URL('../reports/performance/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const client = await page.createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Performance.enable');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.hero')?.dataset.running === 'true');
  await pause(1200);
  if (chapter === 'evening') {
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('[data-closing-tone]').getBoundingClientRect().top + scrollY - innerHeight * .75 - 300, behavior: 'instant' }));
    await pause(900);
  }
  const travel = chapter === 'evening' ? 600 : 1100;
  const before = (await client.send('Performance.getMetrics')).metrics;
  await page.tracing.start({ path: new URL(`${label}.trace.json`, directory).pathname, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing'] });
  await page.evaluate(() => {
    const data = { frames: [], longTasks: [], states: [], start: performance.now(), phase: 'scroll', last: 0, raf: 0 };
    const loop = t => { if (data.last) data.frames.push({ time: t, duration: t - data.last, phase: data.phase }); data.last = t; data.raf = requestAnimationFrame(loop); };
    data.raf = requestAnimationFrame(loop);
    data.tasks = new PerformanceObserver(list => data.longTasks.push(...list.getEntries().map(e => ({ duration: e.duration, time: e.startTime }))));
    data.tasks.observe({ type: 'longtask' });
    window.scrollProfile = data;
  });
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const distance of [-travel, travel]) {
      await client.send('Input.synthesizeScrollGesture', { x: 1150, y: 500, yDistance: distance * Number(distanceScale), speed: 850 * Number(distanceScale), gestureSourceType: 'mouse' });
      await pause(500);
      await page.evaluate(() => window.scrollProfile.states.push({ y: scrollY, running: document.querySelector('.hero').dataset.running, tone: document.documentElement.className }));
    }
  }
  await page.evaluate(() => { window.scrollProfile.phase = 'idle-hero'; });
  await pause(3000);
  await page.evaluate(() => { window.scrollProfile.phase = 'scroll'; });
  await client.send('Input.synthesizeScrollGesture', { x: 1150, y: 500, yDistance: -(travel + 50) * Number(distanceScale), speed: 1000 * Number(distanceScale), gestureSourceType: 'mouse' });
  await pause(1000);
  await page.evaluate(() => { window.scrollProfile.phase = 'idle-second'; });
  await pause(3000);
  const samples = await page.evaluate(() => {
    const data = window.scrollProfile;
    cancelAnimationFrame(data.raf); data.tasks.disconnect();
    const summary = phase => {
      const values = data.frames.filter(f => f.phase === phase).map(f => f.duration).sort((a,b) => a-b);
      return { frames: values.length, p95Ms: values[Math.floor(values.length * .95)], maxMs: values.at(-1), over33ms: values.filter(n => n > 33.4).length, over50ms: values.filter(n => n > 50).length };
    };
    return { durationMs: performance.now() - data.start, phases: Object.fromEntries(['scroll', 'idle-hero', 'idle-second'].map(p => [p, summary(p)])), longTasks: data.longTasks, states: data.states, finalY: scrollY, finalHeroRunning: document.querySelector('.hero').dataset.running };
  });
  const trace = JSON.parse(Buffer.from(await page.tracing.stop()).toString());
  const traceWorkMs = {};
  for (const name of ['Paint', 'Layout', 'UpdateLayoutTree', 'RasterTask', 'FireAnimationFrame']) traceWorkMs[name] = trace.traceEvents.filter(e => e.name === name && e.ph === 'X').reduce((sum,e) => sum + (e.dur || 0) / 1000, 0);
  const after = (await client.send('Performance.getMetrics')).metrics;
  const metric = (list, name) => list.find(m => m.name === name)?.value ?? 0;
  const taskMs = (metric(after, 'TaskDuration') - metric(before, 'TaskDuration')) * 1000;
  const report = { url, chapter, distanceScale: Number(distanceScale), environment: '1440x1000, DPR 2, 4x CPU slowdown, three wheel-scroll round trips across the selected chapter boundary, followed by idle phases. rAF intervals are a proxy, not presented GPU frames or temperature.', ...samples, taskMs, mainThreadBusyPercent: taskMs / samples.durationMs * 100, traceWorkMs, errors };
  await writeFile(new URL(`${label}.json`, directory), JSON.stringify(report, null, 2));
  await page.screenshot({ path: new URL(`${label}.png`, directory).pathname });
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
