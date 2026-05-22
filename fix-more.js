const fs = require('fs');

const filesToFix = [
  'src/controllers/auth.controller.ts',
  'src/controllers/user.controller.ts',
  'src/middlewares/error.middleware.ts',
  'src/routes/auth.route.ts',
  'src/routes/user.route.ts',
  'src/services/auth.service.ts',
  'src/services/user.service.ts'
];

const fixes = [
  [/from '\.\/auth\.service'/g, "from '@/services/auth.service'"],
  [/from '\.\/user\.service'/g, "from '@/services/user.service'"],
  [/from '\.\/auth\.controller'/g, "from '@/controllers/auth.controller'"],
  [/from '\.\/user\.controller'/g, "from '@/controllers/user.controller'"],
  [/from '\.\/auth\.validation'/g, "from '@/validators/auth.validator'"],
  [/from '\.\/user\.validation'/g, "from '@/validators/user.validator'"],
  [/from '\.\.\/\.\.\/common\/helpers\/response'/g, "from '@/utils/api-response'"],
  [/from '\.\.\/common\/helpers\/response'/g, "from '@/utils/api-response'"],
  [/sendResponse/g, "ApiResponse.success"],
  [/sendErrorResponse/g, "ApiResponse.error"], // Wait, might need manual fixing
  [/from '\.\/auth\.types'/g, "from '@/types/auth.type'"],
  [/from '\.\/user\.types'/g, "from '@/types/user.type'"],
  [/from '\.\.\/\.\.\/common\/types'/g, "from '@/types'"],
];

filesToFix.forEach(file => {
  if(fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    fixes.forEach(([regex, repl]) => {
      content = content.replace(regex, repl);
    });
    fs.writeFileSync(file, content);
  }
});
