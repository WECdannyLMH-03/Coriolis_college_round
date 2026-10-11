# Nexus

Nexus is a unified business operations app that brings websites, CRM, marketing, webinars, subscriptions and an AI workflow agent into one workspace. A single shared contact record spans every module, so a lead who registers for a webinar, receives a campaign and later subscribes is one person, not three.

The sample organization in the app is **Nexus Technologies Ltd.**

> **Demo build:** Email delivery, the live webinar room and payments are all simulated. No real emails are sent and no real transactions occur. Some dashboard figures are seeded sample data.

---

## Features

- **Websites:** visual page builder with section blocks, desktop/mobile preview and approval-gated publishing
- **CRM Contacts:** pipeline stages, tags, consent tracking, CSV import/export and per-contact timelines
- **Marketing:** consent-aware email campaigns with AI-assisted copy and simulated delivery metrics
- **Webinars:** event management, registration, attendance tracking and a mock live room
- **Subscriptions:** plans, metered usage ingestion with idempotent dedup, invoices and a payment simulator
- **AI Agent:** turns a plain-language goal into an ordered, tool-backed workflow plan, with human review for sensitive steps
- **Approvals & Audit:** approval queue for sensitive actions plus an immutable audit log
- **Analytics:** funnel conversion, lead-to-paid conversion, revenue run-rate and time saved
- **Role-based access:** Administrator, Operations Manager, Marketing Specialist and Read-Only Viewer

---

## Getting Started

### Navigation

The dark navy left sidebar contains: **Overview, Websites, CRM Contacts, Marketing, Webinars, Subscriptions, AI Agent, Analytics, Approvals & Audit, Settings.**

The top bar has:

- Global search
- **AI Agent Command** button (available on every page)
- **+ Create** menu
- Notifications
- Profile (default: Sarah Jenkins, Admin)

### Choose a role first

Open **Settings → Active Operator Profile → Switch Active Role for Testing**. The same dropdown appears at the bottom of the sidebar.

| Operation | Admin | Manager | Marketing | Viewer |
|---|---|---|---|---|
| Publish website | Direct | Direct | Needs Approval | Denied |
| Send email broadcast | Direct | Direct | Needs Approval | Denied |
| Delete contacts | Allowed | Allowed | Denied | Denied |
| Run AI workflows | Full | Full | Gated | Denied |
| Approve sensitive items | Yes | Yes | Denied | Denied |

**Tips**

- Use the **Marketing** role to see approval gating.
- Use the **Viewer** role to see everything locked.
- **Reset to Seed Baseline** restores the sample data.

---

## Modules

### Overview

The dashboard shows Total Contacts, MRR, Scheduled Webinars and Marketing Deliveries, plus the Revenue & Lead Pipeline chart. It also includes:

- **Quick Resource Actions** to start a landing page, contact, webinar or campaign
- Recent AI workflow executions
- CRM pipeline distribution (New, Contacted, Qualified, Converted, Lost)
- **Launch AI Workflow Agent** shortcut

### Websites

1. Pick a site from the dropdown (e.g. "Python Workshop 2026 Masterclass").
2. Check the status badge (Draft or Published) along with visits and leads.
3. Manage **Active Sections**: reorder with ↑/↓, edit with the pencil, delete with the trash icon.
4. Use **Add Section Block** to add a Hero, Webinar Form, Features Grid, Testimonials, Pricing Table or FAQ.
5. Toggle desktop/mobile preview, then click **Update & Re-Publish**. Publishing is approval-gated for non-admins.

The registration form (name, email, company) feeds directly into the CRM and is **deduplicated by email**.

### CRM Contacts

- Tabs: All, Qualified Leads, Webinar Leads, Converted Customers, Opted Out
- Search by name, email, company or tags, and filter by stage
- Change a contact's stage inline from the dropdown
- Each row shows source, tags, consent status, and badges for webinars and subscriptions
- Actions: **Add Contact**, **Import CSV**, **Export CSV**, the eye icon (profile and timeline), and the trash icon (delete with confirmation)

Devin Vance is a good example: one record with "1 Event" and "Active Sub" badges spans both webinar and billing.

### Marketing

- **Draft New Campaign:** choose a segment, write the subject and body, or use AI copy generation.
- Select a campaign to see audience size, delivered, opened and clicked counts.
- Only **consented** contacts are targeted.
- Without a real email provider (SES/SendGrid), delivery metrics come from a **simulation engine**, so they are not real sends.

### Webinars

- The list shows each event's date, time, ticket price and registration count.
- The detail view shows registered vs. capacity (e.g. 1/250), attended, ticket price and gross ticket volume.
- Attendee statuses read like `REGISTERED (NO-SHOW)`. Click **Mark Attended** to record attendance.
- **Join Mock Live Room** opens a simulated room, not a real video session.

### Subscriptions

Four tabs: **Customer Subscriptions, Pricing Plans, Usage Logs, Invoices.**

- **Ingest Usage Event** records metered usage. Duplicate events are blocked by idempotency ("Idempotent dedup active").
- **Launch Payment Simulator** runs a demo checkout. It is not a real transaction, and subscriptions activate only after the payment event.
- Summary cards show MRR, Invoiced & Collected, and Usage Events.

### AI Agent

1. Type a goal, or click a sample prompt such as **"Python Workshop Complete Flow (₹999)"**.
2. Click **Generate Workflow Plan**. The agent produces ordered steps with dependencies, each tied to a tool (e.g. `CREATE_WEBINAR`).
3. Review the plan. Steps marked **Sensitive Approval** (sending campaigns, changing billing) cannot run without human review.
4. Click **Run All Steps**. Each step moves through: `Pending → Running → Awaiting Approval → Completed` (or `Failed`).
5. Past runs appear in **Workflow Run History**, with each step's input parameters visible.

### Approvals & Audit

- **Approval Queue:** pending sensitive actions can be approved or rejected. The reviewer name and timestamp are recorded (e.g. "Reviewed by Sarah Jenkins at 10/10/2026, 3:41:41 PM").
- **Audit Log:** an immutable record of business-critical actions.

### Analytics

Web funnel conversion, lead-to-paid conversion, revenue run-rate and automated time saved, alongside the marketing funnel (delivered, opened, clicked) and webinar registration and attendance.

---

## End-to-End Demo: Workshop Workflow

1. **AI Agent:** enter the workshop prompt and generate the plan.
2. **Run the steps:** a landing page draft, a webinar (₹999) and a campaign draft are created.
3. **Approvals:** the campaign waits here. Approve it (as Admin) to release the simulated send.
4. **Websites:** publish the page, then submit the registration form as a visitor.
5. **CRM:** confirm the contact was created once (not duplicated) and linked to the webinar.
6. **Subscriptions:** run the Payment Simulator, then verify the subscription activates and an invoice appears.
7. **Webinars:** mark the attendee as attended.
8. **Analytics / Overview / Approvals & Audit:** check that every number and log entry reflects the flow.

---

## Known Limitations

- **Currency inconsistency:** webinar prices are in ₹, while MRR, billing and analytics show $.
- **Seeded metrics:** some figures (e.g. "Total Registrants: 2" on Overview, 165 deliveries in Marketing) come from sample data rather than live activity.
- **Broken images:** the webinar banner and some avatars show missing-image icons.
- **Empty approval queue:** the queue starts at 0. Trigger a campaign send as Marketing to populate it.
- **Run All Steps greyed out:** expected behavior on a completed run.
- **Simulated services:** email delivery, payments and the live webinar room are all mocked.
