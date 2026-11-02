# MANDATE System Architecture & Technical Specifications

> **The Financial Control and Security Layer for Autonomous AI Agents**  
> *PayPal AI Hackathon 2026 Architectural Reference Document*

---

## 1. Executive Summary

Autonomous AI agents are increasingly tasked with product sourcing, service provisioning, and transactional execution. However, giving an AI agent direct access to payment credentials creates catastrophic business risks: **prompt injection vulnerabilities**, **budget overrun hallucinations**, **merchant spoofing**, and **rogue purchasing**.

**MANDATE** introduces an independent financial authorization and security gateway between AI agents and underlying payment rails (PayPal Developer Platform).

```
[ AI Agent ] 
     │ (1. Proposal Only - No Payment Credentials)
     ▼
┌────────────────────────────────────────────────────────┐
│               MANDATE SECURITY GATEWAY                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Layer 1: Deterministic Policy Engine (Code Rules)│  │
│  │ • Cents-precision budget arithmetic              │  │
│  │ • Strict Merchant Whitelists / Blocklists        │  │
│  │ • Expiration timestamps & category bounds        │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Layer 2: AI Risk & Intent Reviewer (Gemini 2.5)  │  │
│  │ • Adversarial Prompt Injection Defense           │  │
│  │ • Intent alignment verification                  │  │
│  │ • Price anomaly detection                        │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Human Approval Centre (Exceptions & High Risk)   │  │
│  └──────────────────────────────────────────────────┘  │
│                           │ (Atomic Reservation)       │
└───────────────────────────┼────────────────────────────┘
                            │ (2. Server-side Order)
                            ▼
           ┌──────────────────────────────────┐
           │ PayPal Developer Orders API v2   │
           │ • Sandbox Order Creation         │
           │ • Buyer Approval Flow            │
           │ • Server Capture & Verification  │
           └──────────────────────────────────┘
                            │
                            ▼
           ┌──────────────────────────────────┐
           │ Immutable Security Audit Ledger  │
           │ • AG Grid Enterprise View        │
           └──────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### Pillar 1: Zero Agent Payment Authority
The shopping agent (and any future connected agent) **never receives raw PayPal credentials or direct payment authority**. It can only submit transaction proposals to `POST /api/gateway/transactions/propose`.

### Pillar 2: The Two-Layer Security Separation
- **Layer 1: Deterministic Rules Engine (Non-AI)**:
  Financial permissions, spending limits, merchant whitelists, and remaining budget arithmetic are evaluated in pure TypeScript code using integer cents to prevent floating-point anomalies. **An LLM is never permitted to calculate, relax, or override spending limits.**
- **Layer 2: AI Intent & Risk Reviewer (Gemini 2.5 Flash)**:
  Inspects the untrusted product listing and agent notes for adversarial attacks (prompt injection, jailbreaking, instructions commanding the agent to ignore rules), intent drift, and pricing anomalies.

### Pillar 3: Combined Decision Matrix
| Deterministic Engine | AI Reviewer | Final Gateway Outcome | Financial Action |
|:---|:---|:---|:---|
| **FAILED** (Budget/Merchant) | Any | **BLOCKED** | Reject, 0 PayPal calls |
| **PASSED** | Prompt Injection Detected | **BLOCKED** | Reject, 0 PayPal calls |
| **PASSED** | High Risk / Anomaly | **BLOCKED** | Security Alert |
| **PASSED** | Intent Mismatch / Medium | **REQUIRES_APPROVAL** | Reserved atomically, routed to Human Review |
| **REQUIRES_APPROVAL** (e.g. Electronics) | Clean | **REQUIRES_APPROVAL** | Reserved atomically, routed to Human Review |
| **PASSED** | Clean / Low Risk | **APPROVED** | Ready for PayPal Sandbox Checkout |

---

## 3. Financial Consistency & Concurrency Protection

To prevent race conditions where multiple parallel agent requests exhaust the same mandate budget simultaneously:
1. **Atomic Reservation**: When a transaction is proposed and passes or enters human review, the required amount is reserved in `reservedAmount`.
2. **Atomic Release**: If the user rejects an approval request or the transaction fails, `reservedAmount` is immediately credited back.
3. **Atomic Commit**: Only when PayPal Sandbox confirms capture on the server is `reservedAmount` decremented and `spentAmount` incremented.

---

## 4. PayPal Sandbox Lifecycle Integration

MANDATE performs authenticated, server-to-server operations:
1. **OAuth2 Bearer Token**: Generated via `POST /v1/oauth2/token` with `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
2. **Order Creation**: `POST /v2/checkout/orders` with idempotency headers (`PayPal-Request-Id: mandate-tx-{id}`).
3. **Buyer Approval**: User confirms order in standard PayPal checkout.
4. **Server Capture**: `POST /v2/checkout/orders/{id}/capture` verifies funds captured.
5. **Webhook Ingestion**: `POST /api/webhooks/paypal` verifies event authenticity and deduplicates event processing.

---

## 5. Technology Stack Summary

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, AG Grid Community 33, Lucide Icons.
- **Backend**: Next.js Server-Side Route Handlers, REST API architecture.
- **AI Integration**: Google Gemini 2.5 Flash with structured Zod schema validation.
- **Payment Engine**: PayPal Developer REST APIs (v2/checkout/orders, capture, webhooks).
- **Database**: PostgreSQL (Supabase schema with Row Level Security) and in-memory transactional fallback store.

