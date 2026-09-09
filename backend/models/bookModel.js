const db = require('../config/database');

const Book = {
    // Create a new book (admin only)
    create: async (title, author, description, content, image, category) => {
        const [result] = await db.query(
            `INSERT INTO books (title, author, description, content, image, category) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, author, description, content, image, category]
        );
        return result.insertId;
    },

    // Get all books with average rating
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT b.*, 
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
            FROM books b
            LEFT JOIN ratings r ON b.id = r.book_id
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `);
        return rows;
    },

    // Get a single book by ID with average rating
    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT b.*, 
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
            FROM books b
            LEFT JOIN ratings r ON b.id = r.book_id
            WHERE b.id = ?
            GROUP BY b.id
        `, [id]);
        return rows[0];
    },

    // Update a book (admin only)
    update: async (id, title, author, description, content, image, category) => {
        const [result] = await db.query(
            `UPDATE books 
             SET title = ?, author = ?, description = ?, content = ?, image = ?, category = ?
             WHERE id = ?`,
            [title, author, description, content, image, category, id]
        );
        return result.affectedRows;
    },

    // Delete a book (admin only)
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // Search books by title, author, or category with average rating
    search: async (query) => {
        const searchTerm = `%${query}%`;
        const [rows] = await db.query(`
            SELECT b.*, 
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
            FROM books b
            LEFT JOIN ratings r ON b.id = r.book_id
            WHERE b.title LIKE ? OR b.author LIKE ? OR b.category LIKE ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, [searchTerm, searchTerm, searchTerm]);
        return rows;
    },

    // Get books by category with average rating
    getByCategory: async (category) => {
        const [rows] = await db.query(`
            SELECT b.*, 
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings
            FROM books b
            LEFT JOIN ratings r ON b.id = r.book_id
            WHERE b.category = ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, [category]);
        return rows;
    }
};

module.exports = Book;