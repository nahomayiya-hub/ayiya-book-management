const db = require('../config/database');
const Book = require('../models/bookModel');
const Rating = require('../models/ratingModel');
const Payment = require('../models/paymentModel');
const Favorite = require('../models/favoriteModel');
const Borrowing = require('../models/borrowingModel');

// ========== ADD BOOK (Admin Only) ==========
const addBook = async (req, res) => {
    try {
        const { title, author, description, content, image, category } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const bookId = await Book.create(title, author, description, content, image, category);

        res.status(201).json({
            message: 'Book added successfully',
            bookId
        });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET ALL BOOKS ==========
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.json(books);

    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET BOOK BY ID ==========
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.getById(id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);

    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== UPDATE BOOK (Admin Only) ==========
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, description, content, image, category } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const affectedRows = await Book.update(id, title, author, description, content, image, category);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully' });

    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== DELETE BOOK (Admin Only) ==========
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const affectedRows = await Book.delete(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== SEARCH BOOKS ==========
const searchBooks = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const books = await Book.search(q);
        res.json(books);

    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET BOOKS BY CATEGORY ==========
const getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const books = await Book.getByCategory(category);
        res.json(books);

    } catch (error) {
        console.error('Get by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== ADD/UPDATE RATING ==========
const addRating = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        await Rating.addOrUpdate(userId, bookId, rating);

        const average = await Rating.getAverage(bookId);

        res.json({
            message: 'Rating saved successfully',
            average: parseFloat(average.average).toFixed(1) || 0,
            total: average.total || 0
        });

    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET BOOK RATINGS ==========
const getBookRatings = async (req, res) => {
    try {
        const { bookId } = req.params;

        const average = await Rating.getAverage(bookId);
        const ratings = await Rating.getByBook(bookId);

        let userRating = null;
        if (req.userId) {
            userRating = await Rating.getUserRating(req.userId, bookId);
        }

        res.json({
            average: parseFloat(average.average).toFixed(1) || 0,
            total: average.total || 0,
            ratings,
            userRating: userRating?.rating || null
        });

    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== ADMIN STATS ==========
const getAdminStats = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const [booksResult] = await db.query('SELECT COUNT(*) as total FROM books');
        const [usersResult] = await db.query('SELECT COUNT(*) as total FROM users');
        const [ratingsResult] = await db.query('SELECT COUNT(*) as total FROM ratings');
        const [avgRating] = await db.query('SELECT AVG(rating) as avg FROM ratings');
        const [recentBooks] = await db.query(
            'SELECT * FROM books ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            totalBooks: booksResult[0].total,
            totalUsers: usersResult[0].total,
            totalRatings: ratingsResult[0].total || 0,
            averageRating: parseFloat(avgRating[0]?.avg).toFixed(1) || 0,
            recentBooks
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== CREATE PAYMENT ==========
const createPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId, paymentMethod } = req.body;

        const book = await Book.getById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const amount = 10.00;
        const transactionId = `TXN-${Date.now()}-${userId}`;

        await Payment.create(userId, bookId, amount, paymentMethod, transactionId);

        res.status(201).json({
            message: 'Payment successful!',
            transactionId,
            amount,
            bookTitle: book.title
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET USER PAYMENTS ==========
const getUserPayments = async (req, res) => {
    try {
        const userId = req.userId;
        const payments = await Payment.getUserPayments(userId);
        res.json(payments);

    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET ALL PAYMENTS (Admin) ==========
const getAllPayments = async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const payments = await Payment.getAllPayments();
        res.json(payments);

    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== ADD FAVORITE ==========
const addFavorite = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const isFav = await Favorite.isFavorite(userId, bookId);
        if (isFav) {
            return res.status(400).json({ message: 'Already in favorites' });
        }

        await Favorite.add(userId, bookId);
        res.status(201).json({ message: 'Added to favorites' });

    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== REMOVE FAVORITE ==========
const removeFavorite = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const affected = await Favorite.remove(userId, bookId);
        if (affected === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });

    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET FAVORITES ==========
const getFavorites = async (req, res) => {
    try {
        const userId = req.userId;
        const favorites = await Favorite.getUserFavorites(userId);
        res.json(favorites);

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== BORROW BOOK ==========
const borrowBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const alreadyBorrowed = await Borrowing.hasBorrowed(userId, bookId);
        if (alreadyBorrowed) {
            return res.status(400).json({ message: 'You already borrowed this book' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const borrowingId = await Borrowing.borrow(userId, bookId, dueDate);

        res.status(201).json({
            message: 'Book borrowed successfully',
            borrowingId,
            dueDate: dueDate.toISOString().split('T')[0]
        });

    } catch (error) {
        console.error('Borrow error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== RETURN BOOK ==========
const returnBook = async (req, res) => {
    try {
        const { borrowingId } = req.params;

        const affectedRows = await Borrowing.returnBook(borrowingId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        res.json({ message: 'Book returned successfully' });

    } catch (error) {
        console.error('Return error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET USER BORROWINGS ==========
const getUserBorrowings = async (req, res) => {
    try {
        const userId = req.userId;
        const borrowings = await Borrowing.getUserBorrowings(userId);
        res.json(borrowings);

    } catch (error) {
        console.error('Get borrowings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== GET BORROWING HISTORY ==========
const getBorrowingHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await Borrowing.getBorrowingHistory(userId);
        res.json(history);

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    searchBooks,
    getBooksByCategory,
    addRating,
    getBookRatings,
    getAdminStats,
    createPayment,
    getUserPayments,
    getAllPayments,
    addFavorite,
    removeFavorite,
    getFavorites,
    borrowBook,
    returnBook,
    getUserBorrowings,
    getBorrowingHistory
};