import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // days
    const [agentPerformance, setAgentPerformance] = useState([]);
    const [teamStats, setTeamStats] = useState(null);
    const [ticketTrends, setTicketTrends] = useState([]);
    const [slaMetrics, setSlaMetrics] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };

            const [agentRes, teamRes, trendsRes, slaRes] = await Promise.all([
                api.get('/analytics/agent-performance', { params }),
                api.get('/analytics/team-statistics', { params }),
                api.get('/analytics/ticket-trends', { params }),
                api.get('/analytics/sla-metrics', { params })
            ]);

            setAgentPerformance(agentRes.data.data);
            setTeamStats(teamRes.data.data);
            setTicketTrends(trendsRes.data.data);
            setSlaMetrics(slaRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    const priorityData = teamStats ? [
        { name: 'Low', value: teamStats.priorityBreakdown.Low || 0 },
        { name: 'Medium', value: teamStats.priorityBreakdown.Medium || 0 },
        { name: 'High', value: teamStats.priorityBreakdown.High || 0 },
        { name: 'Urgent', value: teamStats.priorityBreakdown.Urgent || 0 }
    ] : [];

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-1">Performance metrics and insights</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                            <button
                                onClick={fetchAnalytics}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        {teamStats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Tickets</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{teamStats.totalTickets}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">🎫</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Resolved</p>
                                            <p className="text-3xl font-bold text-green-600 mt-1">{teamStats.resolvedTickets}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Open</p>
                                            <p className="text-3xl font-bold text-yellow-600 mt-1">{teamStats.openTickets}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">📂</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">SLA Compliance</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{teamStats.slaCompliance}%</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">⏱️</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Ticket Trends */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={ticketTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Created" />
                                        <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Priority Distribution */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={priorityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {priorityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Agent Performance Table */}
                        <div className="bg-white rounded-lg shadow mb-6">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Agent Performance</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tickets</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response (hrs)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Resolution (hrs)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Compliance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {agentPerformance.map((agent) => (
                                            <tr key={agent.agentId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{agent.agentName}</div>
                                                        <div className="text-sm text-gray-500">{agent.agentEmail}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.totalTickets}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{agent.resolvedTickets}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{agent.openTickets}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.avgResponseTime}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.avgResolutionTime}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${parseFloat(agent.slaCompliance) >= 90 ? 'bg-green-100 text-green-800' :
                                                            parseFloat(agent.slaCompliance) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {agent.slaCompliance}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.resolutionRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SLA Metrics */}
                        {slaMetrics && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Metrics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Compliance Rate</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">{slaMetrics.complianceRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">SLA Breached</p>
                                        <p className="text-2xl font-bold text-red-600 mt-1">{slaMetrics.slaBreached}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Response Time</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{slaMetrics.avgResponseTime}h</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Resolution Time</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{slaMetrics.avgResolutionTime}h</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
