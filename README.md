# CloudSentinel: Cloud-Based SIEM Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**CloudSentinel** is a modern, enterprise-ready, cloud-native **Security Information and Event Management (SIEM)** platform designed for modern Security Operations Centers (SOC). It delivers real-time security telemetry ingestion, automated heuristic log normalization, rule-based threat detection using the Strategy Pattern, multi-stage cyber attack correlation, instant WebSocket alert streaming, and comprehensive incident response lifecycle management.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------+
|                               FRONTEND (SPA)                                |
|  React 19 | Vite 8 | Tailwind CSS v4 | Recharts 3 | StompJS | Lucide React   |
+-----------------------------------------------------------------------------+
                                       │ HTTP / REST  ▲ WebSocket (STOMP/SockJS)
                                       ▼              │
+-----------------------------------------------------------------------------+
|                             BACKEND API SERVER                              |
|   Spring Boot 3.3.3 | Spring Security 6 (JWT) | Spring Data JPA | Jackson   |
+-----------------------------------------------------------------------------+
            │                                                 │
            ▼                                                 ▼
+-----------------------+                         +-----------------------+
|  DETECTION ENGINE     |                         |      PERSISTENCE      |
|  6 Evaluators (Rules) |                         |  H2 Database / MySQL  |
+-----------------------+                         +-----------------------+
```

---

## Key Features

1. **Centralized Log Ingestion & Normalization**:
   - Ingests diverse telemetry across firewalls, authentication gateways, web servers, databases, and network devices.
   - Heuristically normalizes disparate naming schemas (`src`/`sourceIp`, `dst`/`destinationIp`, `user`/`username`) into a standardized schema while preserving raw JSON payloads.

2. **Real-Time Detection Engine (Strategy Pattern)**:
   - **Brute Force Detection (`FAILED_LOGINS`)**: Detects $\ge 5$ failed logins from an IP in 5 minutes.
   - **Targeted Account Takeover (`FAILED_LOGINS_SAME_USER`)**: Detects credential stuffing against specific usernames.
   - **Suspicious Port Access (`SUSPICIOUS_PORT`)**: Flags probes against high-risk ports (`22` SSH, `23` Telnet, `1433` MSSQL, `3389` RDP, `4444` Metasploit, `5900` VNC, `6667` IRC).
   - **Immediate Threat Escalation (`CRITICAL_EVENT`)**: Instant alert generation for high-impact events.
   - **Volumetric Anomaly (`REPEATED_EVENT`)**: Identifies log flooding and DoS indicators ($\ge 20$ events in 5 minutes).
   - **Multi-Stage Attack Correlation (`CORRELATION`)**: Correlates multiple failed authentications immediately followed by a successful login from the same IP (Account Takeover).
   - **Alert Cooldown & Deduplication**: Suppresses redundant alerts for the same source IP and rule to prevent SOC alert fatigue.

3. **Live SOC Dispatcher (STOMP WebSockets)**:
   - Instant push notifications to the analyst console (`/topic/alerts`, `/topic/logs`, `/topic/stats`) without manual refreshing.

4. **Incident Response & Audit Compliance**:
   - Full alert triage (`NEW` -> `ACKNOWLEDGED` -> `RESOLVED` / `FALSE_POSITIVE`).
   - Incident case tracking (`OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`).
   - Timestamped investigation notes and immutable compliance audit trails.

5. **Built-in Attack Simulation Lab**:
   - One-click attack launchpad in the UI allowing engineers to test brute force attacks, reconnaissance port scans, and credential breach correlations against the live detection pipeline.

---

## Technology Stack

### Backend
- **Runtime**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.3
- **Security**: Spring Security 6 with stateless JSON Web Tokens (JJWT 0.12.6) & BCrypt password hashing
- **Persistence**: Spring Data JPA & Hibernate 6.5
- **Databases**: H2 In-Memory Database (MySQL compatibility mode) / MySQL Connector/J
- **WebSockets**: Spring Messaging & STOMP with SockJS fallback
- **API Docs**: SpringDoc OpenAPI 3.0 / Swagger UI
- **Build**: Apache Maven 3.9.16 (bundled) with `mvnw.cmd` wrapper

### Frontend
- **Framework**: React 19.2 (Hooks, Context, Functional Components)
- **Tooling**: Vite 8.2 (Fast HMR & production bundling)
- **Styling**: Tailwind CSS v4 (dark SOC security palette: Slate, Cyan, Rose)
- **Routing**: React Router DOM v7 (protected routes and RBAC guards)
- **Charts**: Recharts 3.10 (AreaCharts, BarCharts, PieCharts)
- **Real-Time Client**: `@stomp/stompjs` and `sockjs-client`
- **HTTP Client**: Axios with JWT request/response interceptors
- **Icons**: Lucide React

---

## Quick Start & Execution

### One-Click Launch (Windows)
Double-click or run:
```cmd
run.bat
```
This script checks your environment, starts the backend on port `8088`, starts the frontend on port `5173`, and opens the browser automatically.

To stop all services:
```cmd
stop.bat
```

### Manual Execution

#### 1. Backend Server
```bash
cd backend
mvnw.cmd spring-boot:run
```
- API Base: `http://localhost:8088/api`
- Swagger UI: `http://localhost:8088/swagger-ui.html`
- H2 Console: `http://localhost:8088/h2-console` (`jdbc:h2:mem:cloudsentinel`, user: `sa`, no password)

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Default Demo Credentials

The platform automatically seeds initial SOC accounts on startup:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **SOC Administrator** | `admin@cloudsentinel.com` | `Admin@123` | Full Access (Rules, Sources, Users, Audit Logs, Analytics) |
| **Security Analyst** | `analyst@cloudsentinel.com` | `Analyst@123` | Operational Access (Dashboard, Logs, Alert Triage, Incidents) |

---

## Documentation

For full architecture diagrams, entity relationship specifications, and API documentation, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).
