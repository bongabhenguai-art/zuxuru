import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {
 id:text('id').primaryKey(),owner:text('owner').notNull(),kind:text('kind').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
}, t=>[index('records_owner_kind_updated').on(t.owner,t.kind,t.updatedAt)]);
