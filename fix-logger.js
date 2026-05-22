const fs = require('fs');

const updateFile = (file, fixes) => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if logger is already imported
    if (!content.includes('import { logger }')) {
        content = "import { logger } from '@/utils/logger';\n" + content;
    }
    
    fixes.forEach(([find, replace]) => {
        content = content.replace(find, replace);
    });
    
    fs.writeFileSync(file, content);
};

// 1. Update database.ts
updateFile('src/config/database.ts', [
    [/console\.log\('Database connection established successfully'\);/g, "logger.info('Database connection established successfully');"],
    [/console\.error\('Database connection failed:', error\);/g, "logger.error('Database connection failed:', { error });"],
    [/console\.log\('Database disconnected successfully'\);/g, "logger.info('Database disconnected successfully');"]
]);

// 2. Update server.ts
updateFile('src/server.ts', [
    [/console\.error\('UNCAUGHT EXCEPTION! Shutting down\.\.\.'\);/g, "logger.error('UNCAUGHT EXCEPTION! Shutting down...');"],
    [/console\.error\(err\.name, err\.message\);/g, "logger.error(`${err.name}: ${err.message}`);"],
    [/if \(err\.stack\) console\.error\(err\.stack\);/g, "if (err.stack) logger.error(err.stack);"],
    [/console\.log\(`Server running in \[\$\{env\.NODE_ENV\}\] mode on port \$\{port\}`\);/g, "logger.info(`Server running in [${env.NODE_ENV}] mode on port ${port}`);"],
    [/console\.log\(`Health check: http:\/\/localhost:\$\{port\}\/health`\);/g, "logger.info(`Health check: http://localhost:${port}/health`);"],
    [/console\.error\('UNHANDLED REJECTION! Shutting down gracefully\.\.\.'\);/g, "logger.error('UNHANDLED REJECTION! Shutting down gracefully...');"],
    [/console\.error\(err\?\.name \|\| 'Error', err\?\.message \|\| err\);/g, "logger.error(`${err?.name || 'Error'}: ${err?.message || err}`);"],
    [/console\.log\(`Signal received: \$\{signal\}\. Shutting down gracefully\.\.\.`\);/g, "logger.info(`Signal received: ${signal}. Shutting down gracefully...`);"],
    [/console\.log\('Server process terminated\.'\);/g, "logger.info('Server process terminated.');"]
]);

