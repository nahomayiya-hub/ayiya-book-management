const db = require('../config/database');

const Rating = {
    // Add or update rating
    addOrUpdate: async (userId, bookId, rating) => {
        const [result] = await db.query(
            `INSERT INTO ratings (user_id, book_id, rating) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE rating = ?`,
            [userId, bookId, rating, rating]
        );
        return result;
    },

    // Get average rating for a book
    getAverage: async (bookId) => {
        const [rows] = await db.query(
            `SELECT AVG(rating) as average, COUNT(*) as total 
             FROM ratings 
             WHERE book_id = ?`,
            [bookId]
        );
        return rows[0];
    },

    // Get user's rating for a book
    getUserRating: async (userId, bookId) => {
        const [rows] = await db.query(
            'SELECT rating FROM ratings WHERE user_id = ? AND book_id = ?',
            [userId, bookId]
        );
        return rows[0] || null;
    },

    // Get all ratings for a book
    getByBook: async (bookId) => {
        const [rows] = await db.query(
            `SELECT r.*, u.name 
             FROM ratings r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.book_id = ? 
             ORDER BY r.created_at DESC`,
            [bookId]
        );
        return rows;
    }
};

module.exports = Rating;