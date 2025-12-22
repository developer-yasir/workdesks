const SLAIndicator = ({ dueDate, label = 'Due' }) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const hoursRemaining = (due - now) / (1000 * 60 * 60);

    // Determine color and status
    let colorClass = '';
    let statusText = '';

    if (hoursRemaining < 0) {
        // Overdue
        colorClass = 'bg-red-100 text-red-700 border-red-200';
        const hoursOverdue = Math.abs(hoursRemaining);
        statusText = `Overdue by ${hoursOverdue < 24 ? `${Math.floor(hoursOverdue)}h` : `${Math.floor(hoursOverdue / 24)}d`}`;
    } else if (hoursRemaining < 24) {
        // Due soon (less than 24 hours)
        colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        statusText = `Due in ${Math.floor(hoursRemaining)}h`;
    } else {
        // On track
        colorClass = 'bg-green-100 text-green-700 border-green-200';
        const daysRemaining = Math.floor(hoursRemaining / 24);
        statusText = `Due in ${daysRemaining}d`;
    }

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}
            title={`${label}: ${due.toLocaleString()}`}
        >
            {statusText}
        </span>
    );
};

export default SLAIndicator;
