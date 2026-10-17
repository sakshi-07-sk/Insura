# ClaimGuard AI — Real-Time Insurance Claim Risk Scoring Frontend

**IBM Z Datathon 2026**  
**Track:** Real-Time Insurance Claim Risk Scoring: Faster Payouts for Genuine Customers, Earlier Detection of Fraud  
**Role:** Member 3 — Frontend / UI Engineering  
**Target Deployment Environment:** IBM LinuxONE (`s390x`) & Containerized Cloud Ingress  

---

## 1. Executive Summary & Product Architecture

**ClaimGuard AI** is a production-grade, enterprise web application built for insurance claim adjusters, SIU (Special Investigation Unit) fraud investigators, and claims operations managers.

The frontend serves as the interactive control center connecting human adjusters to Member 1's machine learning inference pipeline and Member 2's FastAPI persistence and triage engine deployed on IBM LinuxONE architecture:

```
+---------------------------------------------------------------------------------------+
|                                    ClaimGuard AI                                      |
|                       React 19 + Vite 8 Adjuster Dashboard                            |
+---------------------------------------------------------------------------------------+
|  [Operational Overview]  |  [Claims Queue]  |  [Score Claim]  |  [Adjuster Review]    |
|  - Real KPI Widgets      |  - Multi-Filter  |  - 28 Features  |  - Decision Workflow  |
|  - Risk Tier Charts      |  - Pagination    |  - Presets Demo |  - Audit Logging      |
|  - Ingestion Stream      |  - ID Search     |  - Triage Alert |  - Status Patch       |
+---------------------------------------------------------------------------------------+
                                           |
                                           | HTTP / REST (JSON)
                                           | VITE_API_BASE_URL
                                           v
+---------------------------------------------------------------------------------------+
|                       FastAPI Backend Application (Member 2)                          |
|                       Host: IBM LinuxONE (s390x) / x86_64                             |
|       GET /dashboard/stats  |  POST /claims/score  |  PATCH /claims/{id}/review       |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                       Trained Machine Learning Model (Member 1)                       |
|                       Random Forest (150 Trees, Threshold = 0.61)                     |
+---------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Package Versions

- **Framework:** React `19.2.8` (Declarative UI with Hooks and modern StrictMode)
- **Build Tool / Bundler:** Vite `8.3.4` (Rolldown engine with optimized chunk splitting)
- **Routing:** React Router `7.18.4` (Client-side single page navigation with query parameter sync)
- **Icons:** Lucide React `1.59.0` (Consistent enterprise iconography)
- **Visual Analytics:** Recharts `3.10.1` (Responsive SVG Bar, Pie, and Feature Importance charts)
- **HTTP Client:** Fetch API with timeout controllers, error sanitization, and reviewer header injections
- **Testing Suite:** Vitest `5.0.5`, `@testing-library/react` `16.3.3`, `jsdom` `29.1.1`
- **Code Quality / Linter:** Oxlint `1.81.0` (zero syntax and import errors)
- **Containerization:** Multi-stage Dockerfile with Nginx Alpine for IBM LinuxONE (`s390x`) compatibility

---

## 3. Design System & Visual Hierarchy

The application employs an enterprise SaaS color system with high-contrast accessibility tokens defined in `src/styles/variables.css`:

| Category | Token | Color Hex | Visual Element & Semantic Meaning |
|:---|:---|:---|:---|
| **Primary Brand** | `--primary` | `#2563eb` | Blue action buttons, active navigation, brand accent |
| **Sidebar / Navy** | `--bg-sidebar` | `#0f172a` | Deep Slate 900 sidebar with IBM LinuxONE badge |
| **App Canvas** | `--bg-app` | `#f8fafc` | Soft Slate 50 background reducing visual eye fatigue |
| **Card Surface** | `--bg-card` | `#ffffff` | Clean white cards with subtle border `#e2e8f0` and shadows |
| **LOW Risk** | `--risk-low-text` | `#065f46` | Emerald `#10b981`: Fast-track eligible genuine claims |
| **MEDIUM Risk** | `--risk-med-text` | `#92400e` | Amber `#f59e0b`: Standard human review required |
| **HIGH Risk** | `--risk-high-text` | `#991b1b` | Red `#ef4444`: Priority Special Investigation Unit audit |
| **Pending Status** | `--status-pending-text`| `#5b21b6` | Violet `#7c3aed`: Awaiting initial adjuster triage |
| **Under Review** | `--status-under-text` | `#1e40af` | Blue `#3b82f6`: Active ongoing adjuster investigation |
| **Cleared Status** | `--status-cleared-text`| `#065f46` | Green `#10b981`: Approved for expedited payout |
| **Escalated Status**| `--status-escalated-text`| `#9f1239` | Rose `#f43f5e`: Formally referred to SIU unit |

> **Accessibility Standard:** Risk tiers and review statuses never rely on color alone. Each indicator includes explicit text labels (`Low Risk`, `Medium Risk`, `High Risk`) paired with distinct SVG icons (`ShieldCheck`, `AlertTriangle`, `AlertOctagon`).

---

## 4. Implemented Application Pages & Features

### 1. Overview Dashboard (`/`)
- **Live Summary Cards:** Total claims, high-risk flags, awaiting review count, cleared fast-track payouts, escalated cases, and average risk score calculated directly from `GET /dashboard/stats`.
- **Triage Tier Distribution Chart:** Interactive Recharts Bar Chart showing real count and percentages for Low, Medium, and High risk tiers.
- **Workflow Status Distribution:** Recharts Donut Pie Chart displaying operational status across human review queues.
- **Recent Ingestion Stream:** Displays the latest scored claims with live risk meters, triage badges, and an "Inspect" button opening the claim details drawer.

### 2. Claims Triage Queue (`/claims`)
- **Real-Time Data Table:** Paginated claim stream retrieved from `GET /claims`.
- **Search:** Instant client-side and ID-based claim filtering.
- **Filters:** Independent multi-select filters for Risk Tier (`LOW`, `MEDIUM`, `HIGH`) and Review Status (`PENDING_REVIEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`).
- **Pagination:** Clean page controls with items count and total page indicators.
- **Details Drawer Integration:** Clicking any row opens the side drawer without leaving the queue context.

### 3. Score a Claim Page (`/score`)
- **Complete 28-Feature Input Form:** Input controls matching Member 1's model metadata and Member 2's `ClaimModelFeatures` Pydantic model.
- **Logical Tab Grouping:**
  1. *Vehicle & Policyholder Profile* (Make, Category, Price band, Age, Deductible, Driver Rating, etc.)
  2. *Policy & Channel Information* (Policy Type, Base Policy, Agent Channel, Days Active)
  3. *Incident Circumstances* (Year, Month, Week, Day of Week, Location Area, Fault Determination)
  4. *Filing & History* (Filing Timeline, Police Report, Witnesses, Prior Claims, Supplements, Address Change)
- **Demo Presets Bar:** 3 labeled demonstration presets for Datathon presentations:
  - *Genuine Commuter (Low Risk)*
  - *Multi-Vehicle Rush Hour (Medium Risk)*
  - *Suspicious High-Value Loss (High Risk)*
- **Pre-Submission Validation:** Validates numerical ranges (e.g. Age: 16–120, Year: 1990–2030) and required selections.
- **Duplicate Prevention:** Disables submit button and shows loading state while the request is in flight.
- **Risk Assessment Result Panel (`RiskResultCard`):**
  - Displays returned Claim ID, scaled Risk Score out of 100, statistical Fraud Probability %, assigned Risk Tier, Model Version, and triage recommendation.
  - Prominently displays legal non-proof disclaimer.
  - Quick action buttons to open case in Review Center or score another claim.

### 4. Adjuster Review Center (`/reviews`)
- **Adjuster Triage Queue:** Filter claims by workflow state:
  - `Pending Adjuster Triage` (sorted descending by risk score to prioritize the highest risk cases)
  - `Under Active Audit`
  - `Escalated to SIU`
  - `Cleared for Payout`
- **Review Determination Workflow:** Update claim review status via `PATCH /claims/{claim_id}/review`.
- **Audit Logging:** Records human `reviewer_id` and persists investigation notes.
- **Model Score Protection:** Immutable model predictions; adjusters update workflow status without altering the model's objective probability scores.

### 5. Model Insights & Responsible AI Governance (`/insights`)
- **Empirical Offline Benchmark Data:** Sourced directly from Member 1's validation and held-out test evaluations (`backend/models/metrics.json`):
  - ROC-AUC: `0.8062`
  - PR-AUC: `0.2319` (vs 0.0597 baseline fraud prevalence)
  - Fraud Recall: `46.38%`
  - Precision: `18.08%`
  - Fast-Track Genuine Settlement Rate: `86.67%`
- **Confusion Matrix Visualization:** Interactive 2x2 grid displaying True Negatives (1,885), False Positives (290), False Negatives (74), and True Positives (64).
- **Feature Importance Chart:** Bar chart displaying top predictive factors (Fault determination, Base policy coverage, Vehicle category, Driver age, Deductible tier).
- **Responsible AI & Bias Governance Section:** Documents strict ethical exclusion of protected demographics (`Sex`, `MaritalStatus`, `PolicyNumber`, `RepNumber`).
- **Transparency Disclaimers:** Explicitly warns that feature importances do not imply causation and historical records may contain label skew.

### 6. System Settings & Integration (`/settings`)
- **Configurable API Host:** Live override for `VITE_API_BASE_URL` with instant health testing.
- **Live Health Diagnostics:** Interactive probe verifying `GET /health` and `GET /ready` (database and model artifact status) with roundtrip ping.
- **Development Mock Mode Toggle:** Isolated offline demo toggle with prominent warning banner.
- **Reviewer Profile Management:** Configure active reviewer audit ID (`adjuster_marcus`, `adjuster_elena`, `siu_lead_davis`).

---

## 5. Directory Structure

```
frontend/
├── public/
│   └── favicon.svg                  # SVG Favicon
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx          # Collapsible responsive sidebar with LinuxONE branding
│   │   │   ├── Topbar.jsx           # Top navigation with live API health probe and search
│   │   │   └── AppLayout.jsx        # Root application frame with demo warning banners
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx         # KPI summary cards
│   │   │   ├── RiskDistributionChart.jsx # Recharts Bar and Pie distribution charts
│   │   │   └── RecentClaimsTable.jsx# Recent claims ingestion table
│   │   ├── claims/
│   │   │   ├── ClaimsTable.jsx      # Reusable claims data table with risk meters
│   │   │   ├── ClaimForm.jsx        # 28-feature input form with validation & presets
│   │   │   ├── ClaimDetailsDrawer.jsx # Inspection drawer with feature breakdown & review patch
│   │   │   └── RiskResultCard.jsx   # Result display panel with score & ethical disclaimers
│   │   └── common/
│   │       ├── Badge.jsx            # RiskBadge and StatusBadge with icons and labels
│   │       ├── LoadingState.jsx     # Accessible loading spinner
│   │       ├── ErrorState.jsx       # Actionable error panel with retry and diagnostics
│   │       └── EmptyState.jsx       # Empty dataset presentation
│   ├── pages/
│   │   ├── DashboardPage.jsx        # Overview dashboard page
│   │   ├── ClaimsPage.jsx           # Filterable claims triage queue
│   │   ├── ScoreClaimPage.jsx       # Real-time claim scoring page
│   │   ├── ReviewCenterPage.jsx     # SIU and adjuster review workflow
│   │   ├── ModelInsightsPage.jsx    # Model metrics, confusion matrix & bias governance
│   │   └── SettingsPage.jsx         # API configuration and health diagnostics
│   ├── services/
│   │   ├── api.js                   # Dedicated REST client module
│   │   ├── mockData.js              # Development-only mock fixtures
│   │   └── modelMetricsData.js      # Genuine offline evaluation benchmarks
│   ├── data/
│   │   ├── featureSchema.js         # Complete 28-feature definitions & ethical exclusions
│   │   └── claimPresets.js          # Labeled synthetic demo claim scenarios
│   ├── styles/
│   │   ├── variables.css            # Enterprise CSS tokens (colors, tiers, shadows, radii)
│   │   └── global.css               # Global resets, typography, buttons, forms, tables
│   ├── test/
│   │   ├── setup.js                 # Vitest jsdom polyfills
│   │   ├── api.test.js              # API client and mock mode unit tests
│   │   ├── features.test.js         # Feature schema & ethical governance tests
│   │   └── components.test.jsx      # UI component tests
│   ├── App.jsx                      # React Router routes definition
│   ├── main.jsx                     # Application bootstrap
│   └── index.css                    # Imports global CSS
├── .env                             # Active environment configuration
├── .env.example                     # Environment template
├── Dockerfile                       # Multi-stage production container image
├── nginx.conf                       # Reverse proxy and SPA routing configuration
├── package.json                     # Scripts and dependencies
├── vite.config.js                   # Optimized build and chunking configuration
└── README_FRONTEND.md               # Complete engineering manual
```

---

## 6. Local Development & Build Commands

### Prerequisites
- Node.js `v20.x` or `v24.x` (Tested on Node v24.14.1, npm v11.12.1).

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env` based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```
**Test Results (Actual Run):**
```
 ✓ src/test/features.test.js (5 tests)
 ✓ src/test/api.test.js (4 tests)
 ✓ src/test/components.test.jsx (7 tests)

 Test Files  3 passed (3)
      Tests  16 passed (16)
```

### 5. Run Lint Check
```bash
npm run lint
```
OxLint verifies all 28 files with **0 errors**.

### 6. Production Build
```bash
npm run build
```
Generates production-optimized chunks in `frontend/dist/`:
- `dist/index.html` (1.11 kB)
- `dist/assets/index-Cz_1_BdU.css` (7.80 kB)
- `dist/assets/vendor-icons-*.js` (15.07 kB)
- `dist/assets/index-*.js` (116.39 kB)
- `dist/assets/vendor-react-*.js` (244.28 kB)
- `dist/assets/vendor-charts-*.js` (271.92 kB)

---

## 7. API Integration Notes for Member 2 (Backend Engineer)

The frontend communicates with the FastAPI service using the following verified endpoints:

1. **`GET /health`**
   - Verified during initial load and in Topbar connectivity monitor.
2. **`GET /ready`**
   - Verifies SQLite/PostgreSQL connectivity and ML model artifact loading.
3. **`GET /model-info`**
   - Ingests active model version (`1.0.0`), expected features list, and risk thresholds (`low_threshold: 0.427`, `high_threshold: 0.61`).
4. **`POST /claims/score`**
   - Transmits `{ claim_id, features: { 28 fields }, notes, persist: true }`.
   - Receives `{ claim_id, fraud_probability, risk_score, risk_category, requires_human_review, message, disclaimer }`.
5. **`GET /claims`**
   - Supports query filters: `risk_category`, `review_status`, `page`, `page_size`.
6. **`GET /claims/{claim_id}`**
   - Retrieves individual claim records for detailed inspection.
7. **`PATCH /claims/{claim_id}/review`**
   - Transmits `{ review_status, reviewer_id, review_notes }`.
   - Model predictions (`risk_score`, `fraud_probability`) remain protected and immutable.
8. **`GET /dashboard/stats`**
   - Serves aggregated operational counts for summary cards and Recharts distribution widgets.

---

## 8. Deployment Handover Notes for Member 4 (DevOps & LinuxONE)

The frontend is packaged for production on **IBM LinuxONE (`s390x`)** and cloud ingress:

### 1. Standalone Container Build
```bash
# Direct build on LinuxONE host
docker build -t claimguard-frontend:latest -f frontend/Dockerfile frontend/

# Multi-arch cross-build
docker buildx build --platform linux/s390x,linux/amd64 -t claimguard-frontend:latest -f frontend/Dockerfile frontend/
```

### 2. Container Execution
```bash
docker run -d \
  --name claimguard-ui \
  -p 80:80 \
  --restart unless-stopped \
  claimguard-frontend:latest
```

### 3. Ingress Reverse Proxy Configuration
The provided `frontend/nginx.conf` contains:
- `location /api/ { proxy_pass http://backend:8000/; }` for seamless single-port hosting.
- `location / { try_files $uri $uri/ /index.html; }` to support HTML5 pushState client-side routing on reload.
- Gzip compression and long-lived cache headers for static asset chunks.

---

## 9. Status of Features & Future Roadmap

| Feature | Status | Notes |
|:---|:---|:---|
| **Overview Dashboard** | Completed | Live stats from API, Recharts risk and status distribution, recent claims feed |
| **Claims Queue** | Completed | Full filtering by Risk Tier & Review Status, search by ID, pagination |
| **Real-Time Scoring Form** | Completed | All 28 features, validation, 3 synthetic presets, loading & error handling |
| **Risk Result Panel** | Completed | Displays score /100, fraud %, model version, triage next step, and disclaimer |
| **Claim Details Drawer** | Completed | Grouped feature tabs, audit timeline, and review update form |
| **Adjuster Review Center** | Completed | Dedicated triage board, status patches, notes persistence, audit identity |
| **Model Insights Page** | Completed | Genuine offline test metrics (ROC-AUC 0.806, PR-AUC 0.232), confusion matrix, feature importances, Responsible AI governance |
| **Settings & Diagnostics** | Completed | Configurable API base URL, live ping test, mock mode toggle |
| **Automated Test Suite** | Completed | 16 tests passing across 3 test files in Vitest |
| **Production Build** | Completed | Clean Vite build in 1.06s with zero lint errors |
| *Enterprise OAuth2 SSO* | Planned Future | Authentication is currently simulated via reviewer header; OAuth2 token exchange can be wired into `src/services/api.js` |
| *Batch CSV Ingestion* | Planned Future | Frontend currently scores single claims; batch scoring endpoint can be connected to a file dropzone |
