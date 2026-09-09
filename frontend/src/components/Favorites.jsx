import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/bookService';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (bookId) => {
        try {
            await removeFavorite(bookId);
            setFavorites(favorites.filter(f => f.id !== bookId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">⭐ Your Favorites</h2>
            {favorites.length === 0 ? (
                <p className="text-gray-400">No favorites yet. Click ☆ on a book to add it!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => navigate(`/book/${book.id}`)}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/30 transition"
                        >
                            <h3 className="text-white font-semibold">{book.title}</h3>
                            <p className="text-gray-400 text-sm">✍️ {book.author}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(book.id);
                                }}
                                className="mt-2 text-red-400 text-sm hover:text-red-300 transition"
                            >
                                Remove ⭐
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;