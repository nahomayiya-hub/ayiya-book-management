const db = require('../config/database');

const Payment = {
    // Create a new payment
    create: async (userId, bookId, amount, paymentMethod, transactionId) => {
        const [result] = await db.query(
            `INSERT INTO payments (user_id, book_id, amount, payment_method, transaction_id, status) 
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [userId, bookId, amount, paymentMethod, transactionId]
        );
        return result.insertId;
    },

    // Get user's payments
    getUserPayments: async (userId) => {
        const [rows] = await db.query(`
            SELECT p.*, b.title, b.author 
            FROM payments p
            JOIN books b ON p.book_id = b.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);
        return rows;
    },

    // Get all payments (admin)
    getAllPayments: async () => {
        const [rows] = await db.query(`
            SELECT p.*, u.name as user_name, b.title as book_title
            FROM payments p
            JOIN users u ON p.user_id = u.id
            JOIN books b ON p.book_id = b.id
            ORDER BY p.created_at DESC
        `);
        return rows;
    }
};

module.exports = Payment;