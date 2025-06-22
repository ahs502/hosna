import path from 'path'
import type { PrismaConfig } from 'prisma'

import 'dotenv/config' // Prisma skips loading .env file when it detects this prisma.config.ts file, so we need to load it manually here.

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma'),
} satisfies PrismaConfig
