const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            files = files.concat(walkDir(dirPath));
        } else if (f.endsWith('.ts')) {
            files.push(dirPath);
        }
    });
    return files;
}

const files = walkDir(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all relative imports with @/ (e.g. from '../config/env' to '@/config/env')
    // and also adapt the file names based on our new structure
    
    // First, let's fix relative paths generically (assuming they were correct before)
    // Actually, instead of trying to compute the old path, let's just do a series of replacements
    // since we know what files were moved.
    
    const replacements = [
        [/from\s+['"](?:\.\.\/|\.\/)+config\/(.*?)['"]/g, "from '@/config/$1'"],
        [/from\s+['"](?:\.\.\/|\.\/)+middleware\/(.*?)['"]/g, "from '@/middlewares/$1'"],
        [/from\s+['"](?:\.\.\/|\.\/)+middlewares\/(.*?)['"]/g, "from '@/middlewares/$1'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/auth\/auth\.service['"]/g, "from '@/services/auth.service'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/auth\/auth\.validation['"]/g, "from '@/validators/auth.validator'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/users\/user\.service['"]/g, "from '@/services/user.service'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/users\/user\.validation['"]/g, "from '@/validators/user.validator'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/auth\/auth\.route['"]/g, "from '@/routes/auth.route'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/users\/user\.route['"]/g, "from '@/routes/user.route'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/auth\/auth\.controller['"]/g, "from '@/controllers/auth.controller'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/users\/user\.controller['"]/g, "from '@/controllers/user.controller'"],
        [/from\s+['"](?:\.\.\/|\.\/)+common\/utils\/app-error['"]/g, "from '@/utils/app-error'"],
        [/from\s+['"](?:\.\.\/|\.\/)+common\/helpers\/async-handler['"]/g, "from '@/utils/async-handler'"],
        [/from\s+['"](?:\.\.\/|\.\/)+common\/utils\/api-response['"]/g, "from '@/utils/api-response'"],
        [/from\s+['"](?:\.\.\/|\.\/)+routes['"]/g, "from '@/routes'"],
        [/from\s+['"](?:\.\.\/|\.\/)+routes\/index['"]/g, "from '@/routes'"],
        
        // Let's also fix types if they were referenced
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/auth\/auth\.types['"]/g, "from '@/types/auth.type'"],
        [/from\s+['"](?:\.\.\/|\.\/)+modules\/users\/user\.types['"]/g, "from '@/types/user.type'"],
        
        // Specifically fix src/server.ts and src/app.ts
        [/from\s+['"]\.\/app['"]/g, "from '@/app'"],
    ];

    let newContent = content;
    replacements.forEach(([regex, replacement]) => {
        newContent = newContent.replace(regex, replacement);
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated imports in ${file}`);
    }
});
