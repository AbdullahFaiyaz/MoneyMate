const cron = require('node-cron');
const Transaction = require('../models/Transaction');

const startCronJob = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Recurring Transaction Job...');
        try {
            const now = new Date();
            // Find transactions that are recurring AND due (nextRunDate <= now)
            const dueTransactions = await Transaction.find({
                isRecurring: true,
                nextRunDate: { $lte: now }
            });

            console.log(`Found ${dueTransactions.length} recurring transactions due.`);

            for (const originalTx of dueTransactions) {
                // 1. Create the new duplicate transaction
                const newTxData = {
                    user: originalTx.user,
                    text: originalTx.text,
                    amount: originalTx.amount,
                    type: originalTx.type,
                    category: originalTx.category,
                    notes: originalTx.notes,
                    date: new Date(), // Today
                    isRecurring: false, // Child is not recurring itself (avoids infinite loops if logic changes)
                    // recurrenceInterval: originalTx.recurrenceInterval // Optional: Keep metadata
                };

                await Transaction.create(newTxData);

                // 2. Update the original transaction's nextRunDate
                let nextDate = new Date(originalTx.nextRunDate);
                const interval = originalTx.recurrenceInterval.toLowerCase();

                if (interval === 'daily') {
                    nextDate.setDate(nextDate.getDate() + 1);
                } else if (interval === 'weekly') {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (interval === 'monthly') {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (interval === 'yearly') {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                } else {
                    // Default fallback: Monthly
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }

                originalTx.nextRunDate = nextDate;
                await originalTx.save();
                console.log(`Processed recurring tx: ${originalTx.text}. New next date: ${nextDate}`);
            }

        } catch (err) {
            console.error('Error in cron job:', err);
        }
    });

    console.log('Cron Job Initialized: Daily check at 00:00');
};

module.exports = startCronJob;
