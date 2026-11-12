# MANDATE

**Financial control for AI purchasing agents.**

MANDATE sits between a shopping agent and payment rails. A business defines spending rules; the agent can discover and propose purchases, while MANDATE independently decides whether each proposal is allowed, needs a person, or must be blocked.

**Demo video:** [Watch MANDATE on YouTube](https://youtu.be/B87_4JB4V6M)

## What it demonstrates

- **Spending mandates:** Define budgets, per-transaction limits, approved merchants, categories, and human-review thresholds.
- **Deterministic policy checks:** Evaluate every proposal in code before payment. AI cannot override a failed policy check.
- **Gemini risk review:** Review intent and product data for risk and prompt injection. The model is configurable with `GEMINI_MODEL`.
- **Human authorization:** Escalate qualifying proposals for human review; no PayPal order is created until that review is approved.
- **PayPal Checkout:** Create PayPal Orders v2 Sandbox orders after policy approval. The buyer's PayPal approval and payment capture are separate steps.

## Demo scenarios

The seeded office-supplies mandate uses USD, a $100 total budget, a $100 per-transaction limit, approved merchants, and human review for electronics or purchases at or above $75.

| Proposal | Result |
| --- | --- |
| $45 toner and paper bundle from an approved supplier | Approved by policy; a PayPal Sandbox order is created and awaits buyer approval. |
| $85 office printer | Requires human approval; no PayPal order is created while approval is pending. |
| $450 copier from a blocked seller with instruction-override text | Blocked for policy violations; Gemini also identifies the prompt injection. No PayPal order is created. |

The shopping workspace uses a built-in demo catalog when Channel3 is unavailable and labels the fallback data in the UI. The recorded demo uses Sandbox only; no payment was captured.

## Set up and run locally

### Requirements

- Node.js 20 or later
- Git
- npm
- PayPal Sandbox REST app credentials for creating Sandbox orders
- A Gemini API key for live Gemini review and mandate compilation

### 1. Clone the repository and install dependencies

```powershell
git clone https://github.com/Masibonge05/MANDATE.git
cd MANDATE
npm ci
Copy-Item .env.example .env.local
```

On macOS or Linux, replace the last command with `cp .env.example .env.local`.

### 2. Configure integrations

Edit `.env.local` and add your own credentials:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Enables Gemini mandate compilation and transaction review. |
| `GEMINI_MODEL` | Optional preferred Gemini model; defaults to `gemini-4-hydrogen`, with model fallbacks. |
| `PAYPAL_CLIENT_ID` | PayPal Sandbox REST app client ID. |
| `PAYPAL_CLIENT_SECRET` | PayPal Sandbox REST app secret. Keep this server-side. |
| `PAYPAL_BASE_URL` | Optional; defaults to `https://api-m.sandbox.paypal.com`. |
| `PAYPAL_WEBHOOK_ID` | Optional; needed to verify PayPal webhooks. |
| `CHANNEL3_API_KEY` | Optional; enables live product discovery. Without it, the demo catalog is used. |
| `NEXT_PUBLIC_APP_URL` | Optional application base URL; defaults to `http://localhost:3000`. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional Supabase client settings. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-side audit bridge key. Never expose it with a `NEXT_PUBLIC_` prefix. |

`.env.local` is git-ignored. Never commit API keys, PayPal credentials, database connection strings, or other private values.

Gemini and PayPal credentials are needed to demonstrate live Gemini decisions and PayPal Sandbox checkout. Without a Channel3 key, MANDATE uses the labeled built-in demo catalog.

### 3. Start the development server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Try the end-to-end scenarios

The demo state is in memory. Before testing each scenario, go to **Settings** and select **Reset Demo State to Baseline Seed** (or use the **Reset Demo** control). This restores the office-supplies mandate and its $100 budget.

1. **Explore products:** Open **Shopping**. The office-supplies search runs automatically; with no Channel3 key, the results come from the labeled demo catalog.
2. **Allow a compliant purchase:** Find the $45 toner-and-paper bundle from Apex Office Supplies and select **Propose via MANDATE Gateway**. MANDATE evaluates the proposal and, when approved, creates a PayPal Sandbox order. Complete buyer approval in PayPal only if you intend to test checkout; order creation alone is not payment capture.
3. **Require a person:** Reset the demo, then propose the $85 office printer. It should show **Requires Approval** and should not create a PayPal order while pending. Open **Approvals** to review the request; approving it creates the Sandbox checkout order.
4. **Block an unsafe proposal:** Reset the demo, find the $450 copier listing containing instruction-override text, and propose it. MANDATE should block it for policy violations; Gemini can also identify the prompt injection. No PayPal order should be created.
5. **Review the result:** Open **Ledger** to inspect recorded decisions and transactions.

The $45 order remains pending until the Sandbox buyer approves it. A completed checkout/capture is a separate step, and the recorded demo did not capture a payment.

### 5. Run tests and build

Run the automated tests:

```powershell
npm test
```

Create a production build:

```powershell
npm run build
```

To run that build locally, use `npm start` after the build completes.

## Project areas

- `/mandates` — create and review spending mandates.
- `/shopping` — run product discovery and submit proposals to the gateway.
- `/approvals` — review eligible policy exceptions.
- `/ledger` — inspect transaction and audit details.
- `POST /api/gateway/transactions/propose` — evaluate an agent's purchase proposal.

## Demo and deployment notes

- The demo's transaction store is in memory and resets when the demo is reset or the server restarts; it is not a production ledger.
- Resetting MANDATE does not remove previously created orders from your PayPal Sandbox account.
- Configure PayPal Sandbox credentials before demonstrating order creation. A policy approval alone does not mean a buyer approved or paid an order.
- Configure Gemini and Channel3 keys using your own accounts. The application can use fallback review/catalog behavior when those services are unavailable.
- Before production use, add durable transaction storage, production-grade identity and authorization, and operational monitoring.
