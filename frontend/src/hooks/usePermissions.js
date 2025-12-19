import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
    const { user } = useAuth();

    const PERMISSIONS = {
        super_admin: ['*'],
        company_manager: [
            'view_all_team_tickets',
            'assign_tickets',
            'view_reports',
            'manage_team_automations',
            'view_team_members',
            'create_canned_responses',
            'manage_team'
        ],
        agent: [
            'view_assigned_tickets',
            'reply_to_tickets',
            'add_private_notes',
            'update_ticket_status',
            'use_canned_responses',
            'view_own_tickets'
        ]
    };

    const hasPermission = (permission) => {
        if (!user) return false;

        const rolePermissions = PERMISSIONS[user.role];
        if (!rolePermissions) return false;

        // Super admin has all permissions
        if (rolePermissions.includes('*')) return true;

        return rolePermissions.includes(permission);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return {
        hasPermission,
        hasRole
    };
};
