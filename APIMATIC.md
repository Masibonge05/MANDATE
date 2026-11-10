# MANDATE — APIMatic Integration & Multi-Language SDK Architecture

> **Sponsor Category**: Best Use of APIMatic  
> **PayPal AI Hackathon 2026**

---

## 1. Overview & Proposition

Autonomous purchasing agents are heterogeneous: some are built in Python (LangChain, AutoGen, CrewAI), others in TypeScript/Node.js (LlamaIndex, OpenAI Assistants API), and enterprise backends often run in Java, Go, or C#.

To allow **any** autonomous agent framework to interact with the MANDATE Financial Security Gateway seamlessly, MANDATE provides an official **OpenAPI 3.0.3 specification** (`postman/openapi.json`) fully compatible with **APIMatic**.

Using APIMatic's Developer Experience Platform, the MANDATE Gateway API can automatically generate:
- **Idiomatic SDKs** in 6 programming languages (Python, TypeScript, Java, C#, Go, Ruby).
- **Interactive Developer Portals** with live API consoles and code samples.
- **Client Libraries** with built-in retry policies, error handling, and type safety for purchasing agents.

---

## 2. API Specification Assets

| Asset | Location | Purpose |
| :--- | :--- | :--- |
| **OpenAPI 3.0.3 Specification** | [`postman/openapi.json`](./postman/openapi.json) | Full schema, parameters, responses, and security schemes for APIMatic ingestion. |
| **Postman Collection (v2.1)** | [`postman/MANDATE_API.postman_collection.json`](./postman/MANDATE_API.postman_collection.json) | 18 automated requests across 7 directories for interactive testing. |
| **Development Environment** | [`postman/MANDATE_Development.postman_environment.json`](./postman/MANDATE_Development.postman_environment.json) | Local endpoint targeting (`http://localhost:3000`). |
| **Production Environment** | [`postman/MANDATE_Production.postman_environment.json`](./postman/MANDATE_Production.postman_environment.json) | Render production targeting (`https://mandate-fintech.onrender.com`). |

---

## 3. How to Generate Client SDKs with APIMatic

### Step 1: Import OpenAPI into APIMatic
1. Log in to the [APIMatic Dashboard](https://www.apimatic.io).
2. Click **Import API** and upload `postman/openapi.json` (or provide the raw GitHub URL).
3. APIMatic validates the specification against OpenAPI 3.0 standards (0 warnings).

### Step 2: Generate SDKs for Purchasing Agents
With one click in APIMatic, generate the client SDK for your agent's language:

#### Python (for LangChain / AutoGen / CrewAI Agents)
```python
from mandate_gateway_sdk import MandateGatewayClient
from mandate_gateway_sdk.models import TransactionProposalRequest, ProductItem

client = MandateGatewayClient(base_url="https://mandate-fintech.onrender.com")

# Agent proposes purchase to MANDATE Gateway
response = client.gateway.propose_transaction(
    TransactionProposalRequest(
        agent_id="agt-crew-procurement-01",
        mandate_id="man-photo-001",
        amount=45.00,
        currency="USD",
        product=ProductItem(
            title="UV & CPL Filter Kit (67mm)",
            price=45.00,
            merchant="Apex Optics",
            category="Photography Accessories"
        ),
        user_prompt="Find a camera gift under $100"
    )
)

if response.combined_decision == "APPROVED":
    print(f"PayPal Order Generated: {response.transaction.paypal_order_id}")
    print(f"Checkout Approval URL: {response.paypal_approval_url}")
elif response.combined_decision == "BLOCKED":
    print(f"Purchase Blocked by Gateway: {response.decision_reason}")
```

#### TypeScript / Node.js
```typescript
import { MandateClient } from '@mandate/sdk';

const client = new MandateClient({
  baseUrl: process.env.MANDATE_GATEWAY_URL,
});

const proposal = await client.gateway.proposeTransaction({
  agentId: 'agt-langgraph-01',
  mandateId: 'man-photo-001',
  amount: 45.00,
  product: {
    title: 'UV Filter Kit',
    price: 45.00,
    merchant: 'Apex Optics',
  },
});
```

---

## 4. Value Delivered to the Hackathon Submission

1. **Interoperability**: Autonomous agents built with any framework (Python, Node, Go) can consume MANDATE via native, strongly-typed SDKs.
2. **Reproducibility**: APIMatic standardizes API contracts, enabling hackathon judges and evaluators to test API endpoints in their preferred tooling.
3. **Zero-Trust Enforcement**: The generated SDKs strictly enforce required schema fields (`agentId`, `mandateId`, `idempotencyKey`) before requests reach the network.
