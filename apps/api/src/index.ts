// index.ts
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`Exceptions API listening on :${env.PORT} (${env.NODE_ENV})`);
});