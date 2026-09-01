# 🚀 Prompt Organizer

<div align="center">

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38Bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tests-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

> A clean workspace to organize, categorize, and manage AI prompts.

---

## 📸 Visual Preview & Workflow

<div align="center">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" alt="Prompt Organizer Dashboard & Workflow Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" />
  <p><em>Demonstrating Prompt Creation, Subfolder Categorization, and One-Click Copy-to-Clipboard Workflow.</em></p>
</div>

---

## ✨ Features Overview

- **🏷️ Tag & Category Management**: Categorize prompts by task (Coding, Writing, Marketing, etc.) and attach custom colored tags for fast filtering.
- **🔍 Advanced Search & Filtering**: Instantly search prompts by keyword, tag, category, or favorite status.
- **📋 One-Click Copy to Clipboard**: Seamlessly copy prompt templates with dynamic variable replacement (`{{variable}}`).
- **📜 Version History**: Track prompt iterations and view historical versions.
- **📤 Import/Export with Schema Validation**: Securely export and import JSON prompt collections with robust schema validation and error checking.
- **🤖 AI Prompt Generator**: Interactively refine and expand prompts using server-side Gemini AI integration.
- **🛡️ Security & XSS Protection**: Built-in DOMPurify markdown sanitization and server-side API key handling to prevent credential leaks.

---

## 🚀 Local Setup & Running

Follow these three basic commands to clone and run the project locally on your machine:

```bash
git clone https://github.com/gamerchoiose-ui/Prompt-Organizer.git
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Additional Commands

```bash
# Run unit tests with Vitest
npm test

# Run TypeScript type check / linter
npm run lint
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

