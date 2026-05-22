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

updateFile('src/app.ts', [
    [
        `if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}`,
        `const morganFormat = env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: { write: (message) => logger.http(message.trim()) } }));`
    ]
]);
