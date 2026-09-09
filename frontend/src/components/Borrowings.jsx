import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBorrowings, returnBook } from '../services/bookService';

const Borrowings = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const fetchBorrowings = async () => {
        try {
            const data = await getUserBorrowings();
            setBorrowings(data);
        } catch (error) {
            console.error('Error fetching borrowings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (borrowingId) => {
        if (window.confirm('Are you sure you want to return this book?')) {
            try {
                await returnBook(borrowingId);
                setBorrowings(borrowings.filter(b => b.id !== borrowingId));
                alert('Book returned successfully!');
            } catch (error) {
                console.error('Error returning book:', error);
            }
        }
    };

    if (loading) {
        return <div className="text-center text-gray-400">Loading borrowings...</div>;
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📚 My Borrowings</h2>
            
            {borrowings.length === 0 ? (
                <p className="text-gray-400">You haven't borrowed any books yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {borrowings.map((borrowing) => (
                        <div key={borrowing.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            {borrowing.image && (
                                <img 
                                    src={borrowing.image} 
                                    alt={borrowing.title}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                            )}
                            <h3 className="text-white font-semibold">{borrowing.title}</h3>
                            <p className="text-gray-400 text-sm">✍️ {borrowing.author}</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Due: {new Date(borrowing.due_date).toLocaleDateString()}
                            </p>
                            {borrowing.days_overdue > 0 && (
                                <p className="text-red-400 text-sm">
                                    ⚠️ {borrowing.days_overdue} days overdue
                                </p>
                            )}
                            <button
                                onClick={() => handleReturn(borrowing.id)}
                                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Return Book
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Borrowings;