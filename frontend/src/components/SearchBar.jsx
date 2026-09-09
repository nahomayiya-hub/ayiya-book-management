import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    // Auto-search when user types (with debounce)
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim()) {
                onSearch(query);
            } else {
                onSearch('');
            }
        }, 300); // 300ms delay after typing stops

        return () => clearTimeout(delayDebounce);
    }, [query, onSearch]);

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder="Search books..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
            />
            <svg 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
    );
};

export default SearchBar;