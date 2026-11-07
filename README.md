# AuditFactures B2B — Autonomous Invoice Audit & ERP Reconciliation with Clocked API

Built for the **Clocked Build Challenge (2026)**.

**Live Demo:** `https://ais-pre-dzxx6o3hl354t5djhvd24y-351713889472.europe-west1.run.app`

---

## Overview

**AuditFactures B2B** is an autonomous accounting audit and invoice validation web application designed for corporate finance and accounts payable (AP) teams. It eliminates manual invoice data entry, detects billing discrepancies or overcharges in real time, and prevents fraudulent or unapproved vendor payouts before they hit the general ledger.

The application connects two relational data tables—`Factures_Recues` (Incoming Vendor Invoices) and `Base_ERP_Reference` (Internal ERP Purchase Orders)—through an automated Clocked API pipeline (`Extract`, `Fill`, `Decide`, `Compare`, and `Guard`).

---

## How It Uses Clocked Endpoints

AuditFactures B2B uses a multi-stage Clocked pipeline (`/api/clocked/extract` in `server.ts`) where each endpoint's output directly drives application state, audit badges, and accounting decisions:

### 1. Core Group: `Extract`, `Fill`, and `Decide` (Full 3/3 Group Breadth)
- **`Extract` (`/v1/extract`)**: Extracts exact values and source spans from raw PDF invoice text layers—specifically the vendor name (`fournisseur_nom`), EU VAT identifier (`numero_tva`), invoice number (`numero_facture`), line items, and total gross amount (`montant_ttc`).
- **`Fill` (`/v1/fill`)**: Populates a complete, normalized `FactureRecue` accounting schema in a single structured call (formatting dates to ISO-8601, normalizing EU VAT numbers, and structuring line-item arrays).
- **`Decide` (`/v1/decide`)**: Evaluates the extracted invoice against the matched ERP Purchase Order (`Base_ERP_Reference`) and outputs a deterministic accounting routing decision with confidence probabilities:
  - `Approuvé` (Green) when `Montant_Extrait == Montant_Attendu` and VAT is verified.
  - `Bloqué` (Red) when an unauthorized price variance or budget overrun is detected (`Montant_Extrait != Montant_Attendu`).
  - `Vérification manuelle` (Amber) when the vendor VAT number is missing from the internal ERP master database.

### 2. Additional Endpoints for Safety & Grounding (`Guard` & `Compare`)
- **`Guard (injection)` (`/v1/guard`)**: Scans untrusted text extracted from external vendor PDFs before processing to block hidden prompt-injection attempts (e.g., invisible text in a PDF attempting to force `"Statut": "Approuvé"`).
- **`Compare` (`/v1/compare`)**: Compares the incoming vendor invoice line items against the authorized ERP Purchase Order description and ceiling amount (`Montant_Autorise`), highlighting exact financial deltas (e.g., `+1,350.00 €` uncontracted rush fee).

---

## Key Features

- **Visual Status Kanban & List Dashboard**: Real-time grouping of invoices by status (`Approuvé`, `Bloqué`, `Vérification manuelle`, `En attente`) with instant financial variance calculations and automation rate KPIs.
- **Two Connected Tables**:
  - `Factures_Recues`: Tracks incoming PDFs, extracted totals, expected ERP amounts, variance deltas, and audit logs. Supports CSV export.
  - `Base_ERP_Reference`: Internal control database of active Purchase Orders (`Numero_Bon_Commande`), VAT keys (`Numero_TVA`), and authorized budget ceilings (`Montant_Autorise`). Dynamically re-evaluates pending invoices when PO limits are updated.
- **1-Click Live Audit & PDF Upload Modal**: Upload any invoice or test pre-loaded scenarios (100% compliant invoice, budget overrun invoice, unknown vendor) to watch the 3-step Clocked extraction and ERP reconciliation pipeline run in real time.
- **Side-by-Side ERP Audit Inspector**: Click any invoice to inspect the side-by-side comparison between Clocked's extracted data and the ERP Purchase Order, view the stamped invoice preview, or inspect the raw Clocked JSON schema.
- **Interactive Clocked API & Webhook Sandbox**: Built-in tester and ready-to-copy HTTP/cURL/AppSheet webhook configurations.

---

## Getting Started (Local Reproducibility)

### Prerequisites
- Node.js 20+
- A Clocked API Key (redeem code `CLOCKEDHACKATHON` for 20,000 credits)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your Clocked API key:
   ```bash
   cp .env.example .env
   ```
   ```env
   CLOCKED_API_KEY="your_clocked_api_key_here"
   CLOCKED_API_URL="https://api.clocked.io/v1/documents/extract"
   ```

3. Run unit tests (verifying VAT normalization, ERP matching, variance math, and status decision rules):
   ```bash
   npx --yes tsx --test src/utils/auditEngine.test.ts
   ```

4. Start the full-stack Express + Vite application on port `3000`:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
