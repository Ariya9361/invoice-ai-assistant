

# SupplyChain AI Agent — Implementation Plan

## Overview
A modern SaaS dashboard that demonstrates AI-powered procurement invoice processing with three-way matching (Invoice ↔ Purchase Order ↔ Goods Receipt). Dark theme with yellow accent highlights, built for demo/showcase purposes using mock data and Lovable Cloud for auth and AI features.

---

## 1. Design System & Layout
- **Dark tech theme** with deep navy/charcoal backgrounds and **yellow (#F5C518) accent highlights**
- Clean SaaS dashboard layout with a **collapsible sidebar navigation**
- Corporate B2B typography — professional, data-dense but readable
- Responsive design for desktop-first usage

---

## 2. Authentication
- Simple **email/password login and signup** via Lovable Cloud (Supabase Auth)
- Clean dark-themed login page with the SupplyChain AI Agent branding
- Protected routes — all pages behind authentication

---

## 3. Dashboard (Home Page)
- **KPI cards** at top: Total Invoices Processed, Match Rate %, Pending Approvals, Processing Time Saved
- **Invoice status chart** — matched vs unmatched vs pending (bar or donut chart)
- **Recent activity feed** — latest invoices processed with status indicators
- **Monthly trend line chart** — invoice volume over time
- All powered by mock data that feels realistic

---

## 4. Invoice Processing Page
- **Upload area** for invoices (PDF/image) — with drag-and-drop UI
- **AI extraction simulation** — after upload, display an animated "AI Agent Processing" workflow showing:
  - Step 1: Document received
  - Step 2: AI extracting fields (vendor, invoice #, PO #, amount, date, line items)
  - Step 3: Matching against PO database
  - Step 4: Result — matched / mismatched / needs review
- **Extracted data preview** — side-by-side view of the original document info and extracted fields
- Uses **Lovable AI** to actually parse uploaded document descriptions and simulate intelligent extraction
- Bulk upload option with processing queue view

---

## 5. Three-Way Matching Engine
- Visual comparison table: **Invoice ↔ Purchase Order ↔ Goods Receipt**
- Color-coded indicators: ✅ Match (green), ⚠️ Tolerance (yellow), ❌ Mismatch (red)
- Tolerance threshold settings (e.g., allow 2% price variance)
- Matching summary with confidence score
- Auto-generated **approval recommendation** from the AI agent

---

## 6. Review & Approval Page
- **Invoice queue** — list of invoices pending review, sortable by priority/amount/date
- **Detail view** for each invoice showing:
  - Full invoice details and extracted data
  - Three-way match comparison with mismatches highlighted in yellow
  - AI agent's recommendation (approve/reject/escalate) with reasoning
  - Action buttons: Approve, Reject, Request More Info
- Approval history log

---

## 7. ERP Integration Simulation
- **Mock ERP data tables** showing:
  - Purchase Orders (PO number, vendor, items, amounts, dates)
  - Goods Receipts (receipt number, PO reference, quantities, dates)
  - Vendor master data
- Sync status indicators showing "connected" state
- Ability to add/edit mock PO and receipt data for demo purposes

---

## 8. Analytics Page
- **Processing efficiency**: Average time saved per invoice vs manual processing
- **Accuracy metrics**: Match rate, exception rate, auto-approval rate
- **Monthly invoice trends**: Volume, value, and processing time charts
- **Vendor performance**: Top vendors by volume, match rate by vendor
- **Cost savings calculator**: Estimated savings from automation
- All using Recharts with the dark theme and yellow accents

---

## 9. AI Agent Workflow Visualization
- A dedicated view or modal showing the **AI agent pipeline**:
  - Email ingestion → Document parsing → Data extraction → PO lookup → Three-way match → Recommendation
- Animated step-by-step flow with status indicators
- Shows the "thinking" of the AI agent at each step

---

## 10. Backend (Lovable Cloud)
- **Database tables**: invoices, purchase_orders, goods_receipts, vendors, match_results, approvals
- Pre-seeded with realistic **mock procurement data**
- **Edge function** using Lovable AI for invoice data extraction simulation
- Simple auth with Supabase

