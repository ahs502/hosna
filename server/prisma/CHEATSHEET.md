## After Prisma, before getting into migrations

Create the initial migration based on the `prisma` schema folder:

```sh
$ mkdir -p prisma/migrations/00000000000000_init
$ npx prisma migrate diff --from-empty --to-schema-datamodel prisma --script > prisma/migrations/00000000000000_init/migration.sql
```

Review the generated migration, then mark it as _"applied"_ without actually applying it:

```sh
$ npx prisma migrate resolve --applied 00000000000000_init
```

## During development

For every change create a migration:

```sh
$ npx prisma format && npx prisma migrate dev --name <migration-name>
```

If you want to manually change the migration file before applying it into the database, first:

```sh
$ npx prisma migrate dev --name <migration-name> --create-only
```

Then, manipulate the generated migration file, and finally apply it:

```sh
$ npx prisma migrate dev
```

> If you had touched some migration file manually and now Prisma wants to reset the database (because it can not count on the database schema anymore), follow [this tutorial](https://echobind.com/post/make-prisma-ignore-a-migration-change) to manually fix the **migration hash code** in the database.

## After development, before deployment

Merge all cluttered development migrations into one:

```sh
$ ./scripts/merge-prisma-migrations-in-development.cjs <number-of-migrations-to-merge> <name-of-the-merged-migration>
```

## During deployment

Apply all pending migrations to **production** database:

```sh
$ npx prisma migrate deploy
```

## For production, after deployment

Follow [this link](https://www.prisma.io/docs/orm/prisma-migrate/workflows/squashing-migrations) to clean up migrations by squashing them.

> NOTE: We may need a script to automate this, we'll get to that later when we wanted to do so.
