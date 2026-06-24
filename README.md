# CareNest Application & CI (carenest-app-ci)

Welcome to the **CareNest Application** repository! This repository houses the core microservices source code and the Continuous Integration (CI) pipeline for the CareNest platform.

CareNest is a highly available, cloud-native healthcare management platform designed to streamline patient appointments, pharmacy inventory, and automated medical diagnostics using Generative AI.

## 🏗️ Architecture Flow

CareNest is built using an event-driven microservices architecture. The platform consists of the following core services:

1. **Frontend Service (React/Next.js):** The main user interface for patients, doctors, and admins.
2. **Auth Service (Node.js/Express):** Manages user registration, login, and issues JWT tokens. Integrates with Azure Cosmos DB (MongoDB API).
3. **Appointment Service (Node.js/Express):** Handles scheduling and booking. Publishes `AppointmentCreated` events to Azure Service Bus.
4. **Pharmacy Service (Node.js/Express):** Manages medication inventory and tracks stock levels.
5. **Notify Service (Node.js/Express):** Subscribes to Azure Service Bus events and dispatches email/SMS notifications.
6. **AI Microservice (Python/FastAPI):** Powered by Azure AI Foundry, providing Prescription Summaries, Symptom-to-Doctor matching, and a Doubt-Clearing Chatbot. Observability is traced via Langfuse Cloud.
7. **AIOps Agent (Python):** A Kubernetes CronJob that continuously queries Azure Log Analytics for AKS node CPU/Memory metrics. If anomalous CPU load is detected, it utilizes the Azure OpenAI LLM to analyze the metrics and fires a Slack Webhook alert to the operations team.

## 📂 Repository Structure

```text
carenest-app-ci/
├── .github/workflows/
│   └── ci.yml               # GitHub Actions pipeline for building & pushing Docker images
├── CareNest/
│   ├── frontend/            # Frontend Web UI
│   ├── services/
│   │   ├── auth/            # Auth Microservice
│   │   ├── appointment/     # Appointment Scheduling Microservice
│   │   ├── pharmacy/        # Pharmacy Inventory Microservice
│   │   ├── notify/          # Notification Microservice
│   │   ├── ai/              # AI Capabilities Microservice
│   │   └── aiops/           # AIOps Background Agent
│   └── package.json
└── README.md
```

## 🚀 Continuous Integration (CI) Pipeline

This repository uses **GitHub Actions** (`.github/workflows/ci.yml`) to manage the CI lifecycle. The pipeline triggers on every push to the `master` branch.

**Pipeline Steps:**
1. **Checkout:** Clones the repository.
2. **Azure Login:** Authenticates using OpenID Connect (OIDC) or Azure Credentials.
3. **Build & Push:** Uses `docker build` to package all microservices into containers, tagging them with the latest Git commit hash.
4. **Publish to ACR:** Pushes the images to the Azure Container Registry (`jdcarenestnewacr.azurecr.io`).
5. **Trigger CD:** Modifies the `values.yaml` in the `carenest-helm-cd` repository with the newly generated image tags, commits the changes, and pushes them to trigger ArgoCD for automated deployment.

## 💻 Local Development Setup

To run these services locally for development:

1. **Prerequisites:** 
   - Node.js (v18+)
   - Python 3.11+
   - Docker & Docker Compose
2. **Environment Variables:** 
   Ensure you have a `.env` file populated with local MongoDB URIs and standard secrets.
3. **Start Services:**
   Navigate into individual service directories and run:
   ```bash
   npm install
   npm run dev
   ```
   *For Python services, use `pip install -r requirements.txt` and `uvicorn main:app --reload`.*
