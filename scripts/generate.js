#!/usr/bin/env node

/**
 * =====================================================
 *  Express TS Boilerplate — Resource Generator CLI
 * =====================================================
 *
 *  Interactive mode (default):
 *    npm run generate
 *    node scripts/generate.js
 *
 *  Flag mode (non-interactive):
 *    node scripts/generate.js --name=Product
 *    node scripts/generate.js --name=Product --no-public --no-owner --roles=OWNER,ADMIN
 *
 *  Options:
 *    --name=<Name>          Resource name (required in flag mode)
 *    --files=c,s,r,t,v,p   Files: c=controller s=service r=route t=type v=validator p=prisma
 *                           Default: all
 *    --pagination           Use PrismaQueryBuilder (default: yes)
 *    --no-pagination        Disable PrismaQueryBuilder
 *    --owner                Add ownership check (default: no)
 *    --no-owner             Disable ownership check (default)
 *    --public               Generate public routes (default: yes)
 *    --no-public            No public routes
 *    --auth                 Use protect + restrictTo (default: yes)
 *    --no-auth              No auth middleware
 *    --roles=OWNER,ADMIN    Roles for restrictTo (default: OWNER,ADMIN)
 *    --overwrite            Overwrite existing files (default: no)
 *    --no-overwrite         Skip existing files (default)
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ─── Colors ───────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toPascalCase = (str) =>
  str.replace(/(^\w|[-_\s]\w)/g, (m) => m.replace(/[-_\s]/, '').toUpperCase());

const toCamelCase = (str) => {
  const p = toPascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
};

const toKebabCase = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const pluralize = (str) => {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (['s', 'x', 'z'].some((e) => str.endsWith(e))) return str + 'es';
  return str + 's';
};

const ROOT = path.resolve(__dirname, '..');

function writeFile(filePath, content, overwrite) {
  if (fs.existsSync(filePath) && !overwrite) {
    console.log(`  ${c.yellow}⚠  Skipped${c.reset} (exists): ${c.dim}${path.relative(ROOT, filePath)}${c.reset}`);
    return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ${c.green}✔  Created${c.reset}  ${c.dim}${path.relative(ROOT, filePath)}${c.reset}`);
  return true;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function genController({ Name, name, camelName, kebabName, hasOwner, hasPagination }) {
  const ownerIdLine = hasOwner ? `\n    const ownerId = req.user!.id;` : '';
  const userRoleLine = hasOwner ? `\n    const userRole = req.user!.role;` : '';
  const ownerArg = hasOwner ? ', ownerId' : '';
  const deleteOwnerArgs = hasOwner ? ', ownerId, userRole' : '';

  return `import { Request, Response } from 'express';
import { ${Name}Service } from '@/services/${kebabName}.service';
import { ApiResponse } from '@/utils/api-response';${hasPagination ? `\nimport { PrismaQueryBuilder } from 'prisma-query-parser';` : ''}

export class ${Name}Controller {
  /**
   * Get all ${name}s
   */
  public static get${Name}s = async (req: Request, res: Response): Promise<void> => {${
    hasPagination
      ? `
    const builder = new PrismaQueryBuilder(req.query);
    const queryOptions = builder.build();

    const { data, total } = await ${Name}Service.get${Name}s(queryOptions);

    ApiResponse.success(res, 'Berhasil mengambil daftar ${name}', data, 200, builder.getMeta(total, data.length));`
      : `
    const { data, total } = await ${Name}Service.get${Name}s();
    ApiResponse.success(res, 'Berhasil mengambil daftar ${name}', data, 200);`
  }
  };

  /**
   * Get a single ${Name} by ID
   */
  public static get${Name}ById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const ${camelName} = await ${Name}Service.get${Name}ById(id);
    ApiResponse.success(res, 'Berhasil mengambil data ${name}', ${camelName}, 200);
  };

  /**
   * Create a new ${Name}
   */
  public static create${Name} = async (req: Request, res: Response): Promise<void> => {${ownerIdLine}
    const new${Name} = await ${Name}Service.create${Name}(${hasOwner ? 'ownerId, ' : ''}req.body);
    ApiResponse.success(res, 'Berhasil membuat ${name} baru', new${Name}, 201);
  };

  /**
   * Update an existing ${Name}
   */
  public static update${Name} = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;${ownerIdLine}
    const updated${Name} = await ${Name}Service.update${Name}(id${ownerArg}, req.body);
    ApiResponse.success(res, 'Berhasil memperbarui data ${name}', updated${Name}, 200);
  };

  /**
   * Delete a ${Name}
   */
  public static delete${Name} = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;${hasOwner ? ownerIdLine + userRoleLine : ''}
    await ${Name}Service.delete${Name}(id${deleteOwnerArgs});
    ApiResponse.success(res, 'Berhasil menghapus ${name}', null, 200);
  };
}
`;
}

function genService({ Name, name, camelName, kebabName, hasOwner }) {
  const ownerCheck = hasOwner
    ? `
    if (${camelName}.ownerId !== ownerId) {
      throw new AppError('Kamu tidak memiliki izin untuk mengubah ${Name} ini', 403);
    }`
    : '';

  const deleteOwnerCheck = hasOwner
    ? `
    if (${camelName}.ownerId !== ownerId && userRole !== 'ADMIN') {
      throw new AppError('Kamu tidak memiliki izin untuk menghapus ${Name} ini', 403);
    }`
    : '';

  const createArgs = hasOwner ? `ownerId: string, input: Create${Name}Input` : `input: Create${Name}Input`;
  const createData = hasOwner ? `...input, ownerId,` : `...input,`;
  const updateArgs = hasOwner ? `id: string, ownerId: string, input: Update${Name}Input` : `id: string, input: Update${Name}Input`;
  const deleteArgs = hasOwner ? `id: string, ownerId: string, userRole: string` : `id: string`;

  return `import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { Create${Name}Input, Update${Name}Input } from '@/types/${kebabName}.type';
import { ${Name} } from '@prisma/client';

export class ${Name}Service {
  /**
   * Retrieves all ${name}s
   */
  public static async get${Name}s(queryOptions: any = {}): Promise<{ data: ${Name}[], total: number }> {
    const data = await prisma.${camelName}.findMany(queryOptions);
    const total = await prisma.${camelName}.count({ where: queryOptions.where });
    return { data, total };
  }

  /**
   * Retrieves a single ${name} by ID
   */
  public static async get${Name}ById(id: string): Promise<${Name}> {
    const ${camelName} = await prisma.${camelName}.findUnique({
      where: { id },
    });

    if (!${camelName}) {
      throw new AppError('${Name} tidak ditemukan', 404);
    }

    return ${camelName};
  }

  /**
   * Creates a new ${name}
   */
  public static async create${Name}(${createArgs}): Promise<${Name}> {
    return prisma.${camelName}.create({
      data: {
        ${createData}
      },
    });
  }

  /**
   * Updates an existing ${name}
   */
  public static async update${Name}(${updateArgs}): Promise<${Name}> {
    const ${camelName} = await prisma.${camelName}.findUnique({ where: { id } });

    if (!${camelName}) {
      throw new AppError('${Name} tidak ditemukan', 404);
    }
${ownerCheck}
    return prisma.${camelName}.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Deletes a ${name}
   */
  public static async delete${Name}(${deleteArgs}): Promise<void> {
    const ${camelName} = await prisma.${camelName}.findUnique({ where: { id } });

    if (!${camelName}) {
      throw new AppError('${Name} tidak ditemukan', 404);
    }
${deleteOwnerCheck}
    await prisma.${camelName}.delete({
      where: { id },
    });
  }
}
`;
}

function genRoute({ Name, camelName, kebabName, camelNames, isPublic, hasAuth, roles }) {
  const rolesStr = roles.map((r) => `'${r}'`).join(', ');

  return `import { Router } from 'express';
import { ${Name}Controller } from '@/controllers/${kebabName}.controller';
import { validate } from '@/middlewares/validate.middleware';
import {
  create${Name}Schema,
  update${Name}Schema,
  get${Name}ByIdSchema,
} from '@/validators/${kebabName}.validator';
import { protect, restrictTo } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/async-handler';

${isPublic ? `const routerPublic = Router();\n` : ''}const routerPrivate = Router();

${
  isPublic
    ? `// Public routes (no auth required)
routerPublic.get('/', asyncHandler(${Name}Controller.get${Name}s));
routerPublic.get('/:id', validate(get${Name}ByIdSchema), asyncHandler(${Name}Controller.get${Name}ById));

`
    : ''
}${hasAuth ? `routerPrivate.use(protect);\nrouterPrivate.use(restrictTo(${rolesStr}));\n\n` : ''}// Private routes
routerPrivate.get('/', asyncHandler(${Name}Controller.get${Name}s));
routerPrivate.post('/', validate(create${Name}Schema), asyncHandler(${Name}Controller.create${Name}));
routerPrivate.put('/:id', validate(update${Name}Schema), asyncHandler(${Name}Controller.update${Name}));
routerPrivate.delete('/:id', validate(get${Name}ByIdSchema), asyncHandler(${Name}Controller.delete${Name}));

export const ${camelName}Router = { ${isPublic ? 'routerPublic, ' : ''}routerPrivate };
`;
}

function genType({ Name, kebabName }) {
  return `import { ${Name} } from '@prisma/client';

export type Create${Name}Input = Omit<${Name}, 'id' | 'createdAt' | 'updatedAt'>;
export type Update${Name}Input = Partial<Create${Name}Input>;
`;
}

function genValidator({ Name }) {
  return `import { z } from 'zod';

export const create${Name}Schema = z.object({
  body: z.object({
    // TODO: tambahkan field sesuai model ${Name}
    name: z.string().min(1, 'Name is required'),
  }),
});

export const update${Name}Schema = z.object({
  body: z.object({
    // TODO: tambahkan field sesuai model ${Name}
    name: z.string().min(1).optional(),
  }),
});

export const get${Name}ByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ${Name} ID format'),
  }),
});
`;
}

function genPrismaSchema({ Name, camelName }) {
  return `model ${Name} {
  id String @id @default(uuid())

  // TODO: tambahkan field di sini

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("${pluralize(camelName)}")
}
`;
}

// ─── Post-generation hints ────────────────────────────────────────────────────

function printNextSteps({ selectedFiles, Name, camelName, camelNames, kebabName }) {
  console.log(`\n${c.bold}${c.yellow}📋 Next steps:${c.reset}\n`);

  if (selectedFiles.includes('route')) {
    console.log(`  ${c.cyan}[routes/index.ts]${c.reset} Tambahkan:
    ${c.dim}import { ${camelName}Router } from '@/routes/${kebabName}.route';
    publicRoutes.use('/${camelNames}', ${camelName}Router.routerPublic);   // jika ada public
    protectedRoutes.use('/${camelNames}', ${camelName}Router.routerPrivate);${c.reset}
`);
  }

  if (selectedFiles.includes('prisma')) {
    console.log(`  ${c.cyan}[prisma/schema/${kebabName}.prisma]${c.reset} Tambahkan field model, lalu:`);
    console.log(`    ${c.dim}npm run prisma:migrate${c.reset}`);
    console.log(`    ${c.dim}npm run prisma:generate${c.reset}\n`);
  }

  if (selectedFiles.includes('validator')) {
    console.log(`  ${c.cyan}[validators/${kebabName}.validator.ts]${c.reset} Sesuaikan schema Zod.`);
  }

  if (selectedFiles.includes('type')) {
    console.log(`  ${c.cyan}[types/${kebabName}.type.ts]${c.reset} Sesuaikan Omit<> field.\n`);
  }
}

// ─── Parse CLI flags ──────────────────────────────────────────────────────────

function parseFlags(args) {
  const flags = {};
  for (const arg of args) {
    if (arg.startsWith('--no-')) {
      flags[arg.slice(5)] = false;
    } else if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      flags[key] = val !== undefined ? val : true;
    }
  }
  return flags;
}

// ─── Interactive mode ─────────────────────────────────────────────────────────

function createRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

const ask = (rl, question) => new Promise((resolve) => rl.question(question, resolve));

async function promptText(rl, question, defaultVal = '') {
  const hint = defaultVal ? ` ${c.dim}(${defaultVal})${c.reset}` : '';
  const answer = await ask(rl, `${question}${hint}: `);
  return answer.trim() || defaultVal;
}

async function promptYN(rl, question, defaultVal = true) {
  const hint = defaultVal ? 'Y/n' : 'y/N';
  const answer = await ask(rl, `${question} ${c.dim}[${hint}]${c.reset}: `);
  if (!answer.trim()) return defaultVal;
  return answer.trim().toLowerCase().startsWith('y');
}

async function promptMultiSelect(rl, question, options, defaultAll = true) {
  console.log(`\n${question} ${c.dim}(pisahkan dengan koma, Enter=semua)${c.reset}`);
  options.forEach((opt, i) => console.log(`  ${c.cyan}${i + 1}${c.reset}) ${opt}`));
  const answer = await ask(rl, `  Pilihan: `);
  if (!answer.trim()) return defaultAll ? options.slice() : [];
  return answer
    .split(',')
    .map((n) => parseInt(n.trim()) - 1)
    .filter((i) => i >= 0 && i < options.length)
    .map((i) => options[i]);
}

async function promptCheckboxRoles(rl, question, options) {
  console.log(`\n${question} ${c.dim}(pisahkan dengan koma, Enter=semua)${c.reset}`);
  options.forEach((opt, i) => console.log(`  ${c.cyan}${i + 1}${c.reset}) ${opt}`));
  const answer = await ask(rl, `  Pilihan: `);
  if (!answer.trim()) return options.slice();
  return answer
    .split(',')
    .map((n) => parseInt(n.trim()) - 1)
    .filter((i) => i >= 0 && i < options.length)
    .map((i) => options[i]);
}

const FILE_LABELS = ['Controller', 'Service', 'Route', 'Type', 'Validator', 'Prisma Schema'];
const FILE_KEYS = ['controller', 'service', 'route', 'type', 'validator', 'prisma'];

async function runInteractive() {
  const rl = createRL();

  console.log(`
${c.bold}${c.cyan}╔═══════════════════════════════════════════╗
║   Express TS Boilerplate — Generator CLI  ║
╚═══════════════════════════════════════════╝${c.reset}
`);

  const rawName = await promptText(rl, `${c.bold}Nama resource${c.reset} ${c.dim}(contoh: Product, KostCategory)${c.reset}`);
  if (!rawName) {
    console.log(`${c.red}❌ Nama resource wajib diisi.${c.reset}`);
    rl.close();
    return;
  }

  const Name = toPascalCase(rawName);
  const camelName = toCamelCase(Name);
  const kebabName = toKebabCase(Name);
  const camelNames = pluralize(camelName);

  console.log(`\n${c.dim}→ Nama yang akan digunakan:${c.reset}`);
  console.log(`  PascalCase : ${c.green}${Name}${c.reset}`);
  console.log(`  camelCase  : ${c.green}${camelName}${c.reset}`);
  console.log(`  kebab-case : ${c.green}${kebabName}${c.reset}`);

  // File selection
  const selectedLabels = await promptMultiSelect(
    rl,
    `\n${c.bold}File apa saja yang mau di-generate?${c.reset}`,
    FILE_LABELS
  );
  const selectedFiles = selectedLabels.map((l) => FILE_KEYS[FILE_LABELS.indexOf(l)]);

  const hasPagination = await promptYN(rl, `\n${c.bold}Pakai PrismaQueryBuilder${c.reset} (pagination/filter)?`, true);
  const hasOwner = await promptYN(rl, `${c.bold}Ada ownershipCheck${c.reset} (cek ownerId)?`, false);

  let isPublic = false;
  let hasAuth = true;
  let roles = ['OWNER', 'ADMIN'];

  if (selectedFiles.includes('route')) {
    isPublic = await promptYN(rl, `${c.bold}Ada public routes${c.reset} (GET tanpa auth)?`, true);
    hasAuth = await promptYN(rl, `${c.bold}Pakai protect + restrictTo${c.reset}?`, true);
    if (hasAuth) {
      roles = await promptCheckboxRoles(rl, `${c.bold}Role yang diizinkan${c.reset}:`, ['OWNER', 'ADMIN', 'USER']);
      if (roles.length === 0) roles = ['OWNER', 'ADMIN', 'USER'];
    }
  }

  const overwrite = await promptYN(rl, `\n${c.bold}Overwrite${c.reset} jika file sudah ada?`, false);

  rl.close();

  run({ Name, camelName, kebabName, camelNames, selectedFiles, hasPagination, hasOwner, isPublic, hasAuth, roles, overwrite });
}

// ─── Flag mode ────────────────────────────────────────────────────────────────

function runFlagMode(flags) {
  const rawName = flags.name;
  if (!rawName) {
    console.log(`${c.red}❌ --name=<ResourceName> wajib diisi.${c.reset}`);
    console.log(`   Contoh: ${c.dim}node scripts/generate.js --name=Product${c.reset}`);
    process.exit(1);
  }

  const Name = toPascalCase(rawName);
  const camelName = toCamelCase(Name);
  const kebabName = toKebabCase(Name);
  const camelNames = pluralize(camelName);

  // Parse --files=c,s,r,t,v,p  (shorthand) or default all
  let selectedFiles = FILE_KEYS.slice();
  if (flags.files && flags.files !== true) {
    const shortMap = { c: 'controller', s: 'service', r: 'route', t: 'type', v: 'validator', p: 'prisma' };
    selectedFiles = flags.files
      .split(',')
      .map((f) => shortMap[f.trim()] || f.trim())
      .filter((f) => FILE_KEYS.includes(f));
  }

  const hasPagination = flags.pagination !== false;
  const hasOwner = flags.owner === true;
  const isPublic = flags.public !== false;
  const hasAuth = flags.auth !== false;
  const roles = flags.roles
    ? String(flags.roles).split(',').map((r) => r.trim().toUpperCase())
    : ['OWNER', 'ADMIN'];
  const overwrite = flags.overwrite === true;

  console.log(`
${c.bold}${c.cyan}╔═══════════════════════════════════════════╗
║   Express TS Boilerplate — Generator CLI  ║
╚═══════════════════════════════════════════╝${c.reset}

${c.dim}Mode: Flag (non-interactive)${c.reset}
`);

  run({ Name, camelName, kebabName, camelNames, selectedFiles, hasPagination, hasOwner, isPublic, hasAuth, roles, overwrite });
}

// ─── Core generation ──────────────────────────────────────────────────────────

function run({ Name, camelName, kebabName, camelNames, selectedFiles, hasPagination, hasOwner, isPublic, hasAuth, roles, overwrite }) {
  const ctx = { Name, name: camelName, camelName, camelNames, kebabName, hasOwner, hasPagination, isPublic, hasAuth, roles };

  console.log(`\n${c.bold}${c.magenta}⚡ Generating files for ${c.cyan}${Name}${c.magenta}...${c.reset}\n`);

  if (selectedFiles.includes('controller'))
    writeFile(path.join(ROOT, 'src/controllers', `${kebabName}.controller.ts`), genController(ctx), overwrite);

  if (selectedFiles.includes('service'))
    writeFile(path.join(ROOT, 'src/services', `${kebabName}.service.ts`), genService(ctx), overwrite);

  if (selectedFiles.includes('route'))
    writeFile(path.join(ROOT, 'src/routes', `${kebabName}.route.ts`), genRoute(ctx), overwrite);

  if (selectedFiles.includes('type'))
    writeFile(path.join(ROOT, 'src/types', `${kebabName}.type.ts`), genType(ctx), overwrite);

  if (selectedFiles.includes('validator'))
    writeFile(path.join(ROOT, 'src/validators', `${kebabName}.validator.ts`), genValidator(ctx), overwrite);

  if (selectedFiles.includes('prisma'))
    writeFile(path.join(ROOT, 'prisma/schema', `${kebabName}.prisma`), genPrismaSchema(ctx), overwrite);

  printNextSteps({ selectedFiles, Name, camelName, camelNames, kebabName });
  console.log(`${c.bold}${c.green}✅ Done!${c.reset}\n`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = parseFlags(args);

if (flags.name) {
  runFlagMode(flags);
} else {
  runInteractive().catch((err) => {
    console.error(`${c.red}Error: ${err.message}${c.reset}`);
    process.exit(1);
  });
}
