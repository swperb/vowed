# Vowed Monetization Guide

## The model: free for couples, funded by vendors and planners

Couples never pay. Every planning feature is free forever, on web and iOS. Revenue comes from the
vendor and planner side of the marketplace, never from the people planning their wedding.

---

### Free forever (couples, web + iOS)

The entire planning suite, guest list, budget, checklist, wedding website, and the native iOS app,
is free and open source. No feature gates, no premium tier, no trials that expire.

**Why:** This is the trust layer. Couples talk to each other. "This is actually free and works"
spreads faster than any ad budget.

---

### Support the project (optional tip)

A one-time "support the project" tip ($9 / $19 / custom) via Stripe. Entirely optional. Nothing is
ever locked behind it. This is gratitude, not a paywall.

Status: not yet built (needs Stripe checkout + keys).

---

### Vendor listings (/vendors) — $39/month flat

This is the primary revenue stream, and where Vowed differentiates from TheKnot's predatory model:

| TheKnot | Vowed |
|---|---|
| 12-month lock-in contract | Month-to-month, cancel any time |
| $300-400/month | $39/month flat |
| Fake/recycled leads | Couples reach out directly |
| Buried in a pay-to-win algorithm | Clearly labeled "Featured" |
| Sales rep pressure tactics | Self-serve signup |

Vendors burned by TheKnot will come to you. Current state: marketing page + inquiry form live,
emailing the admin via Resend. Full self-serve billing (Stripe subscriptions) is v2.

---

### Wedding planner white-label (/planners) — B2B

Planners run Vowed for their clients under their own brand: multiple weddings from one account,
client sharing, their logo on each couple's wedding website. Current state: marketing page +
waitlist form live (capturing leads). The white-label product itself is v2.

---

### iOS app

Free, like everything else for couples. Monetization stays entirely on the vendor/planner side.
Build with React Native + Expo; the schema is shared with the web app.

---

### Go-to-market

1. Post on r/weddingplanning: "I built a free TheKnot alternative after getting frustrated. Here's what I fixed." (Show the actual fixes, no self-promo tone.)
2. Post on Hacker News: "Show HN: Free open-source wedding planner"
3. Target vendors burned by TheKnot, they'll send their clients to you
4. SEO: "theknot alternative", "free wedding planner", "wedding guest list app"
5. TikTok: side-by-side of TheKnot loading for 2 minutes vs Vowed loading instantly

---

### What NOT to do

- Don't paywall any planning feature for couples
- Don't put ads in the app
- Don't create lock-in contracts for vendors
- Don't artificially limit the free experience (guest caps, etc.)
- Don't ever charge the couple
