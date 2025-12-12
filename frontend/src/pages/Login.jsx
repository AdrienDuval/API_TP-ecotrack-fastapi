import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Loader2, TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Create floating particles
    useEffect(() => {
        const particles = document.querySelector('.particles');
        if (!particles) return;

        const particleElements = [];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;
            particles.appendChild(particle);
            particleElements.push(particle);
        }

        return () => {
            particleElements.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: TrendingUp, text: 'Real-time Analytics' },
        { icon: BarChart3, text: 'Advanced Insights' },
        { icon: Shield, text: 'Secure Platform' },
        { icon: Zap, text: 'Fast Performance' },
    ];

    return (
        <div className="min-h-screen gradient-bg relative overflow-hidden">
            {/* Animated particles background */}
            <div className="particles"></div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-slow"></div>

            <div className="relative z-10 min-h-screen flex">
                {/* Left side - Hero content */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 fade-in">
                    <div className="mb-8">
                        <div className="flex items-center mb-6 slide-in-left">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
                                <Leaf className="h-10 w-10 text-white" />
                            </div>
                            <span className="ml-4 text-3xl font-bold text-white">EcoTrack</span>
                        </div>
                        <h1 className="text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Track Your
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">
                                Environmental Impact
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            Monitor air quality, CO2 emissions, and energy consumption in real-time. 
                            Make data-driven decisions for a sustainable future.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="glass rounded-xl p-4 hover-lift fade-in-delayed"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center">
                                        <Icon className="h-6 w-6 text-white mr-3" />
                                        <span className="text-white font-medium">{feature.text}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats or additional info */}
                    <div className="glass rounded-xl p-6 fade-in-delayed">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-sm text-white/80">Real-time Monitoring</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">100+</div>
                                <div className="text-sm text-white/80">Data Points</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">99.9%</div>
                                <div className="text-sm text-white/80">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 py-12">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-8 fade-in">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                <Leaf className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        {/* Login card */}
                        <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl hover-lift fade-in-delayed">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Welcome Back
                                </h2>
                                <p className="text-gray-600">
                                    Sign in to continue to EcoTrack
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in shadow-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link 
                                        to="/register" 
                                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                                    >
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Mobile features */}
                        <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="glass rounded-xl p-3 text-center fade-in-delayed"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <Icon className="h-5 w-5 text-white mx-auto mb-1" />
                                        <span className="text-xs text-white font-medium">{feature.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
