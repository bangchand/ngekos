const fs = require('fs');

const filesToFix = [
  'src/controllers/auth.controller.ts',
  'src/controllers/user.controller.ts',
  'src/middlewares/error.middleware.ts'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix ApiResponse.success(res, statusCode, message, data) -> ApiResponse.success(res, message, data, statusCode)
    content = content.replace(/ApiResponse\.success\(res,\s*(\d+),\s*(['"`].*?['"`]),\s*(.*?)\)/g, 'ApiResponse.success(res, $2, $3, $1)');
    content = content.replace(/ApiResponse\.success\(res,\s*(\d+),\s*(['"`].*?['"`])\)/g, 'ApiResponse.success(res, $2, null, $1)');

    // Fix ApiResponse.error(res, statusCode, message, errors) -> ApiResponse.error(res, message, errors, statusCode)
    content = content.replace(/ApiResponse\.error\(res,\s*(.*?),\s*(.*),\s*(.*?)\)/g, 'ApiResponse.error(res, $2, $3, $1)');
    // Specifically fix error.middleware.ts
    if (file.includes('error.middleware.ts')) {
        content = content.replace(/ApiResponse\.error\(\s*res,\s*500,\s*'Something went very wrong',\s*null\s*\)/g, "ApiResponse.error(res, 'Something went very wrong', null, 500)");
    }
    
    fs.writeFileSync(file, content);
  }
});
