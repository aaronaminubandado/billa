# Billa – Personal Expense Tracker

Billa is a modern web application for tracking personal finances, built with Next.js 14 and Supabase. It offers a clean, intuitive interface to manage income, expenses, budgets, and financial goals, making it an excellent tool for users and a showcase of full-stack development skills.

## 🚧 Development Status

> **Note:** This project is currently in beta. Several features are under active development:
>
> - **Responsive Design**: Mobile and tablet layouts are in progress (currently optimized for desktop)
> - **Reports**: Feature is partially implemented (export functionality coming soon)
> - **Recurring Transactions**: Basic functionality implemented, advanced options in development
> - **Insights**: Currently shows basic data, advanced analytics in progress

## ✨ Features

### Core Features (Completed)
- **Authentication**
  - Email/password login
  - OAuth (Google, GitHub) via Supabase Auth
- **Dashboard**
  - Visual overview with charts
  - Key financial metrics
- **Transactions**
  - Unified view for income and expenses
  - Custom categorization
- **Categories**
  - Customizable with colors and icons
- **Wallets/Accounts**
  - Support for multiple accounts
- **Themes**
  - Dark/light mode toggle
- **Notifications**
  - Toast and system alerts

### In Progress/Planned Features
- **Budgets**
  - Plan and visualize spending limits
- **Goals**
  - Track savings and debt repayment
- **Filtering**
  - Advanced time-based views (daily, monthly, yearly)
- **Full Responsive Design**
  - Complete mobile and tablet optimization
- **Reports**
  - Export-ready financial summaries

<!-- ## 📸 Screenshots

*Add screenshots here to showcase the dashboard, transaction forms, mobile layout, etc.*

<div align="center">
  <em>Coming soon</em>
</div> -->

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Middleware)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Styling**: TailwindCSS, Shadcn/UI
- **Charts**: Chart.js
- **Notifications**: Radix UI, Custom Toast
- **Icons**: Lucide

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Supabase account for API keys

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/aaronaminubandado/billa
cd billa
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the project root and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in your Supabase project under Project Settings → API.

#### 4. Running the Application

Start the development server:

```bash
pnpm run dev
```

Open your browser and navigate to:
http://localhost:3000

## 🌐 Live Demo

Try the deployed application at:
https://billa-beige.vercel.app

**Demo Credentials (optional)**:
- Email: demo@billa.com
- Password: test1234

## 📦 Deployment (Vercel)

1. Push the code to a GitHub repository.
2. Visit Vercel and import your repository.
3. Configure environment variables in the Vercel dashboard.
4. Click Deploy.

## 📁 Project Structure

```
├── /app            # Next.js App Router structure
├── /components     # UI and form components
├── /lib            # Supabase client and utilities
├── /hooks          # Custom React hooks
└── /types          # TypeScript definitions
```

## 🔮 Future Improvements

- Export reports as CSV or PDF
- Add PWA support for offline access
- Implement AI-driven spending insights
- Integrate with banks (e.g., Plaid)
- Complete responsive design for all device sizes
- Implement comprehensive filtering system

<!-- ## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. -->

## 📄 License

This project is licensed under the MIT License.

## 📬 Contact
www.linkedin.com/in/aaron-bandado-13749a202
aaron.aminu1@gmail.com