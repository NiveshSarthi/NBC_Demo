import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Only load dotenv in development - in production/Docker, env vars are injected
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv/config');
    } catch {
        // dotenv not available, likely in production build
    }
}

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),

    migrations: {
        path: 'prisma/migrations',
    },

    datasource: {
        url: env('DATABASE_URL'),
    },
});
