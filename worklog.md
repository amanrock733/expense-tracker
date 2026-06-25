# Worklog — Smart Expense Tracker

---
Task ID: 1
Agent: main
Task: Build full-stack Smart Expense Tracker (MERN-style spec adapted to Next.js 16 + Prisma + JWT)

Work Log:
- Initialized Next.js 16 fullstack project via `Skill(command="fullstack-dev")` + `init-fullstack.sh`
- Installed dependencies: bcryptjs, jsonwebtoken, jspdf, xlsx + their @types
- Defined Prisma schema: User (with monthlyBudget, darkMode) + Transaction (with userId, title, amount, category, type, date, description) + indexes; ran `bun run db:push`
- Built `src/lib/auth.ts`: JWT sign/verify using `jsonwebtoken`, bcrypt hash/compare, httpOnly cookie helpers
- Built `src/lib/validations.ts`: Zod schemas for register (name>=3, email, password>=8, confirm match), login, transaction (amount>0, future date blocked, required fields), profile; 11 categories (7 expense + 4 income)
- Built `src/lib/format.ts`: currency formatter (₹ INR), savings percent with divide-by-zero guard, budget alert levels (80%/90%/100% -> warning/high/exceeded), date range helpers (today/week/month/year/custom)
- Built `src/lib/session.ts`: getAuthUser middleware helper
- Built API routes:
  - POST /api/auth/register, login, logout; GET /api/auth/me
  - GET/POST /api/transactions with search, category/type/date filters, sorting, pagination
  - GET/PUT/DELETE /api/transactions/[id]
  - GET /api/reports/monthly (totals, highest category, category breakdown, transactions)
  - GET /api/reports/yearly (monthly aggregation, savings trend, totals)
  - GET/PUT /api/profile (joined date, total transactions, budget update)
- Built Zustand store (`src/store/app-store.ts`): user, view, transactions, pagination, search, filters, darkMode
- Built API service layer (`src/services/api.ts`) with typed wrappers
- Built components:
  - Layout: AppShell, Navbar, Sidebar, ThemeToggle
  - Auth: AuthView (split-screen marketing + Login/Register tabs with form validation)
  - Dashboard: SummaryCards (income/expense/balance/savings%), BudgetAlert, DashboardView (pie/bar/line charts + recent transactions)
  - Transactions: FiltersBar (search with debounce, date/category/type filters, custom date range), TransactionTable (with edit/delete + confirmation modal), TransactionForm (add/edit modal with RHF + Zod), TransactionsView (pagination, sorting, filters)
  - Charts: PieChart (expense distribution), BarChart (monthly income vs expense), LineChart (savings trend) using recharts
  - Reports: ReportsView with month/year selectors, summary cards, highest category banner, 3 charts, PDF export (jsPDF) and Excel export (xlsx via Blob+anchor download)
  - Profile: ProfileView (account info card + update form for name and monthly budget)
- Wired main page.tsx as SPA with view-state switching between dashboard/transactions/reports/profile
- Updated layout.tsx with ThemeProvider, Toaster (sonner + shadcn), proper metadata

Stage Summary:
- Fixed critical bug: jsonwebtoken doesn't export SignJWT (that's jose). Replaced with `jwt.sign()` / `jwt.verify()` API.
- Fixed dark mode: AppShell useEffect was overriding theme on every render. Changed to only sync theme once on login (using user?.id as dep).
- Improved Excel export: replaced `XLSX.writeFile` with `XLSX.write` + Blob + anchor download for better browser compatibility.
- Lint passes cleanly (0 errors, 0 warnings).
- Browser-verified end-to-end:
  - Register/Login flow with JWT cookie auth
  - Dashboard renders summary cards, charts (pie/bar/line), recent transactions
  - Add transaction modal with type-dependent category list
  - Edit transaction (pre-fills form, updates table on save)
  - Delete transaction with confirmation dialog
  - Search with 500ms debounce
  - Filters: date (today/week/month/year/custom), category, type
  - Budget alert system: 80% warning, 90% high, 100% exceeded (verified with 115% spend)
  - Profile update (name + monthly budget)
  - PDF export generates valid 1-page PDF with summary, breakdown, transactions
  - Excel export uses Blob download
  - Dark mode toggle works and persists to localStorage
- API-level edge cases verified:
  - income=0 -> savingsPercent returns 0 (no divide-by-zero)
  - amount <= 0 -> rejected with "Amount must be greater than 0"
  - future dates -> rejected with "Future dates are not allowed"
- All requirements from spec covered: auth, dashboard, transactions CRUD, search, filters, charts (pie/bar/line), reports (monthly/yearly), PDF/Excel export, profile, budget alerts, dark mode, responsive design, JWT httpOnly cookies, bcrypt password hashing, Zod validation, edge cases.
