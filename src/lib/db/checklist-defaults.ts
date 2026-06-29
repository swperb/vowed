// Default checklist items relative to wedding date
// dueOffsetDays: negative = days BEFORE wedding
// e.g. -365 = 12 months before, -180 = 6 months before

export type DefaultChecklistItem = {
  title: string;
  description?: string;
  category: string;
  dueOffsetDays: number;
  sortOrder: number;
};

export const DEFAULT_CHECKLIST: DefaultChecklistItem[] = [
  // 12+ months out
  { title: "Set your budget", description: "Determine total budget and how it will be funded", category: "Planning", dueOffsetDays: -395, sortOrder: 10 },
  { title: "Choose a wedding date", category: "Planning", dueOffsetDays: -395, sortOrder: 20 },
  { title: "Create your guest list (draft)", description: "Start with a rough list; you'll refine it", category: "Guests", dueOffsetDays: -395, sortOrder: 30 },
  { title: "Book your venue", description: "Venues book up fast, this is the first deadline", category: "Venue", dueOffsetDays: -365, sortOrder: 40 },
  { title: "Choose a wedding party", category: "Planning", dueOffsetDays: -365, sortOrder: 50 },
  { title: "Book photographer", description: "Good photographers book 12–18 months out", category: "Vendors", dueOffsetDays: -365, sortOrder: 60 },
  { title: "Book videographer", category: "Vendors", dueOffsetDays: -365, sortOrder: 70 },
  { title: "Research caterers", description: "If venue doesn't provide catering", category: "Catering", dueOffsetDays: -365, sortOrder: 80 },

  // 9–12 months
  { title: "Book officiant", category: "Ceremony", dueOffsetDays: -300, sortOrder: 90 },
  { title: "Book band or DJ", category: "Vendors", dueOffsetDays: -300, sortOrder: 100 },
  { title: "Start dress/attire shopping", description: "Formal wear needs 6–8 months for alterations", category: "Attire", dueOffsetDays: -300, sortOrder: 110 },
  { title: "Book hair and makeup artist", category: "Vendors", dueOffsetDays: -300, sortOrder: 120 },
  { title: "Register for gifts", description: "Set up 2–3 registries", category: "Registry", dueOffsetDays: -270, sortOrder: 130 },
  { title: "Plan honeymoon", category: "Honeymoon", dueOffsetDays: -270, sortOrder: 140 },
  { title: "Book honeymoon travel", category: "Honeymoon", dueOffsetDays: -270, sortOrder: 150 },

  // 6–9 months
  { title: "Book florist", category: "Flowers", dueOffsetDays: -240, sortOrder: 160 },
  { title: "Book caterer (if separate from venue)", category: "Catering", dueOffsetDays: -240, sortOrder: 170 },
  { title: "Order wedding dress/suit", description: "Allow time for alterations", category: "Attire", dueOffsetDays: -240, sortOrder: 180 },
  { title: "Design and order save the dates", category: "Stationery", dueOffsetDays: -210, sortOrder: 190 },
  { title: "Mail save the dates", category: "Stationery", dueOffsetDays: -180, sortOrder: 200 },
  { title: "Book accommodation block for guests", description: "Negotiate room block at nearby hotel", category: "Venue", dueOffsetDays: -210, sortOrder: 210 },
  { title: "Schedule engagement photos", category: "Vendors", dueOffsetDays: -210, sortOrder: 220 },

  // 4–6 months
  { title: "Design and order invitations", category: "Stationery", dueOffsetDays: -150, sortOrder: 230 },
  { title: "Plan ceremony", description: "Write vows, choose readings, plan processional", category: "Ceremony", dueOffsetDays: -150, sortOrder: 240 },
  { title: "Plan menu with caterer", category: "Catering", dueOffsetDays: -150, sortOrder: 250 },
  { title: "Book transportation", description: "Shuttle, limo, getaway car", category: "Vendors", dueOffsetDays: -150, sortOrder: 260 },
  { title: "Order wedding party attire", category: "Attire", dueOffsetDays: -150, sortOrder: 270 },
  { title: "Schedule cake tasting and order cake", category: "Catering", dueOffsetDays: -120, sortOrder: 280 },
  { title: "Apply for marriage license", description: "Check local requirements for timing", category: "Legal", dueOffsetDays: -120, sortOrder: 290 },

  // 2–4 months
  { title: "Mail invitations", description: "6–8 weeks before, 10–12 for destination", category: "Stationery", dueOffsetDays: -60, sortOrder: 300 },
  { title: "Order wedding rings", description: "Allow time for sizing and engraving", category: "Jewelry", dueOffsetDays: -90, sortOrder: 310 },
  { title: "First dress fitting", category: "Attire", dueOffsetDays: -90, sortOrder: 320 },
  { title: "Create day-of timeline", category: "Planning", dueOffsetDays: -90, sortOrder: 330 },
  { title: "Book rehearsal dinner venue", category: "Venue", dueOffsetDays: -90, sortOrder: 340 },
  { title: "Write personal vows", category: "Ceremony", dueOffsetDays: -60, sortOrder: 350 },

  // 4–6 weeks
  { title: "RSVP deadline", description: "Chase down late responses", category: "Guests", dueOffsetDays: -30, sortOrder: 360 },
  { title: "Final guest count to caterer", category: "Catering", dueOffsetDays: -21, sortOrder: 370 },
  { title: "Final dress fitting", category: "Attire", dueOffsetDays: -21, sortOrder: 380 },
  { title: "Create seating chart", category: "Guests", dueOffsetDays: -14, sortOrder: 390 },
  { title: "Prepare vendor payments", description: "Gather final invoices, prepare tips", category: "Planning", dueOffsetDays: -14, sortOrder: 400 },
  { title: "Confirm all vendor details", description: "Send timeline to every vendor", category: "Vendors", dueOffsetDays: -7, sortOrder: 410 },

  // 1 week and day-of
  { title: "Confirm rehearsal dinner details", category: "Venue", dueOffsetDays: -7, sortOrder: 420 },
  { title: "Pack for honeymoon", category: "Honeymoon", dueOffsetDays: -3, sortOrder: 430 },
  { title: "Give rings to ring bearer / best man", category: "Ceremony", dueOffsetDays: -1, sortOrder: 440 },
  { title: "Eat breakfast", description: "You'll forget. Don't forget.", category: "Day-of", dueOffsetDays: 0, sortOrder: 450 },
  { title: "Get married 🎉", category: "Day-of", dueOffsetDays: 0, sortOrder: 460 },

  // After
  { title: "Send thank you notes", description: "Within 3 months of wedding", category: "Post-wedding", dueOffsetDays: 30, sortOrder: 470 },
  { title: "Change name (if applicable)", description: "Social Security, driver's license, passport", category: "Legal", dueOffsetDays: 30, sortOrder: 480 },
  { title: "Wedding dress preservation", category: "Post-wedding", dueOffsetDays: 60, sortOrder: 490 },
];
