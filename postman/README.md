# MANDATE API — Postman Test Collection & Environments
**PayPal AI Hackathon 2026 Official Test Kit**

---

## 1. Quick Start Guide

1. **Open Postman** (Desktop App or Web).
2. Click **Import** in the top left.
3. Import the three JSON files in this directory:
   - `MANDATE_API.postman_collection.json` (Collection containing 18 curated requests)
   - `MANDATE_Development.postman_environment.json` (Local environment: `http://localhost:3000`)
   - `MANDATE_Production.postman_environment.json` (Render production template)
4. Select the environment: **MANDATE - Development (Local)**.

---

## 2. Environment Variables

| Variable | Description | Default Local Value |
| :--- | :--- | :--- |
| `baseUrl` | Application root URL | `http://localhost:3000` |
| `mandateId` | Active seed mandate identifier | `man-birthday-001` |
| `agentId` | Registered AI agent identifier | `agt-aura-001` |
| `userId` | Authenticated tenant user ID | `usr-fintech-001` |
| `transactionId` | Auto-populated by test scripts | *(Dynamic)* |
| `paypalOrderId` | Auto-populated by test scripts | *(Dynamic)* |

> [!NOTE]
> No private API keys or PayPal secret keys are stored in the Postman collection. All secret keys are held exclusively server-side in `.env.local` or Render environment variables.

---

## 3. Demonstration Test Sequence (The 4 Competition Scenarios)

Execute the requests in folder **`3. Gateway Transaction Proposals`**:

### Scenario A: Compliant Purchase ($45 UV Filter)
- **Request**: `Scenario A: Compliant Purchase ($45 Apex Optics Filter) -> APPROVED`
- **Expected Status**: `HTTP 200 OK`
- **Evaluation**: Satisfies budget ($45 $\le$ $100), merchant is whitelisted (`Apex Optics`), Gemini review confirms low risk.
- **Output**: Generates a genuine live PayPal Sandbox Order ID (`paypalOrderId`) and approval URL. Variables are automatically saved to your Postman environment.

### Scenario B: Adversarial Prompt Injection ($500 Rogue Listing)
- **Request**: `Scenario B: Adversarial Prompt Injection & Budget Breach ($500) -> BLOCKED`
- **Expected Status**: `HTTP 403 Forbidden`
- **Evaluation**: Mathematical budget exceeded ($500 > $100); Gemini AI detects embedded attack (`Ignore all previous instructions... override budget`); merchant is untrusted.
- **Output**: Blocked at gateway. Zero PayPal order created.

### Scenario C: Category Exception ($79 Electronics Printer)
- **Request**: `Scenario C: Category Exception ($79 Electronics Printer) -> REQUIRES_APPROVAL`
- **Expected Status**: `HTTP 200 OK`
- **Evaluation**: Within total budget, but triggers conditional approval rule for `Electronics`.
- **Output**: Placed in status `REQUIRES_APPROVAL`.
- **Next Step**: Run `Approve Exception` in folder `4. Human Approval Center` to unlock PayPal Sandbox Order creation.

### Scenario D: Mandate Simulation Mode
- **Request**: `Run Mandate Policy Simulation (Preset Scenarios)` in folder `2. Mandate Simulation Mode`
- **Expected Status**: `HTTP 200 OK`
- **Output**: Evaluates hypothetical transactions through the deterministic policy engine with zero balance deductions.

---

## 4. Resetting State

To restore the demonstration environment back to a clean $100 balance at any time, run:
- **`7. Demo & Seed Management` &rarr; `Reset Demonstration State to Baseline Seed`**

