import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Loader2, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useAuth();
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register(formData.email, formData.username, formData.password);
            // Auto login after register
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordRequirements = [
        { text: 'At least 8 characters', met: formData.password.length >= 8 },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
        { text: 'Contains number', met: /[0-9]/.test(formData.password) },
    ];

    return (
        <div className="min-h-screen gradient-bg relative overflow-hidden">
            {/* Animated particles background */}
            <div className="particles"></div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-slow"></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-6 sm:px-8 py-12">
                <div className="w-full max-w-2xl">
                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 fade-in">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg pulse-glow">
                            <Leaf className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    {/* Register card */}
                    <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl hover-lift fade-in-delayed">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Create Your Account
                            </h2>
                            <p className="text-gray-600">
                                Join EcoTrack and start monitoring your environmental impact
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in shadow-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                        placeholder="Choose a username"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    placeholder="Create a strong password"
                                />
                                {formData.password && (
                                    <div className="mt-2 space-y-1">
                                        {passwordRequirements.map((req, index) => (
                                            <div key={index} className="flex items-center text-xs">
                                                <CheckCircle2 
                                                    className={`h-3 w-3 mr-2 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                                                />
                                                <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    placeholder="Confirm your password"
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <div className="mt-2 flex items-center text-xs text-green-600">
                                        <CheckCircle2 className="h-3 w-3 mr-2" />
                                        Passwords match
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
