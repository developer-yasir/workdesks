import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// @desc    Get agent performance metrics
// @route   GET /api/analytics/agent-performance
// @access  Private (Admin/Manager)
export const getAgentPerformance = async (req, res) => {
    try {
        const { startDate, endDate, teamId } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Build query based on role
        const { role, teamId: userTeamId } = req.user;
        let userFilter = {};

        if (role === 'company_manager' && userTeamId) {
            userFilter.teamId = userTeamId;
        } else if (teamId) {
            userFilter.teamId = teamId;
        }

        // Get all agents
        const agents = await User.find({
            role: 'agent',
            isActive: true,
            ...userFilter
        }).select('name email teamId');

        // Calculate metrics for each agent
        const performanceData = await Promise.all(agents.map(async (agent) => {
            const ticketQuery = {
                assignedTo: agent._id,
                ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
            };

            const tickets = await Ticket.find(ticketQuery);

            const totalTickets = tickets.length;
            const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
            const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Pending').length;
            const slaBreached = tickets.filter(t => t.slaBreached).length;

            // Calculate average response time (in hours)
            const ticketsWithResponse = tickets.filter(t => t.firstResponseAt);
            const avgResponseTime = ticketsWithResponse.length > 0
                ? ticketsWithResponse.reduce((sum, t) => {
                    const responseTime = (new Date(t.firstResponseAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
                    return sum + responseTime;
                }, 0) / ticketsWithResponse.length
                : 0;

            // Calculate average resolution time (in hours)
            const resolvedTicketsList = tickets.filter(t => t.resolvedAt);
            const avgResolutionTime = resolvedTicketsList.length > 0
                ? resolvedTicketsList.reduce((sum, t) => {
                    const resolutionTime = (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
                    return sum + resolutionTime;
                }, 0) / resolvedTicketsList.length
                : 0;

            return {
                agentId: agent._id,
                agentName: agent.name,
                agentEmail: agent.email,
                totalTickets,
                resolvedTickets,
                openTickets,
                slaBreached,
                slaCompliance: totalTickets > 0 ? ((totalTickets - slaBreached) / totalTickets * 100).toFixed(1) : 100,
                avgResponseTime: avgResponseTime.toFixed(2),
                avgResolutionTime: avgResolutionTime.toFixed(2),
                resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0
            };
        }));

        res.json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        console.error('Get agent performance error:', error);
        res.status(500).json({ message: 'Error fetching agent performance', error: error.message });
    }
};

// @desc    Get team statistics
// @route   GET /api/analytics/team-statistics
// @access  Private (Admin/Manager)
export const getTeamStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

        const totalTickets = await Ticket.countDocuments(query);
        const openTickets = await Ticket.countDocuments({ ...query, status: 'Open' });
        const pendingTickets = await Ticket.countDocuments({ ...query, status: 'Pending' });
        const resolvedTickets = await Ticket.countDocuments({ ...query, status: { $in: ['Resolved', 'Closed'] } });
        const slaBreached = await Ticket.countDocuments({ ...query, slaBreached: true });

        // Tickets by priority
        const priorityBreakdown = await Ticket.aggregate([
            { $match: query },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Tickets by type
        const typeBreakdown = await Ticket.aggregate([
            { $match: query },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalTickets,
                openTickets,
                pendingTickets,
                resolvedTickets,
                slaBreached,
                slaCompliance: totalTickets > 0 ? ((totalTickets - slaBreached) / totalTickets * 100).toFixed(1) : 100,
                priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                typeBreakdown: typeBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get team statistics error:', error);
        res.status(500).json({ message: 'Error fetching team statistics', error: error.message });
    }
};

// @desc    Get ticket trends over time
// @route   GET /api/analytics/ticket-trends
// @access  Private (Admin/Manager)
export const getTicketTrends = async (req, res) => {
    try {
        const { startDate, endDate, interval = 'day' } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Aggregate tickets by date
        const trends = await Ticket.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: interval === 'month' ? '%Y-%m' : '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    created: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: trends.map(t => ({
                date: t._id,
                created: t.created,
                resolved: t.resolved
            }))
        });
    } catch (error) {
        console.error('Get ticket trends error:', error);
        res.status(500).json({ message: 'Error fetching ticket trends', error: error.message });
    }
};

// @desc    Get SLA metrics
// @route   GET /api/analytics/sla-metrics
// @access  Private (Admin/Manager)
export const getSLAMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

        const totalTickets = await Ticket.countDocuments(query);
        const slaBreached = await Ticket.countDocuments({ ...query, slaBreached: true });
        const slaCompliant = totalTickets - slaBreached;

        // SLA breach by priority
        const breachByPriority = await Ticket.aggregate([
            { $match: { ...query, slaBreached: true } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Average response and resolution times
        const tickets = await Ticket.find(query).select('createdAt firstResponseAt resolvedAt priority');

        const avgResponseTime = tickets.filter(t => t.firstResponseAt).reduce((sum, t) => {
            return sum + (new Date(t.firstResponseAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        }, 0) / (tickets.filter(t => t.firstResponseAt).length || 1);

        const avgResolutionTime = tickets.filter(t => t.resolvedAt).reduce((sum, t) => {
            return sum + (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        }, 0) / (tickets.filter(t => t.resolvedAt).length || 1);

        res.json({
            success: true,
            data: {
                totalTickets,
                slaCompliant,
                slaBreached,
                complianceRate: totalTickets > 0 ? ((slaCompliant / totalTickets) * 100).toFixed(1) : 100,
                breachByPriority: breachByPriority.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                avgResponseTime: avgResponseTime.toFixed(2),
                avgResolutionTime: avgResolutionTime.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Get SLA metrics error:', error);
        res.status(500).json({ message: 'Error fetching SLA metrics', error: error.message });
    }
};
