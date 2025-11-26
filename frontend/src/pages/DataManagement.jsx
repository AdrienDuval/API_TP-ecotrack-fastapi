import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Trash2, Edit2, Plus, Filter } from 'lucide-react';

export default function DataManagement() {
    const [indicators, setIndicators] = useState([]);
    const [zones, setZones] = useState([]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: '', zone_id: '' });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const [indicatorsRes, zonesRes, sourcesRes] = await Promise.all([
                api.get('/indicators/', { params: filter }),
                api.get('/zones/'),
                api.get('/indicators/')  // Get sources from a dedicated endpoint if you have one
            ]);

            setIndicators(indicatorsRes.data);
            setZones(zonesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIndicator = async (id) => {
        if (!confirm('Are you sure you want to delete this indicator?')) return;

        try {
            await api.delete(`/indicators/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting indicator:', error);
        }
    };

    const handleDeleteZone = async (id) => {
        if (!confirm('Are you sure you want to delete this zone? This will also delete all associated indicators.')) return;

        try {
            await api.delete(`/zones/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Cannot delete zone with existing indicators');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage environmental indicators and zones.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="air_quality">Air Quality</option>
                        <option value="co2">CO2</option>
                        <option value="energy">Energy</option>
                        <option value="temperature">Temperature</option>
                        <option value="precipitation">Precipitation</option>
                    </select>

                    <select
                        value={filter.zone_id}
                        onChange={(e) => setFilter({ ...filter, zone_id: e.target.value })}
                        className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">All Zones</option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Zones Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Zones ({zones.length})
                    </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {zones.map((zone) => (
                            <div key={zone.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{zone.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{zone.postal_code || 'No postal code'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteZone(zone.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Indicators Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Indicators ({indicators.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {indicators.slice(0, 100).map((indicator) => (
                                <tr key={indicator.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                            {indicator.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {indicator.value.toFixed(2)} {indicator.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        Zone #{indicator.zone_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(indicator.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteIndicator(indicator.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {indicators.length > 100 && (
                    <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                        Showing first 100 of {indicators.length} indicators
                    </div>
                )}
            </div>
        </div>
    );
}
