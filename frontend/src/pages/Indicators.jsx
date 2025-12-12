import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Filter, 
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    X,
    Save
} from 'lucide-react';

export default function Indicators() {
    const { user } = useAuth();
    // Indicators state
    const [indicators, setIndicators] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 20,
        has_next: false,
        has_prev: false
    });
    
    // Zones and Sources for dropdowns
    const [zones, setZones] = useState([]);
    const [sources, setSources] = useState([]);
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    
    // Filters and sorting
    const [filters, setFilters] = useState({
        type: '',
        zone_id: '',
        from_date: '',
        to_date: ''
    });
    const [sorting, setSorting] = useState({
        sort_by: 'timestamp',
        order: 'desc'
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState(null);
    const [formData, setFormData] = useState({
        type: '',
        value: '',
        unit: '',
        timestamp: '',
        zone_id: '',
        source_id: '',
        extra_data: {}
    });

    useEffect(() => {
        fetchData();
        fetchZonesAndSources();
    }, [filters, sorting, pagination.skip, pagination.limit]);

    const fetchZonesAndSources = async () => {
        try {
            const [zonesRes, sourcesRes] = await Promise.all([
                api.get('/zones/', { params: { limit: 1000 } }),
                api.get('/sources/', { params: { limit: 1000 } })
            ]);
            setZones(zonesRes.data.items || zonesRes.data);
            setSources(sourcesRes.data.items || sourcesRes.data);
        } catch (error) {
            console.error('Error fetching zones/sources:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                skip: pagination.skip,
                limit: pagination.limit,
                sort_by: sorting.sort_by,
                order: sorting.order,
                ...(filters.type && { type: filters.type }),
                ...(filters.zone_id && { zone_id: parseInt(filters.zone_id) }),
                ...(filters.from_date && { from: filters.from_date }),
                ...(filters.to_date && { to: filters.to_date })
            };

            const response = await api.get('/indicators/', { params });
            const data = response.data;
            
            setIndicators(data.items);
            setPagination({
                total: data.total,
                skip: data.skip,
                limit: data.limit,
                has_next: data.has_next,
                has_prev: data.has_prev
            });
        } catch (error) {
            console.error('Error fetching indicators:', error);
            alert('Error fetching indicators');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this indicator?')) return;

        setDeleting(id);
        try {
            await api.delete(`/indicators/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting indicator:', error);
            alert('Error deleting indicator');
        } finally {
            setDeleting(null);
        }
    };

    const handleCreate = () => {
        setEditingIndicator(null);
        setFormData({
            type: '',
            value: '',
            unit: '',
            timestamp: new Date().toISOString().slice(0, 16),
            zone_id: '',
            source_id: '',
            extra_data: {}
        });
        setShowModal(true);
    };

    const handleEdit = (indicator) => {
        setEditingIndicator(indicator);
        setFormData({
            type: indicator.type,
            value: indicator.value.toString(),
            unit: indicator.unit,
            timestamp: new Date(indicator.timestamp).toISOString().slice(0, 16),
            zone_id: indicator.zone_id.toString(),
            source_id: indicator.source_id.toString(),
            extra_data: indicator.extra_data || {}
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: formData.type,
                value: parseFloat(formData.value),
                unit: formData.unit,
                timestamp: new Date(formData.timestamp).toISOString(),
                zone_id: parseInt(formData.zone_id),
                source_id: parseInt(formData.source_id),
                extra_data: formData.extra_data
            };

            if (editingIndicator) {
                await api.put(`/indicators/${editingIndicator.id}`, payload);
            } else {
                await api.post('/indicators/', payload);
            }
            
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving indicator:', error);
            alert(error.response?.data?.detail || 'Error saving indicator');
        }
    };

    const handlePageChange = (newSkip) => {
        setPagination(prev => ({ ...prev, skip: newSkip }));
    };

    const handleSortChange = (field) => {
        setSorting(prev => ({
            sort_by: field,
            order: prev.sort_by === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const resetFilters = () => {
        setFilters({
            type: '',
            zone_id: '',
            from_date: '',
            to_date: ''
        });
        setPagination(prev => ({ ...prev, skip: 0 }));
    };

    const getSortIcon = (field) => {
        if (sorting.sort_by !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sorting.order === 'asc' 
            ? <TrendingUp className="h-4 w-4 text-blue-600" />
            : <TrendingDown className="h-4 w-4 text-blue-600" />;
    };

    if (loading && indicators.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading indicators...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Indicators</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and manage environmental indicators
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Indicator
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Indicator Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => {
                                setFilters({ ...filters, type: e.target.value });
                                setPagination(prev => ({ ...prev, skip: 0 }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="air_quality">Air Quality</option>
                            <option value="co2">CO2</option>
                            <option value="energy">Energy</option>
                            <option value="temperature">Temperature</option>
                            <option value="precipitation">Precipitation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zone
                        </label>
                        <select
                            value={filters.zone_id}
                            onChange={(e) => {
                                setFilters({ ...filters, zone_id: e.target.value });
                                setPagination(prev => ({ ...prev, skip: 0 }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Zones</option>
                            {zones.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filters.from_date}
                            onChange={(e) => {
                                setFilters({ ...filters, from_date: e.target.value });
                                setPagination(prev => ({ ...prev, skip: 0 }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filters.to_date}
                            onChange={(e) => {
                                setFilters({ ...filters, to_date: e.target.value });
                                setPagination(prev => ({ ...prev, skip: 0 }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select
                            value={sorting.sort_by}
                            onChange={(e) => setSorting({ ...sorting, sort_by: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="timestamp">Timestamp</option>
                            <option value="value">Value</option>
                            <option value="type">Type</option>
                            <option value="created_at">Created At</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={() => setSorting({ ...sorting, order: sorting.order === 'asc' ? 'desc' : 'asc' })}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {sorting.order === 'asc' ? (
                            <>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Ascending
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-4 w-4 mr-2" />
                                Descending
                            </>
                        )}
                    </button>

                    <button
                        onClick={resetFilters}
                        className="ml-auto px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Indicators Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Indicators
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({pagination.total} total)
                            </span>
                        </h3>
                        <div className="text-sm text-gray-500">
                            Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortChange('value')}
                                >
                                    <div className="flex items-center gap-2">
                                        Value
                                        {getSortIcon('value')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zone
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSortChange('timestamp')}
                                >
                                    <div className="flex items-center gap-2">
                                        Timestamp
                                        {getSortIcon('timestamp')}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {indicators.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No indicators found. Try adjusting your filters or create a new indicator.
                                    </td>
                                </tr>
                            ) : (
                                indicators.map((indicator) => (
                                    <tr 
                                        key={indicator.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {indicator.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {indicator.value.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">{indicator.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {zones.find(z => z.id === indicator.zone_id)?.name || `Zone #${indicator.zone_id}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(indicator.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user?.role === 'admin' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(indicator)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(indicator.id)}
                                                        disabled={deleting === indicator.id}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title="Delete"
                                                    >
                                                        {deleting === indicator.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">View only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Rows per page:</span>
                                <select
                                    value={pagination.limit}
                                    onChange={(e) => {
                                        setPagination(prev => ({ 
                                            ...prev, 
                                            limit: parseInt(e.target.value),
                                            skip: 0
                                        }));
                                    }}
                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(Math.max(0, pagination.skip - pagination.limit))}
                                    disabled={!pagination.has_prev}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4 inline mr-1" />
                                    Previous
                                </button>
                                
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {Math.floor(pagination.skip / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(pagination.skip + pagination.limit)}
                                    disabled={!pagination.has_next}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 inline ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {editingIndicator ? 'Edit Indicator' : 'Create Indicator'}
                                    </h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select type</option>
                                            <option value="air_quality">Air Quality</option>
                                            <option value="co2">CO2</option>
                                            <option value="energy">Energy</option>
                                            <option value="temperature">Temperature</option>
                                            <option value="precipitation">Precipitation</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Value *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Timestamp *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.timestamp}
                                            onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Zone *
                                            </label>
                                            <select
                                                value={formData.zone_id}
                                                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select zone</option>
                                                {zones.map((zone) => (
                                                    <option key={zone.id} value={zone.id}>
                                                        {zone.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Source *
                                            </label>
                                            <select
                                                value={formData.source_id}
                                                onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select source</option>
                                                {sources.map((source) => (
                                                    <option key={source.id} value={source.id}>
                                                        {source.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {editingIndicator ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

