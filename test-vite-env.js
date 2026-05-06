import { loadEnv } from 'vite';
process.env.TEST_KEY = '123';
const env = loadEnv('development', '.', '');
console.log('TEST_KEY:', env.TEST_KEY);
