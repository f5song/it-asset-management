// src/index.ts
import { createApp } from './app';
import { env } from './config/env';
import { sequelize } from './models';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected');

    const app = createApp();
    app.listen(env.PORT, () => {
      console.log(`Listening on port ${env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down...');
  await sequelize.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received, shutting down...');
  await sequelize.close();
  process.exit(0);
});