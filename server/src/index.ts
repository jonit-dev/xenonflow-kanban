import 'reflect-metadata';
import { createApp, gracefulShutdown } from './app';
import { setupDI } from './di-container';

const PORT = process.env.PORT || 3000;

async function main() {
  // Setup TypeDI and run migrations
  setupDI();

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API docs: http://localhost:${PORT}/api`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => {
      gracefulShutdown();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.close(() => {
      gracefulShutdown();
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
