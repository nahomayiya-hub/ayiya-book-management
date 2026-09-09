const db = require('../config/database');

const User = {
    // Create a new user
    create: async (name, email, hashedPassword, role = 'user') => {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        return result.insertId;
    },

    // Find user by email
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Find user by ID
    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Get all users (admin only)
    getAll: async () => {
        const [rows] = await db.query(
            'SELECT id, name, email, role, created_at FROM users'
        );
        return rows;
    }
};

module.exports = User;