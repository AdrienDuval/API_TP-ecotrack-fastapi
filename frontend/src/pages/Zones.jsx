import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    Plus, 
    Edit, 
    Trash2, 
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Save,
    Globe
} from 'lucide-react';

export default function Zones() {
    const { user } = useAuth();
    // Zones state
    const [zones, setZones] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 20,
        has_next: false,
        has_prev: false
    });
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        postal_code: '',
        geom: ''
    });

    useEffect(() => {
        fetchData();
    }, [pagination.skip, pagination.limit]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                skip: pagination.skip,
                limit: pagination.limit
            };

            const response = await api.get('/zones/', { params });
            const data = response.data;
            
            // Handle both paginated and non-paginated responses
            if (data.items) {
                setZones(data.items);
                setPagination({
                    total: data.total,
                    skip: data.skip,
                    limit: data.limit,
                    has_next: data.has_next,
                    has_prev: data.has_prev
                });
            } else {
                // Fallback for non-paginated response
                setZones(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
            alert('Error fetching zones');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this zone?')) return;

        setDeleting(id);
        try {
            await api.delete(`/zones/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert(error.response?.data?.detail || 'Error deleting zone');
        } finally {
            setDeleting(null);
        }
    };

    const handleCreate = () => {
        setEditingZone(null);
        setFormData({
            name: '',
            postal_code: '',
            geom: ''
        });
        setShowModal(true);
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            postal_code: zone.postal_code || '',
            geom: zone.geom || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                ...(formData.postal_code && { postal_code: formData.postal_code }),
                ...(formData.geom && { geom: formData.geom })
            };

            if (editingZone) {
                await api.put(`/zones/${editingZone.id}`, payload);
            } else {
                await api.post('/zones/', payload);
            }
            
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving zone:', error);
            alert(error.response?.data?.detail || 'Error saving zone');
        }
    };

    const handlePageChange = (newSkip) => {
        setPagination(prev => ({ ...prev, skip: newSkip }));
    };

    if (loading && zones.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading zones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Zones</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and manage geographic zones
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
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Zone
                        </button>
                    )}
                </div>
            </div>

            {/* Zones Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            <Globe className="h-5 w-5 inline mr-2" />
                            Zones
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({pagination.total || zones.length} total)
                            </span>
                        </h3>
                        {pagination.total > 0 && (
                            <div className="text-sm text-gray-500">
                                Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Postal Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coordinates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {zones.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No zones found. Create a new zone to get started.
                                    </td>
                                </tr>
                            ) : (
                                zones.map((zone) => (
                                    <tr 
                                        key={zone.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {zone.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {zone.postal_code || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {zone.geom || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(zone.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user?.role === 'admin' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(zone)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(zone.id)}
                                                        disabled={deleting === zone.id}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        title="Delete"
                                                    >
                                                        {deleting === zone.id ? (
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
                                        {editingZone ? 'Edit Zone' : 'Create Zone'}
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
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="e.g., Paris"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="e.g., 75000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Coordinates (lat,lon)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.geom}
                                            onChange={(e) => setFormData({ ...formData, geom: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="e.g., 48.8566,2.3522"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Format: latitude,longitude (e.g., 48.8566,2.3522)
                                        </p>
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
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {editingZone ? 'Update' : 'Create'}
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

