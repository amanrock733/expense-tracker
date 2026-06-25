# Smart Expense Tracker

> Turn everyday spending into smarter decisions — in real time.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Prisma%20%7C%20SQLite-ff6b6b)

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

Smart Expense Tracker is a sleek, modern personal finance dashboard built to help users track income, expenses, budgets, and financial trends with ease. It blends the simplicity of a daily expense app with the intelligence of a reporting tool, giving users a clear view of where their money goes.

Whether you are managing a household budget, tracking freelance income, or building better money habits, this product makes financial awareness feel effortless and intuitive.

### Why it stands out

- ✨ Clean, minimal UI designed for focus
- 📊 Beautiful charts for monthly and yearly insights
- 🔐 Secure authentication and session-based access
- 📱 Responsive experience across desktop and mobile
- ⚡ Fast local-first performance with Next.js + Prisma

---

## Demo

### Live Demo

- 🌐 Demo URL: Coming soon
- 📸 Screenshot: Add your screenshot here
- 🎥 Video Walkthrough: Add your recording link here

### Preview Placeholder

![App Preview](https://via.placeholder.com/1200x650?text=Smart+Expense+Tracker+Preview)

---

## Features

- ✔️ Track income and expenses effortlessly
- ✔️ Add, edit, and delete transactions
- ✔️ Set monthly budgets and receive financial visibility
- ✔️ View reports by month and year
- ✔️ Secure login and registration flow
- ✔️ Beautiful analytics dashboards with charts
- ✔️ Persistent data storage with SQLite + Prisma
- ✔️ Responsive interface for everyday use

---

## Tech Stack

| Category | Tools |
|---|---|
| Frontend | ⚡ Next.js, ⚛️ React, 🎨 Tailwind CSS, 🧩 shadcn/ui |
| Backend | 🔥 Node.js, 🛡️ Next.js API Routes |
| Database | 🗄️ Prisma, SQLite |
| Auth | 🔐 JWT + Cookies |
| Tooling | 🧪 ESLint, TypeScript, npm |

---

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/your-username/smart-expense-tracker.git
cd smart-expense-tracker
npm install
```

### Environment Variables

Create a .env file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRE="7d"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Usage

### Register an Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Password123!","confirmPassword":"Password123!"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Password123!"}'
```

### Add a Transaction

You can create transactions from the dashboard UI or through the API once logged in.

---

## Folder Structure

```text
smart-expense-tracker/
├── db/
├── prisma/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   └── page.tsx
│   ├── lib/
│   ├── services/
│   └── store/
├── package.json
├── README.md
└── tsconfig.json
```

---

## Contributing

Contributions are welcome! If you want to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

Please keep code clean, documented, and beginner-friendly.

---

## License

This project is licensed under the MIT License.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Contact

Built with passion by [Your Name](https://github.com/your-username)

- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-username
- Website: https://yourwebsite.com

---

Made with ❤️ for people who want to take control of their money.
