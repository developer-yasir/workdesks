import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/customer/login', {
                email,
                password
            });

            // Store token and customer data
            localStorage.setItem('customerToken', response.data.token);
            localStorage.setItem('customerData', JSON.stringify(response.data.customer));

            toast.success('Login successful!');
            navigate('/customer/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkDesks</h1>
                    <p className="text-gray-600">Customer Portal Login</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/customer/register" className="text-primary hover:underline font-medium">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Links */}
                <div className="mt-4 text-center space-y-2">
                    <Link to="/login" className="block text-sm text-gray-600 hover:text-gray-900">
                        Agent/Admin Login →
                    </Link>
                    <Link to="/" className="block text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
