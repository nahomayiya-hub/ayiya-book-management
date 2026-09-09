const db = require('../config/database');

const Favorite = {
    // Add favorite
    add: async (userId, bookId) => {
        const [result] = await db.query(
            'INSERT INTO favorites (user_id, book_id) VALUES (?, ?)',
            [userId, bookId]
        );
        return result.insertId;
    },

    // Remove favorite
    remove: async (userId, bookId) => {
        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
            [userId, bookId]
        );
        return result.affectedRows;
    },

    // Get user's favorites
    getUserFavorites: async (userId) => {
        const [rows] = await db.query(`
            SELECT b.*, f.created_at as favorited_at
            FROM favorites f
            JOIN books b ON f.book_id = b.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [userId]);
        return rows;
    },

    // Check if book is favorite
    isFavorite: async (userId, bookId) => {
        const [rows] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND book_id = ?',
            [userId, bookId]
        );
        return rows.length > 0;
    }
};

module.exports = Favorite;