const cron = require('node-cron');
const Debt = require('../models/Debt');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

const startDebtReminderJob = () => {
    // Run every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('Running Debt Reminder Job...');
        try {
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            // Find debts that are due within 3 days and not fully paid
            const debts = await Debt.find({
                dueDate: { $lte: threeDaysFromNow, $gte: now }
            });

            for (const debt of debts) {
                // Calculate remaining balance
                const totalRepaid = debt.repayments.reduce((sum, r) => sum + r.amount, 0);
                const remainingBalance = debt.amount - totalRepaid;

                // Skip if already paid
                if (remainingBalance <= 0) continue;

                const daysUntilDue = Math.ceil((new Date(debt.dueDate) - now) / (1000 * 60 * 60 * 24));
                const user = await User.findById(debt.user);

                if (!user) continue;

                const message = `Reminder: Your ${debt.type === 'owed' ? 'debt' : 'loan'} "${debt.description}" of $${remainingBalance.toFixed(2)} is due in ${daysUntilDue} day(s)!`;

                // Create in-app notification
                await Notification.create({
                    user: debt.user,
                    message,
                    type: 'general',
                });

                // Send email
                try {
                    await sendEmail({
                        to: user.email,
                        subject: `Debt Reminder - ${debt.description}`,
                        text: `Hello ${user.name},\n\n${message}\n\nPlease ensure timely payment.\n\nBest regards,\nMoneyMate Team`,
                    });
                    console.log(`Debt reminder sent to ${user.email}`);
                } catch (emailErr) {
                    console.error('Failed to send debt reminder email:', emailErr);
                }
            }

            console.log(`Processed ${debts.length} debt reminders.`);
        } catch (err) {
            console.error('Error in debt reminder job:', err);
        }
    });

    console.log('Debt Reminder Job Initialized: Daily check at 09:00');
};

module.exports = startDebtReminderJob;
