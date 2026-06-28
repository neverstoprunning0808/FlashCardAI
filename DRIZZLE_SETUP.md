# Drizzle ORM Setup

This project uses **Drizzle ORM** with **Neon Postgres** for database management.

## Project Structure

```
📦 <project root>
├ 📂 drizzle
├ 📂 src
│  ├ 📂 db
│  │  ├ 📜 schema.ts    # Database schema definitions
│  │  └ 📜 index.ts     # Database connection instance
│  └ 📜 index.ts        # Example CRUD operations
├ 📜 .env
├ 📜 drizzle.config.ts
└ 📜 package.json
```

## Database Connection

The database connection is configured in `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';

export const db = drizzle(process.env.DATABASE_URL!);
```

## Using in Next.js

### In Server Components

```typescript
import { db } from '@/src/db';
import { usersTable } from '@/src/db/schema';

export default async function UsersPage() {
  const users = await db.select().from(usersTable);
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### In API Routes

```typescript
import { db } from '@/src/db';
import { usersTable } from '@/src/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newUser = await db.insert(usersTable).values(body).returning();
  return NextResponse.json(newUser);
}
```

### In Server Actions

```typescript
'use server'

import { db } from '@/src/db';
import { usersTable } from '@/src/db/schema';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const age = parseInt(formData.get('age') as string);

  await db.insert(usersTable).values({ name, email, age });
  revalidatePath('/users');
}
```

## Available Scripts

### Push Schema Changes
```bash
npm run db:push
```
Directly applies schema changes to the database (good for development).

### Generate Migrations
```bash
npm run db:generate
```
Generates migration files based on schema changes.

### Apply Migrations
```bash
npm run db:migrate
```
Applies generated migrations to the database.

### Drizzle Studio
```bash
npm run db:studio
```
Opens Drizzle Studio to browse and manage your database visually.

## Schema Definition

Schemas are defined in `src/db/schema.ts`. Example:

```typescript
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});
```

## Common Operations

### Insert
```typescript
await db.insert(usersTable).values({ name: 'John', age: 30, email: 'john@example.com' });
```

### Select
```typescript
const users = await db.select().from(usersTable);
```

### Update
```typescript
import { eq } from 'drizzle-orm';

await db
  .update(usersTable)
  .set({ age: 31 })
  .where(eq(usersTable.email, 'john@example.com'));
```

### Delete
```typescript
import { eq } from 'drizzle-orm';

await db.delete(usersTable).where(eq(usersTable.email, 'john@example.com'));
```

## Type Inference

Drizzle provides excellent TypeScript support:

```typescript
// Infer insert type
type InsertUser = typeof usersTable.$inferInsert;

// Infer select type
type SelectUser = typeof usersTable.$inferSelect;
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle with Next.js Guide](https://orm.drizzle.team/docs/get-started-postgresql)
