const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { verifyToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/books/:bookId/pay', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;
        const { paymentMethod } = req.body;

        const db = require('./config/database');
        const [books] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        const book = books[0];

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        let discount = 0;
        let finalAmount = 10.00;

        const [userResult] = await db.query('SELECT user_type FROM users WHERE id = ?', [userId]);
        const userType = userResult[0]?.user_type || 'normal';

        switch (userType) {
            case 'student':
                discount = 20;
                break;
            case 'teacher':
                discount = 15;
                break;
            case 'disabled':
                discount = 25;
                break;
            default:
                discount = 0;
        }

        finalAmount = 10.00 * (1 - discount / 100);
        finalAmount = Math.round(finalAmount * 100) / 100;

        const transactionId = `TXN-${Date.now()}-${userId}`;

        await db.query(
            `INSERT INTO payments (user_id, book_id, amount, payment_method, transaction_id, status) 
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [userId, bookId, finalAmount, paymentMethod, transactionId]
        );

        res.status(201).json({
            message: 'Payment successful!',
            transactionId,
            amount: finalAmount,
            bookTitle: book.title,
            discount: discount,
            userType: userType
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('Ayiya Book Management API is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});