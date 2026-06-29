import { sql } from "drizzle-orm";
import {
  text,
  integer,
  real,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";

// ─── Weddings ─────────────────────────────────────────────────────────────────
// One per couple. All data hangs off this.
export const weddings = sqliteTable("weddings", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  partnerAName: text("partner_a_name").notNull(),
  partnerBName: text("partner_b_name").notNull(),
  weddingDate: text("wedding_date"), // ISO date string
  venue: text("venue"),
  city: text("city"),
  timezone: text("timezone").default("America/New_York"),
  websiteSlug: text("website_slug").unique(), // for the public RSVP site
  websitePublished: integer("website_published", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── Guest Groups ─────────────────────────────────────────────────────────────
// A group = a household / family unit that gets ONE invitation.
// This is the level at which you track "how many invites sent."
// TheKnot gets this wrong — they track individuals and lose the family count.
export const guestGroups = sqliteTable(
  "guest_groups",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "The Johnson Family"
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    zip: text("zip"),
    country: text("country").default("US"),
    invitationSent: integer("invitation_sent", { mode: "boolean" }).default(false),
    saveTheDateSent: integer("save_the_date_sent", { mode: "boolean" }).default(false),
    side: text("side", { enum: ["partner_a", "partner_b", "shared"] }).default("shared"),
    table: text("table"), // seating table assignment
    notes: text("notes"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    weddingIdx: index("guest_groups_wedding_idx").on(t.weddingId),
  })
);

// ─── Guests (Individuals within a group) ─────────────────────────────────────
// Each person in a group. RSVP tracked at the individual level
// so you know who's coming, what they're eating, accessibility needs, etc.
export const guests = sqliteTable(
  "guests",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => guestGroups.id, { onDelete: "cascade" }),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    rsvpStatus: text("rsvp_status", {
      enum: ["pending", "attending", "declined", "maybe"],
    }).default("pending"),
    mealChoice: text("meal_choice"), // e.g. "chicken", "fish", "vegetarian", "vegan"
    dietaryRestrictions: text("dietary_restrictions"),
    isChild: integer("is_child", { mode: "boolean" }).default(false),
    isPlusOne: integer("is_plus_one", { mode: "boolean" }).default(false),
    plusOneAllowed: integer("plus_one_allowed", { mode: "boolean" }).default(false),
    accessibilityNeeds: text("accessibility_needs"),
    shirtSize: text("shirt_size"), // for wedding party
    role: text("role", {
      enum: ["guest", "wedding_party", "family", "vendor", "officiant"],
    }).default("guest"),
    notes: text("notes"),
    rsvpRespondedAt: text("rsvp_responded_at"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    weddingIdx: index("guests_wedding_idx").on(t.weddingId),
    groupIdx: index("guests_group_idx").on(t.groupId),
    rsvpIdx: index("guests_rsvp_idx").on(t.rsvpStatus),
  })
);

// ─── Budget Categories ────────────────────────────────────────────────────────
export const budgetCategories = sqliteTable(
  "budget_categories",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "Venue", "Catering", "Photography"
    budgetedAmount: real("budgeted_amount").default(0),
    color: text("color").default("#8b5cf6"), // for UI display
    icon: text("icon"), // lucide icon name
    sortOrder: integer("sort_order").default(0),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    weddingIdx: index("budget_categories_wedding_idx").on(t.weddingId),
  })
);

// ─── Budget Items (Line Items) ────────────────────────────────────────────────
export const budgetItems = sqliteTable(
  "budget_items",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => budgetCategories.id, { onDelete: "cascade" }),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "Deposit - The Grand Ballroom"
    estimatedAmount: real("estimated_amount").notNull().default(0),
    actualAmount: real("actual_amount"), // null until paid
    isPaid: integer("is_paid", { mode: "boolean" }).default(false),
    paidAt: text("paid_at"),
    vendorName: text("vendor_name"),
    vendorContact: text("vendor_contact"),
    notes: text("notes"),
    dueDate: text("due_date"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    weddingIdx: index("budget_items_wedding_idx").on(t.weddingId),
    categoryIdx: index("budget_items_category_idx").on(t.categoryId),
  })
);

// ─── Checklist Items ──────────────────────────────────────────────────────────
export const checklistItems = sqliteTable(
  "checklist_items",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"), // e.g. "Venue", "Attire", "Legal"
    dueOffsetDays: integer("due_offset_days"), // days before wedding (-180 = 6 months before)
    dueDate: text("due_date"), // computed or manually set
    isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
    completedAt: text("completed_at"),
    isCustom: integer("is_custom", { mode: "boolean" }).default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    weddingIdx: index("checklist_wedding_idx").on(t.weddingId),
    completedIdx: index("checklist_completed_idx").on(t.isCompleted),
  })
);

// ─── Timeline Events ──────────────────────────────────────────────────────────
// Day-of schedule
export const timelineEvents = sqliteTable(
  "timeline_events",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startTime: text("start_time").notNull(), // "HH:MM"
    endTime: text("end_time"),
    location: text("location"),
    notes: text("notes"),
    sortOrder: integer("sort_order").default(0),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  }
);

// ─── Type exports ─────────────────────────────────────────────────────────────
export type Wedding = typeof weddings.$inferSelect;
export type NewWedding = typeof weddings.$inferInsert;
export type GuestGroup = typeof guestGroups.$inferSelect;
export type NewGuestGroup = typeof guestGroups.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type NewBudgetItem = typeof budgetItems.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type NewChecklistItem = typeof checklistItems.$inferInsert;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
