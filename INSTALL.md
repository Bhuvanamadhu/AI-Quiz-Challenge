# AI Quiz Challenge Game - Installation & Setup Manual

Follow this handbook to install dependencies, seed the SQLite database, run the backend server locally, or play immediately using the browser fallback.

---

## ⚡ Instant Play (Zero-Installation Mode)

You can launch and test the application immediately without installing Node.js:
1. Double-click the file `index.html` in your file explorer to open it in any modern web browser (Chrome, Edge, Firefox, Safari).
2. The game will automatically detect the absence of the backend server and boot into **Offline Fallback Mode**.
3. All advanced features—including register/login simulation, scoring algorithms, daily streak math, badge achievements, user profile history, and global leaderboard rankings—will operate seamlessly in-browser using `localStorage` and a local question pool.

---

## 💻 Full-Stack Production Mode Setup

To boot the full-stack version with the Express server and SQLite database:

### 1. Install Prerequisites
Make sure you have Node.js and NPM installed on your machine:
- Download Node.js from the official site: [https://nodejs.org/](https://nodejs.org/)
- Run `node -v` and `npm -v` in your command line to verify installation.

### 2. Install Project Dependencies
Open your terminal (PowerShell, Command Prompt, or terminal of choice) in the `backend/` directory of the project and execute:
```bash
cd backend
npm install
```
This installs the required packages: `express`, `cors`, `sqlite3`, `jsonwebtoken`, and `bcryptjs` (pure Javascript bcrypt).

### 3. Seed the Database with 1,000+ Questions
Initialize the SQLite database schema and generate the questions by running the seeder script:
```bash
npm run seed
```
This programmatically populates the database file (`quiz.db` in the root folder) with 1,050 high-quality technical questions across 10 categories and 3 difficulty levels.

### 4. Boot the Server
Start the Express server:
```bash
npm start
```
You should see:
```text
🚀 AI Quiz Challenge Backend running on port 5000
🔗 Access the web app at: http://localhost:5000
```

### 5. Access the Web App
Open your web browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## ⚙️ Accessing the Admin Console

1. In the full-stack mode, the very first user who registers through the Sign Up form is automatically granted the **Admin** role. Subsequent user registrations will receive the **User** role.
2. Log in with your admin user credentials.
3. A red **⚙️ Admin Console** button will appear on your player dashboard card.
4. Click this button to open the management suite, where you can search the SQLite repository, edit/delete questions, add custom new questions, view the user table list, and manage accounts.
5. *(Note: If playing in the browser fallback/offline mode, registering a user named "admin" will unlock the admin console simulator).*
