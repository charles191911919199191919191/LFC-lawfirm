<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('lawyer');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../modules/appointments.php';

$userId = $_SESSION['user_id'];
$stmt = $mysqli->prepare('SELECT id FROM lawyers WHERE user_id = ? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$lawyer = $stmt->get_result()->fetch_assoc();
$lawyerId = $lawyer ? $lawyer['id'] : 0;
$appointments = get_all_appointments(['role' => 'lawyer', 'lawyer_id' => $lawyerId]);
$urgent = [];
$regular = [];
$total = 0;
while ($row = $appointments->fetch_assoc()) {
    if ($row['case_type'] === 'Urgent') {
        $urgent[] = $row;
    } else {
        $regular[] = $row;
    }
    $total++;
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>Lawyer Workload</h1>
    <?php show_flash(); ?>
    <div class="cards-grid">
        <article class="card card-summary">
            <h2>Total Assigned</h2>
            <strong><?php echo $total; ?></strong>
        </article>
        <article class="card card-summary">
            <h2>Urgent Cases</h2>
            <strong><?php echo count($urgent); ?></strong>
        </article>
        <article class="card card-summary">
            <h2>Regular Cases</h2>
            <strong><?php echo count($regular); ?></strong>
        </article>
    </div>
    <article class="card">
        <h2 id="appointments">Assigned Appointments</h2>
        <?php if ($total === 0): ?>
            <p>No appointments assigned yet.</p>
        <?php else: ?>
            <table>
                <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                    <?php foreach (array_merge($urgent, $regular) as $row): ?>
                        <tr class="<?php echo $row['case_type'] === 'Urgent' ? 'row-urgent' : ''; ?>">
                            <td><?php echo htmlspecialchars($row['date']); ?></td>
                            <td><?php echo htmlspecialchars($row['time_start'] . ' - ' . $row['time_end']); ?></td>
                            <td><?php echo htmlspecialchars($row['client_name']); ?></td>
                            <td><?php echo htmlspecialchars($row['case_type']); ?></td>
                            <td><?php echo htmlspecialchars($row['status']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </article>
    <article class="card">
        <h2 id="priorities">Prioritized Cases</h2>
        <?php if (empty($urgent)): ?>
            <p>There are no urgent priorities today.</p>
        <?php else: ?>
            <ul class="priority-list">
                <?php foreach ($urgent as $case): ?>
                    <li>
                        <strong><?php echo htmlspecialchars($case['client_name']); ?></strong>
                        <span><?php echo htmlspecialchars($case['date'] . ' ' . $case['time_start']); ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    </article>
</section>
<?php include __DIR__ . '/../includes/footer.php'; ?>
