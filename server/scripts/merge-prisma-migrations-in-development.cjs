#!/usr/bin/env node

const childProcess = require('child_process')
const fsExtra = require('fs-extra')
const path = require('path')
const { PrismaClient } = require('../src/prisma/generated-client')

const SHADOW_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/shadow-db'
const NUMBER_OF_LEADING_DIGITS_IN_MIGRATION_NAME = 4 + 2 + 2 + 2 + 2 + 2

void (async () => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    const [node, script, countString, name] = process.argv

    if (!countString || Number.isNaN(Number(countString)) || Number(countString) < 1 || !name)
      throw Error(`
Call it like this:

    $ ./${__filename.slice(__dirname.length + 1)} <number-of-migrations-to-merge> <name-of-the-merged-migration>

`)

    const count = Number(countString)

    const serverPath = path.join(__dirname, '..')
    const prismaPath = path.join(serverPath, 'prisma')
    const prismaSchemaPath = prismaPath
    const prismaMigrationsPath = path.join(prismaPath, 'migrations')

    // Read migrations from local files:
    const allMigrationNames = fsExtra
      .readdirSync(prismaMigrationsPath, { encoding: 'utf-8', recursive: false })
      .filter(item => new RegExp(`^\\d{${NUMBER_OF_LEADING_DIGITS_IN_MIGRATION_NAME}}_`).test(item))
      .sort((first, second) => (first > second ? +1 : first < second ? -1 : 0))
    const remainingMigrationNames = allMigrationNames.slice(0, -count)
    const migrationNamesToMerge = allMigrationNames.slice(-count)
    if (remainingMigrationNames.length <= 0) throw Error('Not enough migrations.')

    // Resolve the migrations back into the database in the case of script failure:
    // migrationNamesToMerge.forEach(migrationName => {
    //   childProcess.execSync(`npx prisma migrate resolve --applied ${migrationName}`, {
    //     cwd: serverPath,
    //     encoding: 'utf8',
    //     stdio: 'ignore',
    //   })
    // })
    // process.exit(0)

    // Read migrations from database:
    const databaseMigrations =
      await prismaClient.$queryRaw`SELECT * FROM _prisma_migrations ORDER BY migration_name ASC`
    const databaseMigrationNames = databaseMigrations.map(databaseMigration => databaseMigration['migration_name'])
    if (databaseMigrationNames.slice(-count).join(',') !== migrationNamesToMerge.join(','))
      throw Error("Migrations in database don't match the code base.")

    // Delete merging migrations from database:
    await prismaClient.$queryRawUnsafe(
      `DELETE FROM _prisma_migrations WHERE migration_name IN (${migrationNamesToMerge.map(migrationName => `'${migrationName}'`).join(', ')})`
    )

    // Backup merging migrations from local files:
    const prismaMergedMigrationsPath = path.join(prismaPath, '__merged-migrations-to-consider-warnings__')
    fsExtra.emptyDirSync(prismaMergedMigrationsPath) // It also creates the directory if it doesn't exist.
    for (const migrationName of migrationNamesToMerge) {
      const migrationPath = path.join(prismaMigrationsPath, migrationName)
      const movedMigrationPath = path.join(prismaMergedMigrationsPath, migrationName)
      fsExtra.rmSync(movedMigrationPath, { force: true, recursive: true })
      fsExtra.renameSync(migrationPath, movedMigrationPath)
    }

    // Compose merged migration name and path:
    const lastRemainingMigrationName = remainingMigrationNames[remainingMigrationNames.length - 1]
    const mergedMigrationName = `${String(
      BigInt(lastRemainingMigrationName.slice(0, NUMBER_OF_LEADING_DIGITS_IN_MIGRATION_NAME)) + BigInt(1)
    ).padStart(NUMBER_OF_LEADING_DIGITS_IN_MIGRATION_NAME, '0')}_${name}`
    const mergedMigrationPath = path.join(prismaMigrationsPath, mergedMigrationName)
    // fsExtra.mkdirSync(mergedMigrationPath, { recursive: true }) // prisma migrate diff will create the directory for us, this line will break the script if the directory already exists.
    const mergedMigrationMigrationPath = path.join(mergedMigrationPath, 'migration.sql')

    // Extract merged migration script into local files:
    childProcess.execSync(
      `npx prisma migrate diff --from-migrations=${path.relative(serverPath, prismaMigrationsPath).replace(/\\/g, '/')} --to-schema-datamodel=${path.relative(serverPath, prismaSchemaPath).replace(/\\/g, '/')} --shadow-database-url="${SHADOW_DATABASE_URL}" --script --output="${path.relative(serverPath, mergedMigrationMigrationPath).replace(/\\/g, '/')}"`,
      {
        cwd: serverPath,
        encoding: 'utf8',
        stdio: 'ignore',
      }
    )

    // Resolve new migration into the database:
    childProcess.execSync(`npx prisma migrate resolve --applied ${mergedMigrationName}`, {
      cwd: serverPath,
      encoding: 'utf8',
      stdio: 'ignore',
    })

    console.log(`>> Successfully merged ${count} migrations into "${mergedMigrationName}"!`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prismaClient.$disconnect()
  }
})()
