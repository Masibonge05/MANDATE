# MANDATE Production Deployment Guide: Render

> **Step-by-step deployment specification for hosting MANDATE on Render (Web Service)**  
> *PayPal AI Hackathon 2026 Reference Document*

---

## 1. Overview & Architecture on Render

MANDATE is a full-stack Next.js 15 application running on Node.js. On Render, MANDATE deploys as a **Web Service**. It serves:
- React 19 Frontend (Dashboard, Mandate Studio, Shopping Agent, Ledger, Approvals)
- Next.js Edge & Node.js API Routes (`/api/gateway/transactions/propose`, `/api/paypal/*`, `/api/webhooks/paypal`, etc.)
- Server-to-server integrations with **PayPal Sandbox REST API v2**, **Google Gemini AI Engine**, **Channel3 API**, and **Supabase PostgreSQL**.

---

## 2. Prerequisites

Before starting deployment, ensure you have:
1. A **GitHub account** containing the `mandate` repository.
2. A **Render account** ([render.com](https://render.com)).
3. A **PayPal Developer account** ([developer.paypal.com](https://developer.paypal.com)) with Sandbox access:
   - REST API App credentials (`Client ID` and `Secret`).
   - Sandbox Business account (facilitator).
   - Sandbox Personal buyer account.
4. A **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com/app/apikey)).
5. *(Optional)* A **Channel3 API Key** ([channel3.ai](https://channel3.ai)) for live product search.
6. *(Optional)* A **Supabase Project** ([supabase.com](https://supabase.com)) with PostgreSQL credentials for persistent cross-session storage (otherwise in-memory repository is active).

---

## 3. Render Web Service Creation Steps

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation bar and select **Web Service**.
3. Under **Connect a repository**, choose GitHub, locate your `mandate` repository, and click **Connect**.
4. Configure the service parameters:
   - **Name**: `mandate-gateway` (or your preferred name, e.g. `mandate-fintech`)
   - **Region**: Choose the region closest to your users/database (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **Branch**: `master` (or `main`)
   - **Root Directory**: Leave blank (repository root).
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Starter` (recommended) or `Free` (ensure at least 512MB RAM).

---

## 4. Environment Variables Configuration

In your Render Service settings, navigate to the **Environment** tab. Add the following environment variables.

> [!IMPORTANT]
> Never commit actual credentials to Git. Use the Render Environment Variables interface to supply live secrets.

### Complete Environment Variables Reference

| Variable Name | Required | Scope | Description & Sample Value |
|:---|:---:|:---:|:---|
| `NODE_ENV` | Yes | Server | Set to `production`. |
| `NODE_VERSION` | Yes | Build/Server | Set to `20.18.0` or `22.13.0` (Next.js 15 requirement). |
| `NEXT_PUBLIC_APP_URL` | Yes | Public & Server | The public Render URL, e.g., `https://mandate-gateway.onrender.com` (no trailing slash). |
| `PAYPAL_CLIENT_ID` | Yes | Server-only | PayPal Developer Sandbox REST App Client ID. |
| `PAYPAL_CLIENT_SECRET` | Yes | Server-only | PayPal Developer Sandbox REST App Secret. |
| `PAYPAL_BASE_URL` | Yes | Server-only | `https://api-m.sandbox.paypal.com` |
| `PAYPAL_WEBHOOK_ID` | Yes | Server-only | Webhook ID obtained after registering your Render endpoint in PayPal Dashboard (see Section 6). |
| `PAYPAL_SANDBOX_BUSINESS_ACCOUNT` | Optional | Server-only | Sandbox merchant facilitator email address. |
| `PAYPAL_SANDBOX_BUYER_ACCOUNT` | Optional | Server-only | Sandbox personal buyer test account email address. |
| `GEMINI_API_KEY` | Yes | Server-only | Google AI Studio Gemini API key. |
| `GEMINI_MODEL` | Optional | Server-only | Gemini model identifier (defaults to `gemini-3.5-flash-lite`, fallback `gemini-2.5-flash`). |
| `CHANNEL3_API_KEY` | Optional | Server-only | Channel3 Product Discovery API key (if omitted, verified photography catalogue is used). |
| `DATABASE_URL` | Optional | Server-only | Supabase PostgreSQL connection string (`postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Public & Server | Supabase project URL (`https://[PROJECT-REF].supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public & Server | Supabase anon/public API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-only | Supabase service role secret (bypasses RLS for secure server-side auditing). |

---

## 5. Configuring PayPal Return and Cancel URLs

When an agent proposes an approved transaction, MANDATE creates a PayPal order server-side via the PayPal Orders v2 API. The buyer is directed to PayPal's checkout modal or approval URL:

- **Return URL**: Constructed dynamically as:  
  `${NEXT_PUBLIC_APP_URL}/checkout/success?orderId={id}&txId={txId}`  
  This URL handles buyer confirmation and triggers server-side capture verification.
- **Cancel URL**: Constructed dynamically as:  
  `${NEXT_PUBLIC_APP_URL}/api/paypal/cancel-order?token={token}`  
  When a buyer cancels checkout at PayPal, this endpoint atomically releases the reserved budget and marks the transaction `CANCELLED`.

> [!NOTE]
> Ensure `NEXT_PUBLIC_APP_URL` exactly matches your Render Web Service URL (e.g., `https://mandate-gateway.onrender.com`) without a trailing slash.

---

## 6. Registering the PayPal Webhook

PayPal webhooks deliver asynchronous server-to-server notifications for lifecycle events (`PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, etc.).

### Step-by-Step Webhook Registration:
1. Navigate to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Click on your **Sandbox REST App**.
3. Scroll down to the **Webhooks** section and click **Add Webhook**.
4. Set the **Webhook URL** to:
   ```
   https://your-service.onrender.com/api/webhooks/paypal
   ```
5. Select the following event types:
   - `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
   - `Payment capture denied` (`PAYMENT.CAPTURE.DENIED`)
   - `Checkout order approved` (`CHECKOUT.ORDER.APPROVED`)
6. Click **Save**.
7. Copy the generated **Webhook ID** (e.g. `9AB12345CD67890EF`).
8. Return to your Render Dashboard -> Service -> **Environment** tab.
9. Set `PAYPAL_WEBHOOK_ID` to this Webhook ID and trigger a manual redeploy (or click **Save Changes**).

---

## 7. Webhook Signature Verification

MANDATE validates incoming PayPal webhooks using PayPal's cryptographic verification endpoint (`/v1/notifications/verify-webhook-signature`).

When PayPal posts an event to `/api/webhooks/paypal`, MANDATE extracts:
- `PAYPAL-TRANSMISSION-ID`
- `PAYPAL-TRANSMISSION-TIME`
- `PAYPAL-TRANSMISSION-SIG`
- `PAYPAL-CERT-URL`
- `PAYPAL-AUTH-ALGO`

MANDATE forwards these headers along with `PAYPAL_WEBHOOK_ID` and the raw event payload to PayPal for signature confirmation. Unauthenticated or forged webhooks are rejected with `HTTP 401 Unauthorized` before any state transition occurs.

---

## 8. Post-Deployment Verification Checklist

Once the Render build succeeds and your service displays **Live**:

### 1. Health & Catalog API Check
Run from your local terminal:
```bash
curl -I https://your-service.onrender.com/api/products
```
*Expected response*: `HTTP/1.1 200 OK` with JSON array of products.

### 2. Verify Frontend UI
Open `https://your-service.onrender.com` in your browser:
- The top **Hackathon Evaluation Bar** should appear in dark navy (`#001C48`).
- Active Mandates should list the seeded `$100.00` Sister Photography Gift Mandate.
- Navigation links to Dashboard, Mandates, AI Shopping, Approvals, and Security Ledger should load instantaneously.

### 3. Execute Demonstration Scenarios
1. **Scenario A (Compliant Gift)**:
   - Click **Scenario A: Compliant Gift** in the evaluation bar.
   - The transaction ($45.00 UV Filter Kit) is evaluated by Deterministic Policy and Gemini AI Reviewer.
   - Outcome: `APPROVED` -> PayPal Sandbox order created.
   - Navigate to `/ledger` to verify the order entry and audit trail.
2. **Scenario B (Adversarial Prompt Injection)**:
   - Click **Scenario B: Prompt Injection**.
   - Outcome: `BLOCKED` immediately at the gateway. Dual-layer defense detects prompt override and budget overrun. 0 PayPal API calls.
3. **Scenario C (Human Exception)**:
   - Click **Scenario C: Human Exception**.
   - Outcome: `REQUIRES_APPROVAL`. Routed to `/approvals`. Click **Approve Exception** to release authorization and generate PayPal Sandbox order.

---

## 9. Troubleshooting Common Deployment Failures

### Issue 1: Webhook Signature Verification Fails (`HTTP 401`)
- **Cause**: Incorrect `PAYPAL_WEBHOOK_ID` or mismatched `NEXT_PUBLIC_APP_URL`.
- **Fix**: Verify that the Webhook ID in the PayPal Dashboard matches `PAYPAL_WEBHOOK_ID` on Render. Ensure test events sent from the PayPal Webhook Simulator use the registered webhook ID.

### Issue 2: Next.js Build Out-Of-Memory (OOM) on Free Tier
- **Cause**: Node.js heap exhaustion during static optimization.
- **Fix**: Add the environment variable `NODE_OPTIONS=--max-old-space-size=1024` on Render.

### Issue 3: PayPal Return/Cancel Redirects to `localhost:3000`
- **Cause**: `NEXT_PUBLIC_APP_URL` was not set during build or runtime.
- **Fix**: Set `NEXT_PUBLIC_APP_URL=https://your-service.onrender.com` in Render environment variables and redeploy.

### Issue 4: Gemini Rate Limit or Missing API Key
- **Cause**: `GEMINI_API_KEY` missing or quota exhausted.
- **Fix**: MANDATE includes a built-in heuristic security analyzer that automatically activates if the Gemini API call fails, ensuring uninterrupted evaluation. For production, ensure your Gemini key has active quota.

### Issue 5: Supabase Database Connection Timeout
- **Cause**: Transaction pooler port mismatch (port 5432 vs 6543) or IP restriction.
- **Fix**: Use the Supabase Transaction Pooler connection string (`port 6543`) with `pgbouncer=true`. If Supabase credentials are omitted, MANDATE smoothly falls back to its in-memory repository with atomic locks.
