const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const startCronJob = require('./utils/cronService');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();
if (process.env.NODE_ENV !== 'test') {
    startCronJob();
    const startDebtReminderJob = require('./utils/debtReminderService');
    startDebtReminderJob();
}

console.log('--- Email Service Configuration ---');
console.log('GMAIL_USER:', process.env.GMAIL_USER || 'NOT CONFIGURED');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '******** (PRESENT)' : 'NOT CONFIGURED');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('-----------------------------------');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/debts', require('./routes/debts'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('CRITICAL ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

module.exports = app;
