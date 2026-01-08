# 💰 MoneyMate - Advanced Personal Finance Manager

A modern, full-stack personal finance management application built with the MERN stack (MongoDB, Express, React, Node.js). MoneyMate helps you track expenses, manage budgets, set financial goals, and gain insights into your spending habits.

![MoneyMate](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 💸 Transaction Management
- **Add, Edit, Delete Transactions** - Full CRUD operations for income and expenses
- **Multi-Currency Support** - Track transactions in USD, EUR, GBP, BDT, and more
- **Recurring Transactions** - Set up daily, weekly, monthly, or yearly recurring payments
- **Split Expenses** - Divide expenses among friends and track your share
- **Advanced Filtering** - Filter by category, date range, and transaction type
- **Notes & Categories** - Add detailed notes and custom categories
- **Export Data** - Download transactions as CSV or PDF reports

### 📊 Dashboard & Analytics
- **Real-time Overview** - View current month's income, expenses, and balance
- **Visual Charts** - Interactive pie and line charts for spending analysis
- **Smart Insights** - AI-powered spending analysis and recommendations
- **Month-over-Month Comparison** - Track spending trends

### 🎯 Goals & Budgets
- **Savings Goals** - Set and track progress toward financial goals
- **Budget Management** - Create monthly budgets by category
- **Budget Alerts** - Email and in-app notifications at 80% and 100% usage
- **Goal Progress Tracking** - Visual progress bars and completion status

### 💳 Debt & Loan Management
- **Track Liabilities** - Record money you owe (rent, loans, etc.)
- **Track Receivables** - Monitor money owed to you
- **Partial Repayments** - Record and track payment installments
- **Due Date Reminders** - Automatic email and in-app alerts 3 days before due dates
- **Payment History** - Complete record of all repayments

### 🔔 Notifications
- **In-App Notifications** - Real-time alerts for budgets and debts
- **Email Notifications** - Budget alerts and debt reminders via email
- **Notification Center** - Centralized notification management with read/unread status

### 🎨 User Experience
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Glassmorphism design with smooth animations
- **Custom Scrollbars** - Enhanced visual aesthetics

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React Icons** - Icon library
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Node-Cron** - Scheduled tasks

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/moneymate.git
cd moneymate
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Gmail Configuration for Email Notifications
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_google_app_password
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password from Google Account Settings
3. Use the App Password (not your regular password) in `GMAIL_PASS`

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory (if needed):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

**Start Backend (from server directory):**
```bash
npm run dev
```

**Start Frontend (from client directory):**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📖 Usage Guide

### Getting Started
1. **Register** - Create a new account with email and password
2. **Login** - Access your dashboard
3. **Add Transactions** - Start tracking your income and expenses
4. **Set Budgets** - Create monthly budgets for different categories
5. **Create Goals** - Set savings targets and track progress

### Key Workflows

#### Adding a Transaction
1. Navigate to **Transactions** page
2. Fill in description, amount, type (income/expense/goal)
3. Select or create a category
4. Optionally add notes, set as recurring, or split with friends
5. Click **Add Transaction**

#### Managing Debts
1. Go to **Debts & Loans** page
2. Click **Add Debt/Loan**
3. Enter description, amount, type (owed/owing), and due date
4. Track repayments by clicking the payment icon
5. Receive automatic reminders 3 days before due date

#### Viewing Reports
1. Go to **Transactions** page
2. Click **Reports** button
3. Select month and format (PDF/CSV)
4. Download your financial report

## 🔧 Configuration

### Email Notifications
Email notifications are sent for:
- Budget alerts (80% and 100% usage)
- Debt/loan due date reminders (3 days before)

Configure in `server/.env`:
```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

### Cron Jobs
The application runs two automated tasks:
- **Recurring Transactions** - Daily at midnight (00:00)
- **Debt Reminders** - Daily at 9 AM (09:00)

## 🗂️ Project Structure

```
moneymate/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── middleware/       # Custom middleware
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Protected Routes** - Middleware-based authorization
- **Input Validation** - Mongoose schema validation
- **CORS Configuration** - Controlled cross-origin requests
- **Helmet.js** - Security headers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Chart.js for beautiful data visualizations
- React Icons for comprehensive icon library
- MongoDB for flexible data storage
- The open-source community

## 📞 Support

For support, email support@moneymate.com or open an issue in the GitHub repository.

---

**Made with ❤️ by the MoneyMate Team**
