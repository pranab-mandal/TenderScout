# 🔍 TenderScout — Production-Ready Agentic Tender Discovery & Verification

> **Autonomous multi-portal government tender discovery agent powered by reusable WebCMD adapters, deterministic CLI workflows, and live active tender verification.**

---

## 📌 1. Problem & Motivation

Public procurement notices in India are fragmented across dozens of independent portals:
- **Central Public Procurement Portal (CPPP / ePublish / eTenders)**
- **State Government e-Procurement Portals (e.g. Himachal Pradesh `hptenders.gov.in`, Maharashtra `mahatenders.gov.in`, Delhi)**
- **Public Sector Undertakings (PSUs) & Railways (`ireps.gov.in`, NHAI, NTPC)**

Finding active tenders requires navigating complex legacy search interfaces, dealing with varying terminology ("Works", "Civil Works", "NIT No", "Estimate Cost"), and manually checking whether deadlines have passed or notices were cancelled.

**TenderScout** solves this by providing a unified, agentic search and verification system. Users can enter natural-language queries (e.g., *"Find active road construction tenders in Himachal Pradesh under 50 lakh"*), and TenderScout autonomously plans, queries official portals via reusable WebCMD adapters, normalizes fields, deduplicates, verifies active status, and ranks matches with plain-English explainability.

---

## 🏗️ 2. System Architecture

```
                                  User Request
           ("Find road construction tenders in Himachal Pradesh under 50L")
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │   Agent 1: Query Understanding Agent   │
                   │   • Indian Financial Parser (Lakh/Cr)  │
                   │   • Location & Category Resolution     │
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │    Agent 2: Source Planning Agent      │
                   │   • Selects target official portals    │
                   └───────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
     ┌─────────────────────────────┐       ┌─────────────────────────────┐
     │   tender-state (WebCMD)     │       │   tender-central (WebCMD)   │
     │   hptenders.gov.in          │       │   eprocure.gov.in           │
     └──────────────┬──────────────┘       └──────────────┬──────────────┘
                    ▼                                     ▼
     ┌─────────────────────────────┐       ┌─────────────────────────────┐
     │   tender-psu (WebCMD)       │       │   tender-search (WebCMD)    │
     │   ireps.gov.in / NHAI       │       │   *.gov.in crawler          │
     └──────────────┬──────────────┘       └──────────────┬──────────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       ▼
                   ┌────────────────────────────────────────┐
                   │       Result Normalizer Service        │
                   │     (Stable Tender Data Contract)      │
                   └───────────────────┬────────────────────┘
                                       ▼
                   ┌────────────────────────────────────────┐
                   │        Deduplication Service           │
                   │  (Multi-signal ID/URL/Title/Date Match)│
                   └───────────────────┬────────────────────┘
                                       ▼
                   ┌────────────────────────────────────────┐
                   │    Active Tender Verification Engine   │
                   │   • URL Reachability (HTTP 200)        │
                   │   • Future Deadline Verification       │
                   │   • Status Classification (OPEN/EXPIRED│
                   └───────────────────┬────────────────────┘
                                       ▼
                   ┌────────────────────────────────────────┐
                   │       Relevance Ranking Engine         │
                   │  • Multi-factor Score (0 - 100)        │
                   │  • Explainable "Why this matches"      │
                   └───────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │  Modern Web UI (Vite) │             │    TenderScout CLI    │
        │  http://localhost:5173│             │   tenderscout search  │
        └───────────────────────┘             └───────────────────────┘
```

---

## ⚡ 3. WebCMD Integration & Adapter Strategy

TenderScout builds strictly on the **WebCMD philosophy**:
> **Explore once → turn the workflow into a command → reuse it.**

### Reusable WebCMD Adapters in `webcmd-plugin/`:
1. **`tender-central`**: Central Public Procurement Portal (`eprocure.gov.in/epublish/app`, `etenders.gov.in`)
2. **`tender-state`**: State Government eProcurement (`hptenders.gov.in`, `mahatenders.gov.in`, `delhi.gov.in`)
3. **`tender-psu`**: PSU & Railway Procurement (`ireps.gov.in`, NHAI, NTPC)
4. **`tender-search`**: Government-wide active tender discovery crawler across `*.gov.in` and `*.nic.in`

### WebCMD Execution Strategy Hierarchy:
- **Strategy 1 — PUBLIC**: Direct public feeds, search endpoints, and structured HTTP retrieval.
- **Strategy 2 — INTERCEPT**: AJAX/JSON requests reused without DOM scraping.
- **Strategy 3 — COOKIE**: Authenticated read-only profile if required.
- **Strategy 4 — UI**: Browser automation fallback for dynamic sites.
- **Strategy 5 — LOCAL**: Local parsing and validation tools.

---

## 📋 4. Stable Tender JSON Schema

Every adapter and endpoint returns the normalized Tender contract:

```json
{
  "id": "HP-PWD-2026-081",
  "title": "Construction and Upgradation of Rural Link Road in Kangra",
  "organization": "Himachal Pradesh Public Works Department (PWD)",
  "location": "Kangra, Himachal Pradesh",
  "category": "Civil Works",
  "description": "Construction of road network under HP PWD.",
  "estimated_value": 4250000,
  "currency": "INR",
  "published_at": "2026-08-20T10:00:00.000Z",
  "deadline": "2026-09-05T17:00:00.000Z",
  "status": "OPEN",
  "url": "https://hptenders.gov.in/nicgep/app?page=FrontEndLatestActiveTenders&service=page",
  "source": "Himachal Pradesh State eProcurement Portal",
  "source_url": "https://hptenders.gov.in",
  "verified_at": "2026-08-22T18:04:28.000Z",
  "verification": {
    "source_reachable": true,
    "deadline_verified": true,
    "status_verified": true,
    "url_verified": true,
    "checked_at": "2026-08-22T18:04:28.000Z",
    "http_status": 200,
    "notes": [
      "✓ Official government portal link formatted",
      "✓ Official source reachable (HTTP 200)",
      "✓ Deadline (05 Sept 2026) is in the future",
      "✓ Status verified: Tender is currently ACTIVE"
    ]
  },
  "relevance_score": 96,
  "match_explanation": "Matches \"road construction\", Located in Himachal Pradesh, Value ₹42.50 Lakh within budget (<= ₹50.00 Lakh), Verified active with future submission deadline."
}
```

---

## 🚀 5. Getting Started & Installation

### Prerequisites
- **Node.js**: v20+ (Tested on Node v24.14.0)
- **npm**: v10+ (Tested on npm 11.9.0)

### 1. Clone and Install Dependencies
```bash
cd tender-scout
npm install
```

### 2. Run Automated Tests
```bash
cd backend
npm test
```
*Expected: 6 test suites passed (16 tests passed).*

### 3. Start Application
```bash
# From the root directory:
npm run dev

# Or start individually:
# Terminal 1 (Backend API on port 3001):
cd backend && npm run dev

# Terminal 2 (Frontend UI on port 5173):
cd frontend && npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 💻 6. CLI Usage

TenderScout includes a full CLI utility for terminal-based discovery:

### Natural Language Search:
```bash
npx tsx backend/src/cli.ts search "road construction in Himachal Pradesh under 50 lakh"
```

### Structured Parameter Flags:
```bash
npx tsx backend/src/cli.ts search --keyword "bridge construction" --location "Himachal Pradesh" --max-value 5000000
```

### JSON Output Mode:
```bash
npx tsx backend/src/cli.ts search "civil works" --format json
```

---

## 🛡️ 7. Verification & Safety Policy

TenderScout enforces strict production safety rules:
- **100% Official Links**: Every URL points to an authentic public `.gov.in` / `.nic.in` portal.
- **Zero Fake Data**: If no verified tenders exist for a query, TenderScout states *"No verified tenders found"* rather than fabricating results.
- **Read-Only Discovery**: The agent never bids, submits forms, or bypasses CAPTCHA.

---

## 🧪 8. Test Suite Coverage

Automated tests cover:
- **`queryUnderstanding.test.ts`**: Indian financial units (`50 lakh`, `2.5 crore`, ranges), location resolution, keyword extraction, and status detection.
- **`normalizer.test.ts`**: Disparate portal field mapping, date parsing, and schema normalization.
- **`deduplicator.test.ts`**: Multi-signal title similarity, ID matching, and source merging.
- **`verifier.test.ts`**: Reachability probes, past deadline expiration, and evidence generation.
- **`ranker.test.ts`**: Multi-factor scoring and explainability.
- **`integration.test.ts`**: End-to-end user query → agents → WebCMD adapters → verification → ranking.

---

## 👥 Authors
Built for the Hackathon by the **TenderScout Team**.
