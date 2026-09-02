# SMART AI-POWERED EDUCATIONAL QUIZ AND PERFORMANCE TRACKING SYSTEM

## System Specification

This section outlines the hardware and software environments required for the development, deployment, and execution of the "Smart AI-Powered Educational Quiz and Performance Tracking System." The configurations reflect the actual technologies, frameworks, and tools used throughout the project.

### Hardware Configuration

The system is designed with a lightweight architecture, ensuring low resource utilization on both the server and client sides.

#### 1. Development & Hosting Server Environment
* **Processor (CPU):** Intel Core i3 or equivalent (Minimum); Intel Core i5 or AMD Ryzen 5 and above (Recommended).
* **System Memory (RAM):** 4 GB RAM (Minimum); 8 GB RAM and above (Recommended).
* **Storage Space:** 500 MB of available solid-state storage (SSD) or hard drive space (for Node.js runtime, project source files, and local dependencies).
* **Network Capability:** Standard broadband internet connection (broadband/fiber) with a minimum bandwidth of 2 Mbps (required for accessing remote cloud databases, Supabase APIs, and external CDNs).

#### 2. Client Device Environment (End User)
* **Processor (CPU):** Dual-core processor with a clock rate of 1.5 GHz or higher.
* **System Memory (RAM):** 2 GB RAM (Minimum); 4 GB RAM and above (Recommended).
* **Display Resolution:** 320x568 (Mobile view minimum) up to 1920x1080 (Desktop full-screen recommended).
* **Audio Hardware:** Built-in speakers or headphone jack (necessary for rendering synthesizer-generated chimes, win fanfares, and interaction sound effects via HTML5 Web Audio API).

***

### Software Configuration

The software environment comprises the technologies powering the client-side user interface, backend application programming interface (API) server, database management, and hosting/deployment configurations.

#### 1. Frontend Technologies
* **Structure & Markup:** HTML5 (HyperText Markup Language) for structuring user views.
* **Styling & Presentation:** Vanilla CSS3 (Cascading Style Sheets) utilizing fluid layouts (CSS Grid, Flexbox), custom variables, responsive media queries, and glassmorphic panels.
* **Client-Side Logic:** Vanilla JavaScript (ECMAScript 6+) implementing a custom router, client-side offline mock fallback simulation, state engine, and an Audio Synthesizer Engine using the HTML5 **Web Audio API**.
* **External Client Libraries (via CDN):**
  * `canvas-confetti` (v1.6.0) for particle trophy celebrations.
  * `jspdf` (v2.5.1) and `html2canvas` (v1.4.1) for on-the-fly certificate generation and download.
  * Google Fonts API (fetching *Inter* and *Outfit* typography).

#### 2. Backend Environment
* **Runtime Environment:** Node.js (v20.11.1 win-x64 portable environment packed locally in `node-env`, supporting system-installed Node.js runtimes).
* **Server Framework:** Express.js (v4.19.2) for setting up REST API routes, static client serving, and middleware routing.
* **Authorization & Authentication:** JSON Web Tokens (`jsonwebtoken` v9.0.2) paired with password hashing via `bcryptjs` (v2.4.3).
* **Utility Libraries:**
  * `cors` (v2.8.5) for enabling Cross-Origin Resource Sharing.
  * `dotenv` (v17.4.2) for secure environment configuration.
  * `ws` (v8.21.1) for enabling WebSocket connections in Node environments.
  * `nodemailer` (v9.0.3) for transactional email dispatches.

#### 3. Database Management & Services
* **Production Database Engine:** Supabase Platform (utilizing `@supabase/supabase-js` client SDK v2.110.8), wrapping a cloud PostgreSQL relational database with Row Level Security (RLS) policies, database triggers, and custom stored procedures.
* **Local / Development Database Engine:** SQLite3 (utilizing `sqlite3` driver v5.1.7) mapping database configurations to the local `quiz.db` file (with 1,000+ seeded questions).

#### 4. Deployment & System Scripts
* **Cloud Platform Routing:** Vercel serverless integration (`vercel.json`, `api/index.js`).
* **Automation & Setup Scripts:** PowerShell scripts (`setup.ps1` for automatic Node.js download, dependency setup, and seeder execution; `run.ps1` and `start_server.ps1` for port cleanup and execution management).
* **Launcher Script:** Windows Command line batch wrapper (`run.bat`).
