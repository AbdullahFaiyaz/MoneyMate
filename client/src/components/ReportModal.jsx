import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';
import jsPDF from 'jspdf'; // eslint-disable-line no-unused-vars
import autoTable from 'jspdf-autotable';
import { MdClose, MdFileDownload, MdPictureAsPdf } from 'react-icons/md';

const ReportModal = ({ onClose }) => {
    const { currency, convert, formatAmount } = useCurrency();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const generateReport = async (format) => {
        setLoading(true);
        try {
            // Calculate Date Range for Month
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0).toISOString(); // Last day of month

            const res = await axios.get('/api/transactions', {
                params: { startDate, endDate }
            });

            const transactions = res.data.data;

            if (transactions.length === 0) {
                alert("No transactions found for this period.");
                setLoading(false);
                return;
            }

            if (format === 'csv') {
                downloadCSV(transactions);
            } else if (format === 'pdf') {
                downloadPDF(transactions);
            }

        } catch (err) {
            console.error(err);
            alert("Error generating report");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = (transactions) => {
        const headers = ['Date', 'Description', 'Type', 'Category', `Amount (${currency})`, 'Notes'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                new Date(t.date).toLocaleDateString(),
                `"${t.text}"`,
                t.type,
                t.category,
                convert(t.amount).toFixed(2),
                `"${t.notes || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Monthly_Report_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = (transactions) => {
        const doc = new jsPDF();

        // 1. Header
        doc.setFontSize(20);
        doc.text(`Monthly Report: ${month}/${year}`, 14, 22);

        // 2. Summary Calculation
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const netSavings = totalIncome - totalExpense;

        // 3. Summary Section
        doc.setFontSize(12);
        doc.text(`Total Income: ${formatAmount(convert(totalIncome))}`, 14, 32);
        doc.text(`Total Expense: ${formatAmount(convert(totalExpense))}`, 14, 38);
        doc.text(`Net Savings: ${formatAmount(convert(netSavings))}`, 14, 44);

        // 4. Table
        const tableColumn = ["Date", "Description", "Cat.", "Type", "Amount", "Notes"];
        const tableRows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.text,
            t.category,
            t.type,
            formatAmount(convert(t.amount)),
            t.notes || ''
        ]);


        autoTable(doc, {
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Primary color match
            styles: { fontSize: 8 },
        });

        doc.save(`Monthly_Report_${month}_${year}.pdf`);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000, backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ width: '400px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>Report Generator</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem' }}><MdClose /></button>
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ padding: '0.5rem' }}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        min="2020" max="2030"
                        style={{ padding: '0.5rem', width: '80px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => generateReport('csv')}
                        disabled={loading}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary-color)' }}>
                        <MdFileDownload /> CSV
                    </button>
                    <button
                        onClick={() => generateReport('pdf')}
                        disabled={loading}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MdPictureAsPdf /> PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
