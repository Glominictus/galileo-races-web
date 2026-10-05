// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

const isVercel = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
  integrations: [react()],
  server: { port: 4321 },
  vite: {
    envPrefix: ['PUBLIC_'],
  },
});
