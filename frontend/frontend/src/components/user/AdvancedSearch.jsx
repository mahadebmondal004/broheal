import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const AdvancedSearch = ({ onSearch, categories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        duration: '',
        rating: ''
    });

    const handleSearch = () => {
        onSearch({
            search: searchTerm,
            ...filters
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            duration: '',
            rating: ''
        });
        setSearchTerm('');
        onSearch({});
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search services..."
                    className="input-field pl-10 pr-12"
                />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </h4>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Category */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Categories</option>
                                {categories?.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Price (₹)
                            </label>
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                placeholder="0"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Price (₹)
                            </label>
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                placeholder="10000"
                                className="input-field"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                            </label>
                            <select
                                value={filters.duration}
                                onChange={(e) => handleFilterChange('duration', e.target.value)}
                                className="input-field"
                            >
                                <option value="">Any</option>
                                <option value="30">30 min</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                            </select>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Rating
                            </label>
                            <select
                                value={filters.rating}
                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                                className="input-field"
                            >
                                <option value="">Any</option>
                                <option value="4">4+ ⭐</option>
                                <option value="4.5">4.5+ ⭐⭐</option>
                            </select>
                        </div>
                    </div>

                    <button onClick={handleSearch} className="btn-primary w-full">
                        Apply Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
