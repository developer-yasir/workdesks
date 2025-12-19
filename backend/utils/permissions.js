// Permission definitions for each role
export const PERMISSIONS = {
    super_admin: ['*'], // All permissions - platform admin
    company_admin: [
        'view_all_tickets',
        'assign_tickets',
        'view_reports',
        'manage_all_teams',
        'create_teams',
        'manage_users',
        'create_users',
        'manage_automations',
        'create_canned_responses',
        'view_all_data'
    ],
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

// Check if user has permission
export const hasPermission = (userRole, permission) => {
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return false;

    // Super admin has all permissions
    if (rolePermissions.includes('*')) return true;

    return rolePermissions.includes(permission);
};

// Check if user has any of the specified roles
export const hasRole = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};
