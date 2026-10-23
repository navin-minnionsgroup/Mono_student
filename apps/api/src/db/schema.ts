
import {
  mysqlTable,
  int,
  varchar,
  mysqlEnum,
  timestamp,
} from "drizzle-orm/mysql-core";

export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  age: int("age", { unsigned: true }),

  gender: mysqlEnum("gender", [
    "Male",
    "Female",
    "Other",
  ]),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  phoneNo: varchar("phone_no", { length: 20 }),

  address: varchar("address", { length: 500 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),

  studentId: int("student_id")
    .notNull()
    .references(() => students.id),

  txnid: varchar("txnid", { length: 50 }).notNull().unique(),
  amount: varchar("amount", { length: 12 }).notNull(),

  status: mysqlEnum("status", [
    "pending",
    "success",
    "failed",
  ])
    .notNull()
    .default("pending"),

  mihpayid: varchar("mihpayid", { length: 100 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});