import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BookList from './BookList';
import SearchBar from './SearchBar';
import Favorites from './Favorites';
import Borrowings from './Borrowings';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Ayiya Books</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-blue-500/20 text-blue-200 px-5 py-2 rounded-xl hover:bg-blue-500/30 transition border border-blue-500/30"
            >
              👤 Profile
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-purple-500/20 text-purple-200 px-5 py-2 rounded-xl hover:bg-purple-500/30 transition border border-purple-500/30"
                >
                  🛡️ Admin Panel
                </button>
                <button
                  onClick={() => navigate('/add-book')}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Book
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 text-red-200 px-5 py-2 rounded-xl hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}! 👋</h2>
              <p className="text-blue-200">{user?.email}</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'admin' 
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' 
                  : 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
              }`}>
                {user?.role === 'admin' ? '⚡ Admin' : '📚 User'}
              </span>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="mb-8">
          <Favorites />
        </div>

        {/* Borrowings Section */}
        <div className="mb-8">
          <Borrowings />
        </div>

        {/* Books Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <BookList searchQuery={searchQuery} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;