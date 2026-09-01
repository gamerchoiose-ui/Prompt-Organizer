# 🚀 Prompt Organizer

<div align="center">

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38Bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tests-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

> A secure, powerful, and feature-rich web application to organize, store, search, version, and manage AI prompts in one centralized dashboard.

---

## 📌 Overview

Prompt Organizer helps developers, prompt engineers, and AI enthusiasts manage their frequently used AI prompts without searching through old chat conversations. It features robust local persistence, strict JSON import/export validation, XSS sanitization via DOMPurify, AI-powered prompt enhancement, and tag management.

---

## ✨ Features Overview

- **🏷️ Tag & Category Management**: Categorize prompts by task (e.g., Coding, Writing, Marketing) and attach custom colored tags for fast filtering.
- **🔍 Advanced Search & Filtering**: Instantly search prompts by keyword, tag, category, or favorite status.
- **📋 One-Click Copy to Clipboard**: Seamlessly copy prompt templates with dynamic variable replacement (`{{variable}}`).
- **📜 Version History**: Track prompt iterations and view historical versions.
- **📤 Import/Export with Schema Validation**: Securely export and import JSON prompt collections with robust schema validation and error checking.
- **🤖 AI Prompt Generator**: Interactively refine and expand prompts using server-side Gemini AI integration.
- **🛡️ Security & XSS Protection**: Built-in DOMPurify markdown sanitization and server-side API key handling to prevent credential leaks.

---

## 🚀 Local Setup Instructions

Follow these steps to set up and run the project locally on your machine:

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **bun** package manager

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/prompt-organizer.git
cd prompt-organizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 5. Run Tests & Linting

```bash
# Run unit tests with Vitest
npm test

# Run TypeScript type check / linter
npm run lint

# Format code with Prettier
npm run format
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | Frontend UI components and reactive state |
| **TypeScript** | Type-safe development across client and server |
| **Vite** | Fast development server and production bundler |
| **Tailwind CSS** | Responsive styling and layout |
| **Express** | Secure server-side API proxy (Gemini AI) |
| **DOMPurify** | XSS sanitization for Markdown and HTML rendering |
| **Vitest** | Unit testing framework |
| **ESLint & Prettier** | Code quality and formatting |

---

## 📁 Project Structure

```text
Prompt-Organizer/
│
├── .github/
│   ├── workflows/        # GitHub Actions (CodeQL, Deno)
│   └── dependabot.yml    # Automated dependency security updates
├── server.ts             # Express backend & Gemini API proxy
├── src/
│   ├── __tests__/        # Vitest test suites
│   ├── components/       # Modals, cards, sidebar, navbar, charts
│   ├── data/             # Initial prompt seed data
│   ├── utils/            # Security sanitization & JSON validators
│   ├── App.tsx           # Main application state & layout
│   ├── main.tsx          # React DOM entry point
│   └── types.ts          # Global TypeScript interfaces
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

