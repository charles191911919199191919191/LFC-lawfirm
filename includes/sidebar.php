<?php
$role = isset($_SESSION['role']) ? $_SESSION['role'] : 'guest';
function nav_item($href, $label) {
    echo '<li><a href="' . $href . '">' . $label . '</a></li>';
}
?>
<aside class="sidebar">
    <div class="sidebar-section">
        <h2>Navigation</h2>
        <ul>
            <?php if ($role === 'admin'): ?>
                <?php nav_item('/admin/dashboard.php', 'Admin Dashboard'); ?>
                <?php nav_item('/admin/users.php', 'User Management'); ?>
                <?php nav_item('/admin/lawyers.php', 'Lawyer Profiles'); ?>
                <?php nav_item('/admin/settings.php', 'System Settings'); ?>
                <?php nav_item('/admin/dashboard.php#analytics', 'Analytics'); ?>
                <?php nav_item('/admin/dashboard.php#reports', 'Reports'); ?>
            <?php elseif ($role === 'staff'): ?>
                <?php nav_item('/staff/dashboard.php', 'Staff Dashboard'); ?>
                <?php nav_item('/staff/appointments.php', 'Manage Appointments'); ?>
                <?php nav_item('/staff/appointments.php#calendar', 'Calendar View'); ?>
                <?php nav_item('/staff/appointments.php#reports', 'Reports'); ?>
            <?php elseif ($role === 'lawyer'): ?>
                <?php nav_item('/lawyer/dashboard.php', 'My Workload'); ?>
                <?php nav_item('/lawyer/dashboard.php#appointments', 'Assigned Appointments'); ?>
                <?php nav_item('/lawyer/dashboard.php#priorities', 'Prioritized Cases'); ?>
            <?php endif; ?>
        </ul>
    </div>
    <div class="sidebar-section sidebar-info">
        <strong>Role:</strong> <?php echo ucfirst($role); ?><br>
        <strong>User:</strong> <?php echo isset($_SESSION['name']) ? htmlspecialchars($_SESSION['name']) : 'Guest'; ?>
    </div>
</aside>
