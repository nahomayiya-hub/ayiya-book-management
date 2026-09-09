const db = require('../config/database');

const Borrowing = {
    // Borrow a book
    borrow: async (userId, bookId, dueDate) => {
        const [result] = await db.query(
            `INSERT INTO borrowings (user_id, book_id, due_date) 
             VALUES (?, ?, ?)`,
            [userId, bookId, dueDate]
        );
        return result.insertId;
    },

    // Return a book
    returnBook: async (borrowingId) => {
        const [result] = await db.query(
            `UPDATE borrowings 
             SET returned_date = NOW(), status = 'returned' 
             WHERE id = ?`,
            [borrowingId]
        );
        return result.affectedRows;
    },

    // Get user's current borrowings
    getUserBorrowings: async (userId) => {
        const [rows] = await db.query(`
            SELECT b.*, bk.title, bk.author, bk.image,
                   DATEDIFF(NOW(), due_date) as days_overdue
            FROM borrowings b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.user_id = ? AND b.status = 'borrowed'
            ORDER BY b.due_date ASC
        `, [userId]);
        return rows;
    },

    // Get user's borrowing history
    getBorrowingHistory: async (userId) => {
        const [rows] = await db.query(`
            SELECT b.*, bk.title, bk.author, bk.image
            FROM borrowings b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.user_id = ?
            ORDER BY b.borrowed_date DESC
        `, [userId]);
        return rows;
    },

    // Check if user already borrowed this book
    hasBorrowed: async (userId, bookId) => {
        const [rows] = await db.query(
            `SELECT * FROM borrowings 
             WHERE user_id = ? AND book_id = ? AND status = 'borrowed'`,
            [userId, bookId]
        );
        return rows.length > 0;
    },

    // Get all borrowings (admin)
    getAllBorrowings: async () => {
        const [rows] = await db.query(`
            SELECT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
            FROM borrowings b
            JOIN users u ON b.user_id = u.id
            JOIN books bk ON b.book_id = bk.id
            ORDER BY b.borrowed_date DESC
        `);
        return rows;
    }
};

module.exports = Borrowing;