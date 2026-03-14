import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ticker: text("ticker"),
  cik: text("cik"),
  sector: text("sector"),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const folders = sqliteTable("folders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const folderCompanies = sqliteTable("folder_companies", {
  folderId: integer("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  folderId: integer("folder_id").references(() => folders.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull().default("custom"),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  sourceUrl: text("source_url"),
  filingDate: text("filing_date"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const chatThreads = sqliteTable("chat_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  folderId: integer("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id")
    .notNull()
    .references(() => chatThreads.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  highlightedText: text("highlighted_text"),
  documentId: integer("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  folderId: integer("folder_id")
    .notNull()
    .references(() => folders.id, { onDelete: "cascade" }),
  documentId: integer("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  documents: many(documents),
  folderCompanies: many(folderCompanies),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  documents: many(documents),
  chatThreads: many(chatThreads),
  notes: many(notes),
  folderCompanies: many(folderCompanies),
}));

export const folderCompaniesRelations = relations(
  folderCompanies,
  ({ one }) => ({
    folder: one(folders, {
      fields: [folderCompanies.folderId],
      references: [folders.id],
    }),
    company: one(companies, {
      fields: [folderCompanies.companyId],
      references: [companies.id],
    }),
  })
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  folder: one(folders, {
    fields: [documents.folderId],
    references: [folders.id],
  }),
  chatThreads: many(chatThreads),
  chatMessages: many(chatMessages),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  document: one(documents, {
    fields: [chatThreads.documentId],
    references: [documents.id],
  }),
  folder: one(folders, {
    fields: [chatThreads.folderId],
    references: [folders.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
  document: one(documents, {
    fields: [chatMessages.documentId],
    references: [documents.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  folder: one(folders, {
    fields: [notes.folderId],
    references: [folders.id],
  }),
  document: one(documents, {
    fields: [notes.documentId],
    references: [documents.id],
  }),
}));
