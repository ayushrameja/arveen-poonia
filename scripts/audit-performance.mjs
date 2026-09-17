import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const [url = 'http://127.0.0.1:4323/', label = 'current'] = process.argv.slice(2);
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Use letters, numbers, underscores or hyphens for the report label.');
const directory = new URL('../reports/performance/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const device of ['mobile', 'desktop']) {
  const args = [fileURLToPath(import.meta.resolve('lighthouse/cli/index.js')), url,
    '--only-categories=performance', '--chrome-flags=--headless --no-sandbox',
    '--output=json', '--output=html', '--quiet',
    `--output-path=${fileURLToPath(new URL(`${label}-${device}`, directory))}`,
  ];
  if (device === 'desktop') args.push('--preset=desktop');
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`${device} report: reports/performance/${label}-${device}.report.html`);
}
