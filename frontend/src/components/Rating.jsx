import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addRating, getBookRatings } from '../services/bookService';

const Rating = ({ bookId }) => {
    const [average, setAverage] = useState(0);
    const [total, setTotal] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchRatings();
    }, [bookId]);

    const fetchRatings = async () => {
        try {
            const data = await getBookRatings(bookId);
            setAverage(data.average || 0);
            setTotal(data.total || 0);
            setUserRating(data.userRating || null);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleRating = async (rating) => {
        if (!user) {
            alert('Please login to rate books');
            return;
        }
        setLoading(true);
        try {
            const data = await addRating(bookId, rating);
            setAverage(data.average);
            setTotal(data.total);
            setUserRating(rating);
        } catch (error) {
            console.error('Error saving rating:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        const displayRating = hoverRating || userRating || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    onClick={() => handleRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={loading}
                    className={`text-3xl transition ${i <= displayRating ? 'text-yellow-400' : 'text-gray-400'} ${!user && 'cursor-not-allowed'}`}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    return (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
                <div className="flex gap-1">
                    {renderStars()}
                </div>
                <div className="text-gray-300 text-sm">
                    {average > 0 ? (
                        <>
                            <span className="font-bold text-yellow-400">{average}</span>
                            <span className="text-gray-400 ml-1">({total} reviews)</span>
                        </>
                    ) : (
                        <span className="text-gray-400">No ratings yet</span>
                    )}
                </div>
            </div>
            {userRating && (
                <p className="text-sm text-gray-400 mt-1">You rated this book {userRating} ★</p>
            )}
        </div>
    );
};

export default Rating;