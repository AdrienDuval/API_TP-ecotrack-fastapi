import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Wind, Droplets, Zap, Factory } from 'lucide-react';

const StatCard = ({ title, value, unit, icon: Icon, color }) => {
    const colorConfig = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' },
    };
    
    const colors = colorConfig[color] || colorConfig.blue;
    
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">
                                    {value} <span className="text-sm text-gray-500">{unit}</span>
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch summary stats
                const summaryRes = await api.get('/stats/summary');
                setStats(summaryRes.data);

                // Fetch chart data (CO2 trend)
                const trendRes = await api.get('/stats/co2/trend?period=monthly');
                const formattedData = trendRes.data.labels.map((label, index) => ({
                    name: label,
                    value: trendRes.data.series[index]
                }));
                setChartData(formattedData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Helper to find stat by type
    const getStat = (type) => stats.find(s => s.type === type) || { average: 0, count: 0 };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Real-time environmental indicators and analytics.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Air Quality (PM2.5)"
                    value={getStat('air_quality').average.toFixed(1)}
                    unit="µg/m³"
                    icon={Wind}
                    color="blue"
                />
                <StatCard
                    title="CO2 Emissions"
                    value={getStat('co2').average.toFixed(1)}
                    unit="kg"
                    icon={Factory}
                    color="red"
                />
                <StatCard
                    title="Energy Usage"
                    value={getStat('energy').average.toFixed(1)}
                    unit="kWh"
                    icon={Zap}
                    color="yellow"
                />
                <StatCard
                    title="Precipitation"
                    value={getStat('precipitation').average.toFixed(1)}
                    unit="mm"
                    icon={Droplets}
                    color="cyan"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CO2 Trend Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        CO2 Emissions Trend
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Placeholder */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Recent Data Ingestion
                    </h3>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {stats.map((stat) => (
                                <li key={stat.type} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate capitalize">
                                                {stat.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {stat.count} records processed
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                                            Avg: {stat.average.toFixed(1)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
