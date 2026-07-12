# Product Requirements Document (PRD)
## CineRent (working name) — Multivendor Camera & Equipment Rental Platform

**Version:** 1.0
**Prepared for:** Founder / Product Owner
**Prepared by:** Senior Full-Stack Engineering Advisory
**Date:** July 2026

---

## 1. Product Vision

A multivendor online marketplace where customers can browse, compare, and rent camera equipment — cameras, lenses, lights, audio gear, support (tripods/gimbals), monitors, and accessories — from multiple vendors, with WhatsApp-based order confirmations, a full customer self-service dashboard, and a Super Admin panel that manages vendors, customers, orders, cancellations, and website content.

**One important framing note before we go further:** this is not a standard e-commerce checkout — it's a **rental** business. That changes the data model in one critical way: every product needs **date-range based availability** (rental start date → end date), not just a stock count. Two customers can't rent the same camera body for overlapping dates. I've built this into the PRD and roadmap below even though it wasn't explicitly listed, because without it the "Add to Cart" and "Order" features won't actually work for a rental use case. Flagging this now — happy to descope if you intend a fixed daily-stock model instead.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Launch functional MVP marketplace | Live in production within ~14–16 weeks |
| Vendor onboarding | 10+ vendors onboarded with catalog live in first month post-launch |
| Order conversion | Cart → Order conversion rate ≥ 20% |
| Order communication reliability | ≥ 98% WhatsApp delivery success on order confirmations |
| Admin efficiency | Order approval turnaround < 2 hours during business hours |
| Cancellation handling | < 24 hr resolution time for cancellation requests |

---

## 3. User Roles & Personas

| Role | Description |
|---|---|
| **Super Admin** | Owns the platform. Manages vendors, categories, site content, global settings, disputes, commission. |
| **Vendor (Admin-managed or self-serve)** | Lists products under approved categories, manages own inventory & availability, receives/confirms orders for their gear. |
| **Customer** | Browses catalog, adds items to cart, places rental orders, tracks/cancels orders, receives WhatsApp confirmations. |

> Note: You said "admin can upload products" — this implies in v1 a **single admin/ops team uploads on behalf of vendors** rather than vendors self-managing a portal. I've designed the roadmap so v1 ships with Admin-managed catalog (simpler, faster), and a **Vendor Self-Serve Portal** is a clearly separated Phase 2 module. This avoids overloading MVP scope. Confirm this matches your intent.

---

## 4. Feature Scope (v1 / MVP)

### 4.1 Customer-Facing Website
- Home, category browsing (Camera / Lens / Lights / Audio / Support / Monitor / Accessories)
- Product listing page with filters (category, brand, price/day, availability dates, vendor)
- Product detail page: images, specs, rental pricing (per day/week), security deposit amount, availability calendar, vendor info
- **Date-range picker** on product page to check availability before adding to cart
- Add to Cart (multiple products, potentially different rental date ranges per item)
- Cart page: edit quantities/dates, remove items, view total (rental cost + deposit + taxes)
- Checkout: address/delivery details, ID verification upload (common for rental businesses), payment
- Order confirmation → triggers WhatsApp message to customer
- Customer Dashboard:
  - Active orders, upcoming rentals, order history
  - Order detail view (items, dates, status, deposit, invoice)
  - Cancel order / request cancellation (with reason)
  - Profile management, saved addresses, KYC document status
- Notifications (WhatsApp + email) for: order placed, order approved, order confirmed for dispatch, rental starting soon, return due, order completed, cancellation status

### 4.2 Admin Panel (Super Admin)
- Dashboard: KPIs (orders today, pending approvals, revenue, active rentals, overdue returns)
- **Vendor management**: add/approve/suspend vendors, view vendor performance
- **Customer management**: view/search customers, order history per customer, block/flag customers
- **Product/Catalog management (CRUD)**: add/edit/delete products by category, set pricing (daily/weekly), deposit amount, upload images, set availability blackout dates, assign to vendor
- **Order management**:
  - View all orders (filter by status/vendor/date)
  - Approve / reject new orders
  - Approve / reject cancellation requests
  - Mark orders as dispatched / returned / completed
  - Handle late-return or damage cases (flag deposit deduction)
- **Website content CRUD**: banners, homepage sections, category descriptions, static pages (About, T&C, Rental Policy, FAQ), blog (optional)
- **WhatsApp settings**: template management, order notification logs (sent/failed/delivered)
- Admin receives a WhatsApp/notification whenever a new order is placed

### 4.3 WhatsApp Integration (Two-Way)
- **To Customer:** order confirmation with order ID, item list, rental dates, total, deposit, pickup/delivery info
- **To Admin/Ops:** new order alert with customer name, items, dates, order value
- Status-change triggers (approved / dispatched / cancelled) optionally sent to customer
- Implementation via **Meta WhatsApp Cloud API** (recommended — official, scalable) or a BSP like Gupshup/Twilio/Interakt if you want faster setup without direct Meta review overhead. This needs a decision early since template approval (Meta) takes a few business days.

### 4.4 Cart & Ordering Logic
- Multi-item cart, each item can carry its own rental date range
- Real-time availability check at cart/checkout (prevent double-booking)
- Cancellation flow: customer requests → admin approves/rejects → refund/deposit logic triggered
- Order status lifecycle:
  `Placed → Pending Admin Approval → Approved → Dispatched/Handed Over → Active Rental → Returned → Completed`
  with a parallel `Cancellation Requested → Cancelled/Refunded` branch

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Product listing/search < 1.5s response; support 500 concurrent users at launch scale |
| Security | JWT-based auth, role-based access control (RBAC), OWASP Top 10 hardening, encrypted PII/KYC docs at rest |
| Availability | 99.5% uptime target post-launch |
| Scalability | Stateless Node backend behind load balancer; DB read replicas as vendor/order volume grows |
| Compliance | Data privacy for KYC/ID documents; PCI-DSS compliance handled by payment gateway (never store card data directly) |
| Auditability | Full audit log on order status changes, admin actions, product edits |

---

## 6. Tech Architecture

**Frontend:** React.js (Vite), TypeScript, Tailwind CSS, React Query/TanStack Query, Zustand or Redux Toolkit for cart/auth state, React Router
**Admin Panel:** Separate React app (or route-guarded module in same app) — consider React-Admin or a custom dashboard for faster CRUD scaffolding
**Backend:** Node.js + Express or NestJS (NestJS recommended for a multivendor system — better structure for RBAC, modules, and scaling later), REST API (GraphQL optional later)
**Database:** PostgreSQL (via Prisma ORM or TypeORM) — relational integrity matters here (orders, availability, deposits)
**Caching/Queue:** Redis — for cart sessions, availability locks, and a job queue (BullMQ) for WhatsApp/email sending, reminders, and overdue-return checks
**File Storage:** AWS S3 / Cloudflare R2 for product images & KYC documents (signed URLs)
**WhatsApp:** Meta WhatsApp Cloud API (or Gupshup/Twilio as BSP)
**Payments:** Razorpay or Stripe (Razorpay if primarily India-focused — supports UPI, deposits/holds)
**Hosting:** AWS/GCP — EC2/ECS or Render/Railway for faster MVP hosting; RDS Postgres managed DB
**CI/CD:** GitHub Actions → staging → production
**Monitoring:** Sentry (errors), Grafana/Prometheus or a managed APM later

### High-Level Core Entities (DB)
```
Users (customers, admins, vendor-users) — role, auth
Vendors — profile, status, commission%
Categories — camera, lens, lights, audio, support, monitor
Products — vendor_id, category_id, pricing (daily/weekly), deposit_amount, images, specs
ProductAvailability — product_id, blocked_date_ranges (or booking-based derivation)
Cart / CartItems — user_id, product_id, rental_start, rental_end, qty
Orders / OrderItems — status, totals, deposit, rental dates
CancellationRequests — order_id, reason, status, resolved_by
Notifications/WhatsAppLogs — recipient, template, status
CMS/Content — banners, pages, FAQs
AuditLogs — actor, action, entity, timestamp
```

---

## 7. Out of Scope for v1 (explicitly deferred)
- Vendor self-serve onboarding portal (Phase 2)
- Dynamic pricing / auto-discounts based on demand
- In-app chat between customer and vendor
- Insurance/damage-protection add-on purchase flow (can be manual/admin-handled in v1)
- Multi-currency / multi-language
- Native mobile apps (responsive web only in v1)

---

## 8. Risks & Assumptions
- **Assumption:** Payments include a security deposit hold, not just rental fee — needs gateway support for holds/captures (Razorpay supports this via authorize-then-capture).
- **Risk:** WhatsApp template approval via Meta can take 3–5 business days — start this in Week 1, not later.
- **Risk:** Double-booking bugs are the highest-impact bug class in a rental system — availability logic needs dedicated QA time, not just happy-path testing.
- **Assumption:** KYC/ID verification is manual (admin reviews upload) in v1, not automated.

---

# Roadmap & Timeline

**Team assumption:** 1 Tech Lead/Architect, 2 Backend engineers, 2 Frontend engineers, 1 QA, 1 UI/UX (part-time), 1 PM/Founder. Adjust timeline if team is smaller — a 2–3 person team roughly doubles these estimates.

## Phase 0 — Discovery & Setup (Week 1–2)
- Finalize PRD sign-off, wireframes (Figma) for website + admin panel
- Finalize commission model, deposit policy, cancellation policy (legal/business decisions needed before dev starts)
- Tech setup: repos, CI/CD, dev/staging/prod environments, DB schema v1
- **Start WhatsApp Business API application & template submission (parallel track — long lead time)**
- Payment gateway account setup (KYC for Razorpay/Stripe business account)

## Phase 1 — Core Backend & Data Model (Week 3–5)
- Auth & RBAC (customer, admin, vendor roles)
- Category & Product CRUD APIs
- Availability engine (date-range conflict logic) — **highest priority, highest risk module**
- Cart APIs
- Order lifecycle APIs (state machine)
- Admin: vendor & customer management APIs

## Phase 2 — Frontend: Customer Website (Week 4–8, overlapping Phase 1)
- Home, category, product listing, filters
- Product detail page with availability calendar
- Cart & checkout flow
- Customer dashboard (orders, history, cancel request)
- Auth screens (login/signup/OTP)

## Phase 3 — Admin Panel (Week 6–9, overlapping)
- Admin dashboard & KPIs
- Product CRUD UI, category management
- Order management UI (approve/reject/status updates)
- Customer & vendor management UI
- Website content CRUD (banners, static pages)

## Phase 4 — WhatsApp + Payments Integration (Week 8–10)
- WhatsApp Cloud API integration: order confirmation (customer), new order alert (admin), status-update messages
- Payment integration: checkout charge + deposit hold/capture logic
- Notification queue (BullMQ) for retries/logging

## Phase 5 — QA, Hardening, UAT (Week 11–13)
- End-to-end testing, especially availability/double-booking edge cases
- Security review (RBAC, auth, file upload validation)
- Load testing for expected concurrent users
- UAT with real vendor + sample catalog

## Phase 6 — Launch Prep & Go-Live (Week 14–16)
- Content population (categories, initial vendor catalogs)
- Soft launch with limited vendors/customers
- Monitoring/alerting setup (Sentry, uptime)
- Public launch

## Post-Launch — Phase 2 Roadmap (Month 5+)
- Vendor self-serve portal
- Automated KYC verification
- Damage/insurance add-on flow
- Analytics dashboard (revenue by category/vendor)
- Mobile app (React Native, reusing API layer)

---

### Suggested Timeline Summary

| Phase | Duration | Weeks |
|---|---|---|
| Discovery & Setup | 2 wks | 1–2 |
| Core Backend | 3 wks | 3–5 |
| Customer Website | 5 wks (overlap) | 4–8 |
| Admin Panel | 4 wks (overlap) | 6–9 |
| WhatsApp + Payments | 3 wks | 8–10 |
| QA & UAT | 3 wks | 11–13 |
| Launch Prep & Go-Live | 3 wks | 14–16 |
| **Total to MVP Launch** | **~14–16 weeks** | |

---

## Open Questions for You (before dev starts)
1. Should v1 support vendor self-login at all, or is admin the sole product uploader for now?
2. Deposit handling — hold-and-capture via gateway, or manual collection/refund by admin?
3. Delivery model — do you handle pickup/delivery logistics, or is it vendor/customer self-coordinated?
4. WhatsApp provider — direct Meta Cloud API, or a BSP (Gupshup/Twilio/Interakt) for faster setup?
5. Late return / damage penalty — automated deposit deduction rules, or always manual admin decision?
