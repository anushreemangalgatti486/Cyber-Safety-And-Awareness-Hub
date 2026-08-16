# 🛡️ CyberShield

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

> A modern, comprehensive cybersecurity awareness and threat intelligence platform. Empowering users to identify scams, verify URLs, and protect their digital footprint using AI and Blockchain principles.

---

## 📸 Previews

| Dashboard | AI Assistant |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/600x350?text=Dashboard+Screenshot) | ![Assistant Placeholder](https://via.placeholder.com/600x350?text=AI+Assistant+Screenshot) |

*GIF Demo Placeholder: Include a 10-second GIF demonstrating the Threat Intelligence Scanner here.*

---

## 🌟 Features

- **🧠 AI Scam Analyzer**: Uses a powerful rule-based engine to dissect emails and messages for urgent triggers, financial requests, and phishing indicators.
- **🌐 Website Reputation Scanner**: Aggregates threat intelligence from VirusTotal, Google Safe Browsing, and AbuseIPDB.
- **🖼️ Evidence Scanner (OCR)**: Extracts text from uploaded screenshots using Tesseract.js to analyze hidden scams.
- **🤖 Cyber AI Assistant**: An intelligent chatbot that provides educational resources and automatically invokes internal scanners when URLs or suspicious texts are pasted.
- **⛓️ Blockchain-Inspired Integrity**: Cryptographically seals user reports using SHA-256 to ensure data immutability and detect tampering.
- **📊 Real-time Admin Dashboard**: Advanced analytics powered by Socket.io and Recharts, featuring geographical heatmaps and live traffic tracking.
- **🔐 Enterprise Security**: Dual JWT authentication (Access & Refresh tokens), HTTP-only cookies, robust CORS, and Role-Based Access Control (RBAC).

---

## 🏗️ Architecture

CyberShield utilizes a monolithic repository structured around a MERN (MongoDB, Express, React, Node) stack, augmented with Docker for seamless deployment.

For detailed system architectures, flowcharts, and ER diagrams, please view the [Architecture Documentation](docs/ARCHITECTURE.md).

### Project Folder Structure
```text
cybershield/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth & Socket contexts
│   │   ├── pages/          # Application routes (User & Admin)
│   │   └── utils/          # Helpers (export utilities, etc.)
│   ├── Dockerfile          # Nginx build for the frontend
│   └── nginx.conf          # Reverse proxy configuration
├── server/                 # Node.js Express Backend
│   ├── config/             # DB & Environment config
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & Role guards
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic (AI, OCR, Blockchain, Threat Intel)
│   ├── Dockerfile          # Node container for the backend
│   └── swagger.json        # OpenAPI documentation
├── docs/                   # Documentation & Architecture diagrams
├── docker-compose.yml      # Orchestrates Frontend, Backend, and MongoDB
└── .github/workflows/      # CI/CD pipelines
```

---

## 🚀 Getting Started

### Environment Setup

1. Copy `.env.example` to `.env` in the `server` directory.
2. Fill in the required API keys (VirusTotal, Google Safe Browsing, AbuseIPDB) and MongoDB credentials.

### Installation & Deployment

**Using Docker (Recommended for Production)**
```bash
docker compose up --build -d
```
The application will be available at `http://localhost:80`.

**Local Development**
```bash
# Terminal 1: Start Backend
cd server
npm install
npm run dev

# Terminal 2: Start Frontend
cd client
npm install
npm run dev
```

---

## 📚 API Documentation

CyberShield provides interactive Swagger documentation. Once the server is running, navigate to:

**[`http://localhost:5000/api/docs`](http://localhost:5000/api/docs)**

---

## 🔮 Future Enhancements

- Integration of a true LLM (OpenAI/Gemini) into the Cyber AI Assistant.
- Expanding Threat Intelligence to include domain age verification via WHOIS APIs.
- Migrating the blockchain integrity layer to an actual Hyperledger or Ethereum smart contract network.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and follow our coding standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
