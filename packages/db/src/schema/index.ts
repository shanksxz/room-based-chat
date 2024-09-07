import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  serial,
  integer
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomName: text("roomName").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("roomId")
    .notNull()
    .references(() => rooms.id),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
});

export const userRooms = pgTable(
  "user_rooms",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id),
    roomId: integer("roomId")
      .notNull()
      .references(() => rooms.id),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.roomId),
  }),
);

export const roomsRelations = relations(rooms, ({ many, one }) => ({
  messages: many(messages),
  userRooms: many(userRooms),
  creator: one(users, {
    fields: [rooms.createdBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
}));

export const userRoomsRelations = relations(userRooms, ({ one }) => ({
  user: one(users, {
    fields: [userRooms.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [userRooms.roomId],
    references: [rooms.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  userRooms: many(userRooms),
  createdRooms: many(rooms),
}));
