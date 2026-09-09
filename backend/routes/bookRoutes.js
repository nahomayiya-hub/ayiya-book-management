const express = require('express');
const {
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
} = require('../controllers/bookController');

const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/category/:category', getBooksByCategory);
router.get('/admin/stats', verifyToken, isAdmin, getAdminStats);

// ===== RATING ROUTES =====
router.post('/:bookId/rating', verifyToken, addRating);
router.get('/:bookId/ratings', getBookRatings);

// ===== PAYMENT ROUTES =====
router.post('/:bookId/pay', verifyToken, createPayment);
router.get('/payments', verifyToken, getUserPayments);
router.get('/payments/all', verifyToken, isAdmin, getAllPayments);

// ===== FAVORITES ROUTES =====
router.post('/favorites/:bookId', verifyToken, addFavorite);
router.delete('/favorites/:bookId', verifyToken, removeFavorite);
router.get('/favorites', verifyToken, getFavorites);

// ===== BORROWING ROUTES =====
router.post('/:bookId/borrow', verifyToken, borrowBook);
router.put('/borrowings/:borrowingId/return', verifyToken, returnBook);
router.get('/borrowings', verifyToken, getUserBorrowings);
router.get('/borrowings/history', verifyToken, getBorrowingHistory);

// ===== ADMIN CRUD =====
router.post('/', verifyToken, isAdmin, addBook);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

// ===== GET BOOK BY ID (MUST BE LAST) =====
router.get('/:id', getBookById);

module.exports = router;