import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/bookService';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
                        >
                            Home
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Total Books</p>
                        <p className="text-4xl font-bold text-white">{stats?.totalBooks || 0}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Total Ratings</p>
                        <p className="text-4xl font-bold text-white">{stats?.totalRatings || 0}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">Average Rating</p>
                        <p className="text-4xl font-bold text-yellow-400">{stats?.averageRating || 0} ⭐</p>
                    </div>
                </div>

                {/* Recent Books */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">📚 Recent Books</h2>
                    {stats?.recentBooks?.length === 0 ? (
                        <p className="text-gray-400">No books added yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats?.recentBooks?.map((book) => (
                                <div key={book.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <h3 className="text-white font-semibold">{book.title}</h3>
                                    <p className="text-gray-400 text-sm">✍️ {book.author}</p>
                                    <p className="text-gray-500 text-sm">{book.category}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;