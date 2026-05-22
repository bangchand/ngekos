import { logger } from '@/utils/logger';
import { app } from '@/app';
import { env } from '@/config/env';
import { connectDatabase, disconnectDatabase } from '@/config/database';

// Handle Uncaught Exceptions (synchronous errors that were not caught anywhere)
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  if (err.stack) logger.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  // 1. Connect to Database
  await connectDatabase();

  const port = env.PORT;

  // 2. Start Express App
  const server = app.listen(port, () => {
    logger.info(`Server running in [${env.NODE_ENV}] mode on port ${port}`);
    logger.info(`Health check: http://localhost:${port}/health`);
  });

  // Handle Unhandled Rejections (asynchronous promises that were rejected but not caught)
  process.on('unhandledRejection', (err: any) => {
    logger.error('UNHANDLED REJECTION! Shutting down gracefully...');
    logger.error(`${err?.name || 'Error'}: ${err?.message || err}`);
    
    server.close(async () => {
      await disconnectDatabase();
      process.exit(1);
    });
  });

  // Graceful shutdown on termination signals
  const shutdown = async (signal: string) => {
    logger.info(`Signal received: ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
