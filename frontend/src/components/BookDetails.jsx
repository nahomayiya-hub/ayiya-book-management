import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, borrowBook } from '../services/bookService';
import Rating from './Rating';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [borrowing, setBorrowing] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            const data = await getBookById(id);
            setBook(data);
        } catch (error) {
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = async () => {
        if (!window.confirm('Are you sure you want to borrow this book?')) return;

        setBorrowing(true);
        try {
            const result = await borrowBook(id);
            alert(`Book borrowed successfully! Due date: ${result.dueDate}`);
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to borrow book');
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl">{error || 'Book not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Book Details Card */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
                    {/* Image */}
                    <div className="relative h-96 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {book.image ? (
                            <img 
                                src={book.image} 
                                alt={book.title}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-8xl text-gray-600">
                                📚
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <span className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full border border-white/20">
                                {book.category || 'Uncategorized'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-white mb-2">{book.title}</h1>
                        <p className="text-xl text-blue-300 mb-4">✍️ {book.author}</p>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <span className="px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300">
                                📖 {book.category || 'Uncategorized'}
                            </span>
                            <span className="px-4 py-2 bg-white/10 rounded-lg text-sm text-gray-300">
                                📅 Added: {new Date(book.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {book.description && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-white mb-3">Description</h2>
                                <p className="text-gray-300 leading-relaxed">{book.description}</p>
                            </div>
                        )}

                        {/* Rating Section */}
                        <div className="mb-6">
                            <Rating bookId={book.id} />
                        </div>

                        {/* ===== BORROW BUTTON ===== */}
                        <button
                            onClick={handleBorrow}
                            disabled={borrowing}
                            className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {borrowing ? 'Borrowing...' : '📚 Borrow Book'}
                        </button>

                        {/* ===== BUY NOW BUTTON ===== */}
                        <button
                            onClick={() => navigate(`/checkout/${book.id}`)}
                            className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                        >
                            🛒 Buy Now ($10.00)
                        </button>

                        {book.content && (
                            <div>
                                <h2 className="text-2xl font-semibold text-white mb-3">Content</h2>
                                <div className="bg-white/5 rounded-xl p-6">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{book.content}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;