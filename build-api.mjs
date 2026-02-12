import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
    entryPoints: [path.join(__dirname, 'api', 'index.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile: path.join(__dirname, 'api', 'index.mjs'),
    // Keep node_modules as external — Vercel installs them
    packages: 'external',
    // Resolve path aliases from tsconfig
    alias: {
        '@shared': path.join(__dirname, 'shared'),
        '@': path.join(__dirname, 'client', 'src'),
        '@assets': path.join(__dirname, 'attached_assets'),
    },
    // Banner to ensure proper ESM compatibility
    banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const require = createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
    `.trim(),
    },
});

console.log('✅ API function bundled successfully → api/index.mjs');
