const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { verifyToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== CORS CONFIGURATION FOR PRODUCTION =====
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ayiya-book-management.vercel.app',
    'https://ayiya-book-management.netlify.app',
    'https://your-frontend-url.vercel.app',
    'https://your-frontend-url.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ Blocked by CORS:', origin);
            callback(null, true); // Allow all in development
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== DIRECT PAYMENT ROUTE (BEFORE bookRoutes) =====
app.post('/api/books/:bookId/pay', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;
        const { paymentMethod } = req.body;

        console.log("💰 Payment request - User:", userId, "Book:", bookId, "Method:", paymentMethod);

        const db = require('./config/database');
        const [books] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
        const book = books[0];

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // ===== DISCOUNT LOGIC =====
        let discount = 0;
        let finalAmount = 10.00;

        // Get user type from database
        const [userResult] = await db.query('SELECT user_type FROM users WHERE id = ?', [userId]);
        const userType = userResult[0]?.user_type || 'normal';

        // Apply discounts based on user type
        switch (userType) {
            case 'student':
                discount = 20; // 20% off
                break;
            case 'teacher':
                discount = 15; // 15% off
                break;
            case 'disabled':
                discount = 25; // 25% off
                break;
            case 'normal':
            default:
                discount = 0;
                break;
        }

        finalAmount = 10.00 * (1 - discount / 100);
        finalAmount = Math.round(finalAmount * 100) / 100; // Round to 2 decimal places

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

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('Ayiya Book Management API is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});