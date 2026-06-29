# Vowed Monetization Guide

## The model: Free core, paid native experience

### Free forever (web)
Everything in this repo. The entire planning suite — guest list, budget, checklist, wedding website — free and open source, forever.

**Why:** This is the trust layer. Brides talk to each other. "This is actually free and works" spreads faster than any ad budget.

---

### Premium ($49 one-time or $9/month) — iOS native app

The iOS app is where you monetize. It does things the web app genuinely cannot:

| Feature | Why it's worth paying for |
|---|---|
| Apple Contacts import | Import your entire phonebook as guest candidates in one tap |
| EventKit sync | Wedding tasks and vendor appointments in the native Calendar app |
| iMessage templates | Send RSVP links as native iMessages (not emails that get ignored) |
| AirDrop guest cards | Share a guest's contact card to vendor/coordinator instantly |
| Drag-and-drop seating | Native touch UI for table assignments — feels right on an iPad |
| Offline mode | Full access on the plane to your destination wedding |
| Printable PDFs | Day-of timeline, seating chart, vendor contact sheet |
| Widgets | Guest count / days-to-wedding on the home screen |

**Build the iOS app with:** React Native + Expo + Expo Contacts + Expo Calendar. The schema is already shared.

---

### Ethical vendor listings (optional revenue stream)

This is where you differentiate from TheKnot's predatory model:

| TheKnot | Vowed |
|---|---|
| 12-month lock-in contract | Month-to-month, cancel any time |
| $300-400/month | $29-49/month flat |
| Fake leads reported by vendors | Real couples who matched by location/style |
| Hidden in the search algorithm | Clearly labeled "Featured vendor" |
| Sales rep pressure tactics | Self-serve signup |

Vendors burned by TheKnot will come to you. There's a whole whistleblower community.

---

### Revenue projections (conservative)

- 10,000 users → 5% premium conversion = 500 × $49 = $24,500/year (one-time)
- Or 500 × $9/month = $4,500 MRR = $54,000 ARR
- 50 vendor listings × $39/month = $1,950 MRR additional

**Target year-1 ARR: $30-60K** with minimal marketing if you seed the right wedding communities (Reddit r/weddingplanning, wedding Facebook groups, TikTok).

---

### Go-to-market

1. Post on r/weddingplanning: "I built a free TheKnot alternative after getting frustrated. Here's what I fixed." (No self-promo tone — show the actual fixes)
2. Post on Hacker News: "Show HN: Free open-source wedding planner"
3. Target vendors burned by TheKnot — they'll send their clients to you
4. SEO: "theknot alternative", "free wedding planner", "wedding guest list app"
5. TikTok: Screen-record the side-by-side of TheKnot loading for 2 minutes vs Vowed loading instantly

---

### What NOT to do

- Don't paywall the guest list or budget tracker
- Don't put ads in the app
- Don't create 12-month vendor contracts
- Don't make the free tier artificially limited (100 guest cap, etc.) — that's what makes people hate the platforms they're on
