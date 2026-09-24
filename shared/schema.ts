import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const faultRecords = pgTable("fault_records", {
  id: serial("id").primaryKey(),
  faultNumber: text("fault_number"),
  dateReported: timestamp("date_reported").notNull(),
  timeReported: text("time_reported").notNull(),
  location: text("location").notNull(),
  equipmentType: text("equipment_type").notNull(),
  equipmentNumber: text("equipment_number").notNull(),
  equipmentClassification: text("equipment_classification").notNull(),
  faultReporter: text("fault_reporter").notNull(),
  faultDescription: text("fault_description").notNull(),
  workDone: text("work_done"),
  correctedBy: text("corrected_by"),
  dateOfWorkDone: timestamp("date_of_work_done"),
  timeToRepair: real("time_to_repair"),
  downTime: real("down_time"),
  relevantState: text("relevant_state"),
  comments: text("comments"),
  createdBy: text("created_by").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const autoCompleteItems = pgTable("auto_complete_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  value: text("value").notNull(),
  usage_count: integer("usage_count").notNull().default(0),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertFaultRecordSchema = createInsertSchema(faultRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutoCompleteItemSchema = createInsertSchema(autoCompleteItems).omit({
  id: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FaultRecord = typeof faultRecords.$inferSelect;
export type InsertFaultRecord = z.infer<typeof insertFaultRecordSchema>;
export type AutoCompleteItem = typeof autoCompleteItems.$inferSelect;
export type InsertAutoCompleteItem = z.infer<typeof insertAutoCompleteItemSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Additional schemas for forms
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateFaultStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  workDone: z.string().optional(),
  correctedBy: z.string().optional(),
  dateOfWorkDone: z.string().optional(),
  timeToRepair: z.number().optional(),
  downTime: z.number().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateFaultStatusRequest = z.infer<typeof updateFaultStatusSchema>;
