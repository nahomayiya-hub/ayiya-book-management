import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, deleteBook, searchBooks, addFavorite, removeFavorite, getFavorites } from '../services/bookService';
import { useAuth } from '../context/AuthContext';

const BookList = ({ searchQuery }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchQuery) {
            handleSearch(searchQuery);
        } else {
            fetchBooks();
        }
        if (user) {
            fetchFavorites();
        }
    }, [searchQuery, user]);

    const fetchBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const data = await searchBooks(query);
            setBooks(data);
        } catch (error) {
            console.error('Error searching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const data = await getFavorites();
            setFavorites(data.map(f => f.id));
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleFavorite = async (bookId) => {
        try {
            if (favorites.includes(bookId)) {
                await removeFavorite(bookId);
                setFavorites(favorites.filter(id => id !== bookId));
            } else {
                await addFavorite(bookId);
                setFavorites([...favorites, bookId]);
            }
            // Refresh favorites from backend
            const updated = await getFavorites();
            setFavorites(updated.map(f => f.id));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await deleteBook(id);
                setBooks(books.filter(book => book.id !== id));
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📚</span> Books Collection
                <span className="text-sm font-normal text-gray-400 ml-2">({books.length} books)</span>
            </h2>

            {books.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📖</div>
                    <p className="text-gray-400 text-lg">No books found. Try a different search!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <div 
                            key={book.id} 
                            onClick={() => navigate(`/book/${book.id}`)}
                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                {book.image ? (
                                    <img 
                                        src={book.image} 
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                                <div class="flex items-center justify-center h-full text-gray-600 text-6xl">📚</div>
                                            `;
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-6xl text-gray-600">
                                        📚
                                    </div>
                                )}

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFavorite(book.id);
                                    }}
                                    className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition ${
                                        favorites.includes(book.id)
                                            ? 'bg-yellow-500/80 text-white'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                                >
                                    {favorites.includes(book.id) ? '⭐' : '☆'}
                                </button>

                                {/* Category Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                                        {book.category || 'Uncategorized'}
                                    </span>
                                </div>
                            </div>

                            {/* Book Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-300 transition">
                                    {book.title}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">✍️ {book.author}</p>
                                {book.description && (
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                        {book.description}
                                    </p>
                                )}

                                {/* Rating Stars */}
                                <div className="flex items-center gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span 
                                            key={i} 
                                            className={`text-sm ${i < Math.round(book.average_rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="text-gray-400 text-xs ml-1">
                                        ({book.total_ratings || 0})
                                    </span>
                                </div>

                                {user?.role === 'admin' && (
                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/edit-book/${book.id}`);
                                            }}
                                            className="flex-1 bg-yellow-500/20 text-yellow-200 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500/30 transition border border-yellow-500/30"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(book.id);
                                            }}
                                            className="flex-1 bg-red-500/20 text-red-200 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition border border-red-500/30"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookList;