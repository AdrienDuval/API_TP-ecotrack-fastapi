import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { 
    Wind, 
    Droplets, 
    Zap, 
    Factory, 
    TrendingUp, 
    TrendingDown,
    Globe,
    Activity,
    Calendar,
    AlertCircle
} from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, color, trend, index = 0 }) => {
    const colorConfig = {
        blue: { 
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
            text: 'text-blue-600',
            iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            shadow: 'shadow-blue-200/50'
        },
        red: { 
            bg: 'bg-gradient-to-br from-red-50 to-red-100', 
            text: 'text-red-600',
            iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
            shadow: 'shadow-red-200/50'
        },
        yellow: { 
            bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', 
            text: 'text-yellow-600',
            iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
            shadow: 'shadow-yellow-200/50'
        },
        cyan: { 
            bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', 
            text: 'text-cyan-600',
            iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
            shadow: 'shadow-cyan-200/50'
        },
        green: { 
            bg: 'bg-gradient-to-br from-green-50 to-green-100', 
            text: 'text-green-600',
            iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
            shadow: 'shadow-green-200/50'
        },
        purple: {
            bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
            text: 'text-purple-600',
            iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
            shadow: 'shadow-purple-200/50'
        }
    };
    
    const colors = colorConfig[color] || colorConfig.blue;
    
    return (
        <div 
            className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover-lift transition-all duration-300 fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="p-6 relative">
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-20 -mr-16 -mt-16`}></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center flex-1">
                        <div className={`flex-shrink-0 rounded-xl p-4 ${colors.iconBg} shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                            <Icon className={`h-7 w-7 text-white`} />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-semibold text-gray-600 truncate mb-1">{title}</dt>
                                <dd>
                                    <div className="text-2xl font-bold text-gray-900 flex items-baseline">
                                        {value} 
                                        <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>
                                    </div>
                                    {trend && (
                                        <div className={`flex items-center mt-1 text-xs ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                            {Math.abs(trend).toFixed(1)}% vs last period
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [zones, setZones] = useState([]);
    const [co2Trend, setCo2Trend] = useState([]);
    const [airQualityTrend, setAirQualityTrend] = useState([]);
    const [zoneComparison, setZoneComparison] = useState([]);
    const [typeDistribution, setTypeDistribution] = useState([]);
    const [recentIndicators, setRecentIndicators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [
                    summaryRes,
                    zonesRes,
                    co2TrendRes,
                    airQualityRes,
                    zoneComparisonRes,
                    indicatorsRes
                ] = await Promise.all([
                    api.get('/stats/summary'),
                    api.get('/zones/', { params: { limit: 1000 } }),
                    api.get('/stats/co2/trend?period=daily'),
                    api.get('/stats/air/averages'),
                    api.get('/stats/air/averages'),
                    api.get('/indicators/?limit=10&sort_by=timestamp&order=desc')
                ]);

                setStats(summaryRes.data);
                // Handle paginated zones response
                const zonesData = zonesRes.data;
                if (zonesData.items) {
                    setZones(zonesData.items);
                } else {
                    setZones(Array.isArray(zonesData) ? zonesData : []);
                }

                // Format CO2 trend data
                const co2Data = co2TrendRes.data.labels.map((label, index) => ({
                    name: label,
                    value: co2TrendRes.data.series[index] || 0
                }));
                setCo2Trend(co2Data.slice(-30)); // Last 30 days

                // Format air quality trend (use same data but different format)
                const airData = airQualityRes.data.labels.map((label, index) => ({
                    name: label,
                    value: airQualityRes.data.series[index] || 0
                }));
                setAirQualityTrend(airData);

                // Zone comparison data
                setZoneComparison(zoneComparisonRes.data.labels.map((label, index) => ({
                    name: label,
                    value: zoneComparisonRes.data.series[index] || 0
                })));

                // Type distribution for pie chart
                const distribution = summaryRes.data.map(stat => ({
                    name: stat.type.replace('_', ' ').toUpperCase(),
                    value: stat.count,
                    average: stat.average
                }));
                setTypeDistribution(distribution);

                // Recent indicators
                const indicatorsData = indicatorsRes.data.items || indicatorsRes.data;
                setRecentIndicators(indicatorsData.slice(0, 10));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const getStat = (type) => stats.find(s => s.type === type) || { average: 0, count: 0, min: 0, max: 0 };
    const totalIndicators = stats.reduce((sum, s) => sum + s.count, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                            <p className="text-primary-100 text-lg">
                                Real-time environmental indicators and analytics at your fingertips
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center text-primary-100 mb-2">
                                <Activity className="h-5 w-5 mr-2" />
                                <span className="text-sm">Live Data</span>
                            </div>
                            <div className="text-2xl font-bold">{totalIndicators.toLocaleString()}</div>
                            <div className="text-sm text-primary-200">Total Indicators</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Expanded */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Air Quality (PM2.5)"
                    value={getStat('air_quality').average.toFixed(1)}
                    unit="µg/m³"
                    icon={Wind}
                    color="blue"
                    trend={2.3}
                    index={0}
                />
                <StatCard
                    title="CO2 Emissions"
                    value={getStat('co2').average.toFixed(1)}
                    unit="kg"
                    icon={Factory}
                    color="red"
                    trend={-1.2}
                    index={1}
                />
                <StatCard
                    title="Energy Usage"
                    value={getStat('energy').average.toFixed(1)}
                    unit="kWh"
                    icon={Zap}
                    color="yellow"
                    trend={5.7}
                    index={2}
                />
                <StatCard
                    title="Precipitation"
                    value={getStat('precipitation').average.toFixed(1)}
                    unit="mm"
                    icon={Droplets}
                    color="cyan"
                    trend={-3.1}
                    index={3}
                />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Total Zones</p>
                            <p className="text-3xl font-bold text-gray-900">{zones.length}</p>
                        </div>
                        <Globe className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Data Sources</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.length}</p>
                        </div>
                        <Activity className="h-10 w-10 text-green-500" />
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Avg. Value Range</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.length > 0 ? 
                                    `${Math.min(...stats.map(s => s.min)).toFixed(0)} - ${Math.max(...stats.map(s => s.max)).toFixed(0)}` 
                                    : '0 - 0'}
                            </p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Charts Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CO2 Trend Chart - Line Chart */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">CO2 Emissions Trend (30 Days)</h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">Daily Average</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={co2Trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#ef4444" 
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Air Quality by Zone - Bar Chart */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Air Quality by Zone</h3>
                        <Wind className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zoneComparison}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Type Distribution - Pie Chart */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Data Type Distribution</h3>
                        <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {typeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Air Quality Trend - Area Chart */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Air Quality Trend</h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Zone Average</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={airQualityTrend}>
                                <defs>
                                    <linearGradient id="colorAirQuality" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="50%" stopColor="#60a5fa" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAirQuality)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Indicators */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Indicators</h3>
                        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                            Live
                        </div>
                    </div>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-100">
                            {recentIndicators.length === 0 ? (
                                <li className="py-8 text-center text-gray-500">No recent indicators</li>
                            ) : (
                                recentIndicators.map((indicator, index) => (
                                    <li 
                                        key={indicator.id} 
                                        className="py-4 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                                    indicator.type === 'air_quality' ? 'bg-blue-100' :
                                                    indicator.type === 'co2' ? 'bg-red-100' :
                                                    indicator.type === 'energy' ? 'bg-yellow-100' :
                                                    'bg-cyan-100'
                                                }`}>
                                                    {indicator.type === 'air_quality' && <Wind className="h-6 w-6 text-blue-600" />}
                                                    {indicator.type === 'co2' && <Factory className="h-6 w-6 text-red-600" />}
                                                    {indicator.type === 'energy' && <Zap className="h-6 w-6 text-yellow-600" />}
                                                    {indicator.type === 'precipitation' && <Droplets className="h-6 w-6 text-cyan-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate capitalize">
                                                        {indicator.type.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {new Date(indicator.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {indicator.value.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">{indicator.unit}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover-lift transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Statistics Summary</h3>
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {stats.map((stat, index) => (
                            <div key={stat.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {stat.type.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-gray-500">{stat.count.toLocaleString()} records</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{stat.average.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500">
                                        Range: {stat.min.toFixed(1)} - {stat.max.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {stats.length === 0 && (
                            <div className="text-center py-8 text-gray-500">No statistics available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
