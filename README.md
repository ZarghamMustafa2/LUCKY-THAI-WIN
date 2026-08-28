# BPEXCH / Lucky Thai Win — Cyber-Luxury Betting & Exchange Platform

A high-performance, real-time sports exchange & casino gaming platform featuring an executive command dashboard, hierarchical account & downline management system, and live game sync.

---

## 🌟 Key Features

- **Executive Command Dashboard**: Complete financial summary metrics, P/L tracking, exposure management, and live game analytics.
- **Hierarchical Downline Scoping**: Multi-tier permission architecture supporting `COMPANY`, `SUPER ADMIN`, `ADMIN`, `SUPER MASTER`, `MASTER`, and `USER` roles.
- **Role-Based Permission Security**: Strict action-button restrictions (`%` Share, `Delete`, `S` Settle Account restricted strictly to `COMPANY` role).
- **Page Refresh State Persistence**: Seamless browser refresh persistence keeping active modules, scoped views, and masking sensitive financial details until requested.
- **Game Engine & Sportsbook**: Football/Soccer, Tennis, Cricket, Horse Racing, Betfair Games, and serverless API integration.
- **Vercel Serverless Architecture**: Native clean URL routing, zero-config static hosting, and serverless API handlers.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 2. Extract & Install
```bash
# Extract the project archive (if downloaded as ZIP)
unzip BPEXCH-FINAL-PROJECT.zip -d bpexch-project
cd bpexch-project

# Install dependencies (optional development server)
npm install
```

### 3. Environment Configuration
```bash
# Copy template environment file
cp .env.example .env
```

### 4. Run Development Server
```bash
# Start local static server
npm run dev
# Or open index.html / admin.html directly in any web browser
```

---

## 🚀 GitHub Deployment Instructions

1. **Initialize Git Repository** (if creating a new repository):
   ```bash
   git init
   git add .
   git commit -m "feat: BPEXCH Final Production Release"
   ```

2. **Link & Push to Remote**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. **Security Note**: Ensure `.env` and sensitive credentials are listed in `.gitignore` and never committed to public repositories.

---

## ⚡ Vercel Deployment Instructions

1. **Import Repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
   - Select your GitHub repository (`bpexch-lucky-thai-win`).

2. **Configure Project Settings**:
   - **Framework Preset**: Other / Static HTML
   - **Root Directory**: `./` (Leave as root)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `./` (Leave default)

3. **Set Environment Variables**:
   - Add required environment variables under **Project Settings > Environment Variables** using values from `.env.example`.

4. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and deploy the application with `cleanUrls: true` and serverless API functions (`/api/ritmu`).

---

## 🛠️ Testing & Verification

Run automated test suites across the repository:
```bash
npm test
```
Or run individual test scripts:
```bash
node scratch/test_company_only_share_and_delete_buttons.js
node scratch/test_settle_account_company_only.js
```
