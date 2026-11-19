# 🏛️ BhuView — Integrated Land Governance Platform

> **A parcel-centric Digital Public Infrastructure prototype for modern land governance, cadastral intelligence, and inter-departmental workflow automation.**

BhuView connects synthetic Record of Rights (RoR), land ownership, registration, encumbrance, zoning, utilities, taxation, GIS cadastral mapping, explainable AI verification, document OCR intelligence, citizen service requests, and cross-departmental approval workflows around a unified **Parcel 360** identity.

---

## 📖 About the Project

### 🎯 Problem Statement
Land records and municipal property administration in many jurisdictions are deeply fragmented across disconnected departments — revenue, registration, urban planning, survey, and utilities operate in isolated data silos. This fragmentation creates title ambiguity, encourages boundary disputes, fosters fraudulent encumbrances, and forces citizens to navigate lengthy, opaque bureaucratic processes.

### 💡 The Solution
BhuView introduces a unified Digital Public Infrastructure (DPI) model centered on the "Parcel 360" identity. Every plot of land is linked to a single verifiable digital parcel identifier that consolidates legal deeds, physical spatial boundaries (3D GIS), planning zones, taxation history, and utility encumbrances. Using interactive MapLibre GL mapping, automated document OCR, and React Flow visual governance graphs, all relevant departments review and approve citizen requests on a shared, transparent audit trail.

### 🌟 Core Value Proposition
- **Unified Parcel 360 Architecture**: Consolidates legal title, spatial geometry, revenue records, and encumbrances into one authoritative parcel view.
- **Explainable AI Area Verification**: Detects spatial discrepancies and boundary disputes between registered deed documents and digitized cadastral maps.
- **Transparent Multi-Agency Governance**: Real-time cross-department workflow pipeline with granular 8-role permission controls.
- **Interactive 3D Cadastral GIS**: Hardware-accelerated 3D polygon mapping with risk overlays, extrusions, and pitch/bearing camera controls.

---

## ✨ Features

- 🗺️ **3D Interactive GIS Cadastral Map** — High-performance geospatial visualization powered by MapLibre GL with 3D polygon extrusions, pitch/bearing controls, and risk-coded parcels.
- 🤖 **Explainable AI Verification** — Automated area-mismatch detection and discrepancy scoring between registered deeds and satellite/cadastral survey plots.
- 📄 **Document Intelligence & OCR** — Client/server document processing pipeline extracting structured data from land deeds, survey maps, and revenue receipts.
- 👥 **8-Tier Role-Based Access Control** — Tailored portals for Citizen, Revenue Inspector, Registration Officer, Urban Planner, GIS Surveyor, Department Head, Data Admin, and System Admin.
- 🔄 **Cross-Departmental Workflows** — Interactive workflow orchestration with `@xyflow/react` (React Flow) visualizing end-to-end multi-agency approval stages.
- 📊 **Audit Trail & Governance Dashboards** — Tamper-evident logging and comprehensive analytics monitoring land disputes, registration velocity, and service turnarounds.
- 🔔 **Real-Time Notification Pipeline** — Instant alerts for document verification, status changes, and scheduled citizen hearings.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **GIS & Mapping** | MapLibre GL v4 |
| **Workflow Graphs** | @xyflow/react (React Flow v12) |
| **Icons & UI** | Lucide React |
| **Backend API** | FastAPI (Python 3.11+) + Uvicorn |
| **Database & Auth** | Firebase (Firestore + Auth) / SQLite demo provider |
| **Testing & Scripts** | Pytest, Python geospatial scripts (`generate_parcels.py`) |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Folder Structure

```
bhuview/
├── backend/                    # FastAPI backend service
│   ├── app/                    # API endpoints, models, routers, and services
│   ├── main.py                 # FastAPI application entrypoint
│   └── requirements.txt        # Python backend dependencies
├── frontend/                   # Frontend source modules and styles
├── docs/                       # Architecture diagrams, API specs, and schemas
├── database/                   # Seed data, sample parcels, and mock records
├── public/                     # Static assets and icons
├── generate_parcels.py         # Synthetic parcel generation script
├── validate_parcels.py         # Parcel geometry and attribute validator
├── docker-compose.yml          # Local container orchestration
├── package.json                # Frontend package configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 How to Install and Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) & `npm`
- [Python](https://www.python.org/) (v3.10+) & `pip`
- [Docker](https://www.docker.com/) (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/karthiban3333-maker/BhuView.git
cd BhuView
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
The web application will run at `http://localhost:5173`.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API documentation will be available at `http://localhost:8000/docs`.

### 4. Running with Docker Compose
```bash
docker-compose up --build
```

---

## 📸 Screenshots

> _Add screenshots here._

---

## 📄 License

This project is a private prototype built for demonstration and governance research.

---

## 👨‍💻 Author

**Karthiban A** — [Kode Prime](https://github.com/karthiban3333-maker)
