import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Building2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Redirect based on role
            switch (result.user.role) {
                case 'super_admin':
                    navigate('/admin/dashboard');
                    break;
                case 'company_manager':
                    navigate('/manager/dashboard');
                    break;
                case 'agent':
                    navigate('/agent/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const fillDemoCredentials = (role) => {
        switch (role) {
            case 'admin':
                setEmail('admin@workdesks.com');
                setPassword('admin123');
                break;
            case 'manager':
                setEmail('manager@workdesks.com');
                setPassword('manager123');
                break;
            case 'agent':
                setEmail('agent1@workdesks.com');
                setPassword('agent123');
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4 shadow-md">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkDesks</h1>
                    <p className="text-gray-600">Enterprise Ticketing Platform</p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pl-10 pr-10"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Remember me
                                </span>
                            </label>
                            <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full btn btn-primary py-2.5 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing you in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-sm font-semibold text-gray-800">Quick Access Demo Accounts</p>
                        </div>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin')}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white transition-all duration-200 group border border-transparent hover:border-primary/30 hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Admin</span>
                                        <p className="text-xs text-gray-600 mt-0.5">admin@workdesks.com</p>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">Click to fill</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('manager')}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white transition-all duration-200 group border border-transparent hover:border-primary/30 hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Manager</span>
                                        <p className="text-xs text-gray-600 mt-0.5">manager@workdesks.com</p>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">Click to fill</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('agent')}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white transition-all duration-200 group border border-transparent hover:border-primary/30 hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Agent</span>
                                        <p className="text-xs text-gray-600 mt-0.5">agent1@workdesks.com</p>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">Click to fill</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    © 2025 WorkDesks. Built with MERN Stack
                </p>
            </div>
        </div>
    );
};

export default Login;
