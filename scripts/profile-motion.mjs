import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';

const [url = 'http://127.0.0.1:4323/', label = 'current', repeat = '3'] = process.argv.slice(2);
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Use letters, numbers, underscores or hyphens for the report label.');
if (!Number.isInteger(Number(repeat)) || Number(repeat) < 1 || Number(repeat) > 10) throw new Error('Use 1–10 profiling runs.');
const executablePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const directory = new URL('../reports/performance/', import.meta.url);
await mkdir(directory, { recursive: true });
const runs = [];
for (let run = 1; run <= Number(repeat); run++) {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    const client = await page.createCDPSession();
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await client.send('Performance.enable');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelector('.hero')?.dataset.cycleReady === 'true');
    // Let the intro finish. Only profile steady state + the two natural scene changes.
    await new Promise(resolve => setTimeout(resolve, 3500));
    const before = (await client.send('Performance.getMetrics')).metrics;
    await page.tracing.start({ path: new URL(`${label}-motion-${run}.trace.json`, directory).pathname, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing'] });
    const samples = await page.evaluate(() => new Promise(resolve => {
      const start = performance.now();
      const frames = [];
      const changes = [];
      const longTasks = [];
      const hero = document.querySelector('.hero');
      let scene = hero.dataset.scene;
      let previous;
      let raf;
      const observer = new MutationObserver(() => {
        if (hero.dataset.scene !== scene) {
          scene = hero.dataset.scene;
          changes.push({ time: performance.now(), scene });
        }
      });
      observer.observe(hero, { attributes: true, attributeFilter: ['data-scene'] });
      const tasks = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration }))));
      tasks.observe({ type: 'longtask' });
      const frame = time => {
        if (previous !== undefined) frames.push({ time, duration: time - previous });
        previous = time;
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      setTimeout(() => {
        cancelAnimationFrame(raf); observer.disconnect(); tasks.disconnect();
        const summarize = items => {
          const sorted = items.map(item => item.duration).sort((a,b) => a-b);
          return { frames: sorted.length, p95FrameMs: sorted[Math.floor(sorted.length * .95)] ?? null, maxFrameMs: sorted.at(-1) ?? null, over33ms: sorted.filter(n => n > 33.4).length, over50ms: sorted.filter(n => n > 50).length };
        };
        const transition = frames.filter(frame => changes.some(change => frame.time >= change.time && frame.time <= change.time + 1700));
        resolve({ durationMs: performance.now() - start, changes, transitions: summarize(transition), allFrames: summarize(frames), longTasks, imageSizes: [...document.querySelectorAll('[data-portrait-frame]')].map(image => ({ src: image.currentSrc, naturalWidth: image.naturalWidth, renderedWidth: image.clientWidth })) });
      }, 19000);
    }));
    const traceBuffer = await page.tracing.stop();
    const trace = JSON.parse(Buffer.from(traceBuffer).toString());
    const events = trace.traceEvents;
    const totals = {};
    for (const name of ['Paint', 'Layout', 'UpdateLayoutTree', 'RasterTask']) totals[name] = events.filter(e => e.name === name && e.ph === 'X').reduce((sum,e) => sum + (e.dur || 0) / 1000, 0);
    const after = (await client.send('Performance.getMetrics')).metrics;
    const metric = (list,name) => list.find(item => item.name === name)?.value ?? 0;
    const taskMs = (metric(after,'TaskDuration') - metric(before,'TaskDuration')) * 1000;
    const result = { run, ...samples, taskMs, mainThreadBusyPercent: taskMs / samples.durationMs * 100, jsHeapMiB: metric(after,'JSHeapUsedSize') / 1024 ** 2, traceWorkMs: totals, errors };
    runs.push(result);
    await page.screenshot({ path: new URL(`${label}-motion-${run}.png`, directory).pathname });
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
}
await writeFile(new URL(`${label}-motion.json`, directory), JSON.stringify({ url, environment: 'Headless Chrome, 1440x1000, DPR 2, 4x CPU slowdown, natural portrait changes, 19s sampling after startup. rAF timing is a proxy, not GPU/presented FPS. TaskDuration is renderer main-thread time, not system CPU.', runs }, null, 2));
