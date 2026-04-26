import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const staticPaths = [
  'mockups',
  'videos',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
];

mkdirSync(dist, { recursive: true });

for (const item of staticPaths) {
  const source = join(root, item);
  if (!existsSync(source)) continue;
  cpSync(source, join(dist, item), {
    recursive: true,
    filter: current => basename(current) !== '.DS_Store',
  });
}
