import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/books`
});

// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getBooks = async () => {
    const res = await API.get('/');
    return res.data;
};

export const getBookById = async (id) => {
    const res = await API.get(`/${id}`);
    return res.data;
};

export const searchBooks = async (query) => {
    const res = await API.get(`/search?q=${query}`);
    return res.data;
};

export const addBook = async (bookData) => {
    const res = await API.post('/', bookData);
    return res.data;
};

export const updateBook = async (id, bookData) => {
    const res = await API.put(`/${id}`, bookData);
    return res.data;
};

export const deleteBook = async (id) => {
    const res = await API.delete(`/${id}`);
    return res.data;
};

// ===== RATINGS =====
export const addRating = async (bookId, rating) => {
    const res = await API.post(`/${bookId}/rating`, { rating });
    return res.data;
};

export const getBookRatings = async (bookId) => {
    const res = await API.get(`/${bookId}/ratings`);
    return res.data;
};

// ===== ADMIN =====
export const getAdminStats = async () => {
    const res = await API.get('/admin/stats');
    return res.data;
};

// ===== PAYMENTS =====
export const createPayment = async (bookId, paymentMethod) => {
    const res = await API.post(`/${bookId}/pay`, { paymentMethod });
    return res.data;
};

export const getUserPayments = async () => {
    const res = await API.get('/payments');
    return res.data;
};

export const getAllPayments = async () => {
    const res = await API.get('/payments/all');
    return res.data;
};

// ===== FAVORITES =====
export const addFavorite = async (bookId) => {
    const res = await API.post(`/favorites/${bookId}`);
    return res.data;
};

export const removeFavorite = async (bookId) => {
    const res = await API.delete(`/favorites/${bookId}`);
    return res.data;
};

export const getFavorites = async () => {
    const res = await API.get('/favorites');
    return res.data;
};

// ===== BORROWING =====
export const borrowBook = async (bookId) => {
    const res = await API.post(`/${bookId}/borrow`);
    return res.data;
};

export const returnBook = async (borrowingId) => {
    const res = await API.put(`/borrowings/${borrowingId}/return`);
    return res.data;
};

export const getUserBorrowings = async () => {
    const res = await API.get('/borrowings');
    return res.data;
};

export const getBorrowingHistory = async () => {
    const res = await API.get('/borrowings/history');
    return res.data;
};