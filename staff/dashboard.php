<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('staff');
require_once __DIR__ . '/../modules/appointments.php';

$appointments = get_all_appointments();
$urgentCount = 0;
$regularCount = 0;
$upcoming = [];
while ($row = $appointments->fetch_assoc()) {
    if ($row['case_type'] === 'Urgent') {
        $urgentCount++;
    } else {
        $regularCount++;
    }
    if (strtotime($row['date']) >= strtotime(date('Y-m-d'))) {
        $upcoming[] = $row;
    }
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>Staff Dashboard</h1>
    <?php show_flash(); ?>
    <div class="cards-grid">
        <article class="card card-summary">
            <h2>Urgent Cases</h2>
            <strong><?php echo $urgentCount; ?></strong>
        </article>
        <article class="card card-summary">
            <h2>Regular Cases</h2>
            <strong><?php echo $regularCount; ?></strong>
        </article>
        <article class="card card-summary">
            <h2>Upcoming Appointments</h2>
            <strong><?php echo count($upcoming); ?></strong>
        </article>
    </div>
    <article class="card">
        <h2>Next Appointments</h2>
        <table>
            <thead><tr><th>Date</th><th>Client</th><th>Lawyer</th><th>Status</th><th>Type</th></tr></thead>
            <tbody>
                <?php foreach (array_slice($upcoming, 0, 6) as $row): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($row['date']); ?></td>
                        <td><?php echo htmlspecialchars($row['client_name']); ?></td>
                        <td><?php echo htmlspecialchars($row['lawyer_name']); ?></td>
                        <td><?php echo htmlspecialchars($row['status']); ?></td>
                        <td class="status-<?php echo strtolower($row['case_type']); ?>"><?php echo htmlspecialchars($row['case_type']); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </article>
</section>
<?php include __DIR__ . '/../includes/footer.php'; ?>
