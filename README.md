# 🐝 HoneyChain

**"From Hive to Home, Verified at Every Step."**

A blockchain-based honey traceability and smart beekeeping management platform, built for **Smart India Hackathon 2026 — SIH26021**.

HoneyChain connects rural beekeepers, an AI-powered hive monitoring layer, a blockchain-backed traceability system, and a public QR-based consumer verification page into one integrated product.

---

## Architecture

```
React Frontend (Vite + Tailwind)
        |
Node.js / Express API  ──────►  Python FastAPI AI Service (scikit-learn)
        |                              (disease-risk + yield prediction)
   PostgreSQL Database
        |
Solidity Smart Contract (Hardhat) ──► Blockchain (local / Polygon Amoy)
```

- **Frontend**: React + Vite + Tailwind CSS, Recharts for charts
- **Backend**: Node.js + Express, JWT auth, PostgreSQL via `pg`
- **AI Service**: Python + FastAPI + scikit-learn (RandomForest models)
- **Blockchain**: Solidity smart contract + Hardhat + ethers.js
- **Database**: PostgreSQL
- **IoT layer**: Simulated sensor data generator (designed so real sensors can POST to the same API later)

See `SIH_MASTER_PROMPT.md` for the full original specification this build follows.

---

## Project Structure

```
honeychain/
├── frontend/         React app (beekeeper + admin dashboards, consumer verification page)
├── backend/          Express API (auth, hives, batches, traceability, QR, blockchain glue)
├── ai-service/       FastAPI service (hive health + yield prediction models)
├── blockchain/       Solidity contract, Hardhat config, deploy script, tests
├── database/         SQL schema + demo data seeder
├── docker-compose.yml (optional local Postgres)
└── .env.example
```

---

## Setup (local development)

### 0. Prerequisites
Node.js 18+, Python 3.10+, PostgreSQL 14+ (or Docker).

### 1. Database
```bash
# Option A: Docker
docker compose up -d postgres

# Option B: local Postgres — create a database named "honeychain",
# then run:
psql -U postgres -d honeychain -f database/schema/schema.sql
```

### 2. Environment variables
```bash
cp .env.example .env
# edit .env — fill in DATABASE_URL, JWT_SECRET, etc.
```
The backend and blockchain packages read from this root `.env`.

### 3. Backend
```bash
cd backend
npm install
npm run dev          # http://localhost:5000
```

### 4. Seed demo data
```bash
cd backend
npm run seed         # populates beekeepers, apiaries, hives, batches, and hive H017 (abnormal demo hive)
```
Demo logins (created by the seed script):
- Admin: `admin@honeychain.gov.in` / `admin123`
- Beekeeper: `rajesh.patel@honeychain.in` / `password123`

### 5. AI service
```bash
cd ai-service
python -m venv venv && source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app/services/train_models.py               # trains + saves the two models
uvicorn app.main:app --reload --port 8000          # http://localhost:8000
```
If the AI service isn't running, the backend automatically falls back to a rule-based heuristic so the rest of the app keeps working.

### 6. Blockchain (optional but recommended for the full demo)
```bash
cd blockchain
npm install
npx hardhat node                       # keep this running in its own terminal — local chain on :8545
npx hardhat run scripts/deploy.js --network localhost
# copy the printed contract address into CONTRACT_ADDRESS in .env,
# and set DEPLOYER_PRIVATE_KEY to one of the private keys hardhat node prints on startup
```
If blockchain isn't configured, the backend runs in "DB-only mode" — batches and events are still recorded, just without an on-chain hash — so the demo never breaks if the chain isn't set up in time.

### 7. Frontend
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

---

## Demo Flow (for SIH judges)

1. Open the landing page → **Verify Honey** / **Beekeeper Login**
2. Login as `rajesh.patel@honeychain.in`
3. Open **Hives** → click into a hive → show live sensor chart, AI disease risk %, predicted yield
4. Click **🚨 Simulate Anomaly (Demo)** → watch the AI risk score spike and a high-risk alert appear
5. Go to **Honey Batches → Create Batch** → record a harvest → batch ID generated (e.g. `HC-2026-AHM-0013`) and written to the blockchain
6. Open the batch's **Traceability** tab → step through HARVESTED → EXTRACTED → PROCESSED → PACKAGED → DISTRIBUTED, each recorded on-chain
7. Open **QR Code** tab → download/print the QR
8. Open `/verify/<batchId>` in a new (logged-out) tab → this is what a consumer sees after scanning the QR: full traceability timeline + blockchain verification status
9. Login as `admin@honeychain.gov.in` → **KVIC Dashboard** → show national stats and cluster-level breakdown (including hive **H017**, seeded as an intentionally high-risk hive)

---

## Important product principles

- **AI is estimative, not diagnostic.** All disease-risk output is labeled "AI-estimated" — this is a prototype trained on synthetic environmental/behavioral data, not a substitute for laboratory or veterinary diagnosis.
- **Blockchain verifies integrity, not purity.** The chain proves recorded traceability events haven't been tampered with; it does not and cannot prove chemical purity or the absence of adulteration — that requires lab testing.
- **IoT is simulated by design** for this prototype, but the sensor endpoint (`POST /api/hives/:hiveId/simulate`, and the underlying sensor_data table) is shaped so real hardware can post readings the same way in a future phase.

---

## What was intentionally left out (see the original spec for rationale)

Mobile app, real physical sensors/hardware, lab-grade adulteration detection, payments, e-commerce, mainnet deployment, deep learning models, and a general-purpose AI chatbot were all explicitly out of scope for this hackathon prototype.
