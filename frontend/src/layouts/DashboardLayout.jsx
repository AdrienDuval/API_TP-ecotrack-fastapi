import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Map as MapIcon,
    Users,
    LogOut,
    Menu,
    X,
    Leaf,
    Activity,
    Globe
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Map View', href: '/map', icon: MapIcon },
        { name: 'Indicators', href: '/indicators', icon: Activity },
        { name: 'Zones', href: '/zones', icon: Globe },
        { name: 'Users', href: '/users', icon: Users, adminOnly: true },
    ].filter(item => !item.adminOnly || user?.role === 'admin');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:inset-0 border-r border-gray-100",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-transparent"></div>
                        <div className="relative flex items-center">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">EcoTrack</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={clsx(
                                        isActive
                                            ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm border-l-4 border-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                                        'group flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 hover-lift'
                                    )}
                                >
                                    <Icon className={clsx(
                                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center mb-4 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between bg-white shadow-lg px-4 py-3 z-30 border-b border-gray-100">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">EcoTrack</span>
                    </div>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
