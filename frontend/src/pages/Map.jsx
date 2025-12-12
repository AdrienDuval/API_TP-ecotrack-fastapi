import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import { 
    Map as MapIcon,
    Filter,
    RefreshCw,
    Info,
    Wind,
    Factory,
    Zap,
    Droplets,
    Activity,
    Thermometer
} from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getIndicatorIcon = (type) => {
    const iconConfig = {
        air_quality: { color: '#3b82f6', icon: Wind },
        co2: { color: '#ef4444', icon: Factory },
        energy: { color: '#f59e0b', icon: Zap },
        precipitation: { color: '#06b6d4', icon: Droplets },
        temperature: { color: '#f97316', icon: Thermometer },
    };
    return iconConfig[type] || { color: '#6b7280', icon: Activity };
};

export default function Map() {
    const [zones, setZones] = useState([]);
    const [indicators, setIndicators] = useState([]);
    const [zoneStats, setZoneStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        fetchData();
        // Set map ready after a short delay to ensure DOM is ready
        const timer = setTimeout(() => setMapReady(true), 100);
        return () => clearTimeout(timer);
    }, [selectedType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [zonesRes, indicatorsRes] = await Promise.all([
                api.get('/zones/', { params: { limit: 1000 } }),
                api.get('/indicators/', { 
                    params: { 
                        limit: 1000,
                        sort_by: 'timestamp',
                        order: 'desc',
                        ...(selectedType && { type: selectedType })
                    } 
                })
            ]);

            // Handle zones
            const zonesData = zonesRes.data;
            const zonesList = zonesData.items || (Array.isArray(zonesData) ? zonesData : []);
            setZones(zonesList);

            // Handle indicators
            const indicatorsData = indicatorsRes.data.items || indicatorsRes.data || [];
            setIndicators(indicatorsData);

            // Calculate zone statistics
            const stats = {};
            zonesList.forEach(zone => {
                const zoneIndicators = indicatorsData.filter(ind => ind.zone_id === zone.id);
                const latestByType = {};
                
                zoneIndicators.forEach(ind => {
                    if (!latestByType[ind.type] || new Date(ind.timestamp) > new Date(latestByType[ind.type].timestamp)) {
                        latestByType[ind.type] = ind;
                    }
                });
                
                stats[zone.id] = {
                    total: zoneIndicators.length,
                    byType: latestByType,
                    average: zoneIndicators.length > 0 
                        ? zoneIndicators.reduce((sum, ind) => sum + ind.value, 0) / zoneIndicators.length 
                        : 0
                };
            });
            setZoneStats(stats);

        } catch (error) {
            console.error('Error fetching map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const parseCoordinates = (geom) => {
        if (!geom) return null;
        const parts = geom.split(',');
        if (parts.length !== 2) return null;
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        if (isNaN(lat) || isNaN(lon)) return null;
        return [lat, lon];
    };

    const getZoneColor = (zoneId) => {
        const stats = zoneStats[zoneId];
        if (!stats || stats.total === 0) return '#9ca3af'; // gray
        
        // Color based on average air quality or temperature
        const airQuality = stats.byType['air_quality'];
        if (airQuality) {
            const value = airQuality.value;
            if (value < 50) return '#10b981'; // green - good
            if (value < 100) return '#f59e0b'; // yellow - moderate
            return '#ef4444'; // red - unhealthy
        }
        
        return '#3b82f6'; // default blue
    };

    const validZones = zones.filter(zone => parseCoordinates(zone.geom) !== null);
    const center = validZones.length > 0 
        ? parseCoordinates(validZones[0].geom) 
        : [48.8566, 2.3522]; // Default to Paris

    if (loading && zones.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading map data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Visualize zones and environmental indicators on an interactive map
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
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">Filter by type:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="air_quality">Air Quality</option>
                        <option value="co2">CO2</option>
                        <option value="energy">Energy</option>
                        <option value="temperature">Temperature</option>
                        <option value="precipitation">Precipitation</option>
                    </select>
                    <div className="ml-auto text-sm text-gray-500">
                        {validZones.length} zones with coordinates
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden relative" style={{ height: '600px', width: '100%' }}>
                {validZones.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">No zones with coordinates found</p>
                            <p className="text-gray-400 text-sm">
                                Add coordinates (latitude,longitude) to zones to display them on the map
                            </p>
                        </div>
                    </div>
                ) : mapReady ? (
                    <MapContainer
                        center={center}
                        zoom={6}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                        key={`map-${validZones.length}`}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {validZones.map((zone) => {
                            const coords = parseCoordinates(zone.geom);
                            if (!coords) return null;
                            
                            const stats = zoneStats[zone.id] || {};
                            const color = getZoneColor(zone.id);
                            
                            return (
                                <div key={zone.id}>
                                    <Circle
                                        center={coords}
                                        radius={50000} // 50km radius
                                        pathOptions={{
                                            fillColor: color,
                                            fillOpacity: 0.2,
                                            color: color,
                                            weight: 2,
                                            opacity: 0.5
                                        }}
                                    />
                                    <Marker position={coords}>
                                        <Popup>
                                            <div className="p-2 min-w-[200px]">
                                                <h3 className="font-bold text-lg mb-2 text-gray-900">
                                                    {zone.name}
                                                </h3>
                                                {zone.postal_code && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Postal Code: {zone.postal_code}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Coordinates: {zone.geom}
                                                </p>
                                                
                                                {stats.total > 0 ? (
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-semibold text-gray-700 mb-2">
                                                            Latest Indicators ({stats.total} total):
                                                        </div>
                                                        {Object.entries(stats.byType).map(([type, indicator]) => {
                                                            const iconInfo = getIndicatorIcon(type);
                                                            const IconComponent = iconInfo.icon;
                                                            return (
                                                                <div 
                                                                    key={type}
                                                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <IconComponent 
                                                                            className="h-4 w-4" 
                                                                            style={{ color: iconInfo.color }}
                                                                        />
                                                                        <span className="text-xs font-medium text-gray-700 capitalize">
                                                                            {type.replace('_', ' ')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm font-bold text-gray-900">
                                                                            {indicator.value.toFixed(2)}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {indicator.unit}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                                                            Avg: {stats.average.toFixed(2)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">
                                                        No indicators available for this zone
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                </div>
                            );
                        })}
                    </MapContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">Legend</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Good Air Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-gray-600">Moderate Air Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-600">Unhealthy Air Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">Other Indicators</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <span className="text-xs text-gray-600">No Data</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

