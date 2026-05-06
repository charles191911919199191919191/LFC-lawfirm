<?php
require_once __DIR__ . '/../includes/auth_check.php';
require_once __DIR__ . '/../modules/analytics.php';
protect_page('admin');

$heatmap = analytics_appointment_heatmap();
$durationTrend = analytics_duration_trend();
$workloadDistribution = analytics_workload_distribution();
$monthlyAppointments = analytics_monthly_appointments();
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>Admin Dashboard</h1>
    <?php show_flash(); ?>
    <div class="cards-grid">
        <article class="card">
            <h2>Appointment Heatmap</h2>
            <canvas id="heatmapChart"></canvas>
        </article>
        <article class="card">
            <h2>Case Duration Trends</h2>
            <canvas id="durationChart"></canvas>
        </article>
        <article class="card">
            <h2>Lawyer Workload</h2>
            <canvas id="workloadChart"></canvas>
        </article>
        <article class="card">
            <h2>Monthly Appointments</h2>
            <canvas id="monthlyChart"></canvas>
        </article>
    </div>
</section>
<script>
const heatmapData = <?php echo json_encode($heatmap); ?>;
const durationData = <?php echo json_encode($durationTrend); ?>;
const workloadData = <?php echo json_encode($workloadDistribution); ?>;
const monthlyData = <?php echo json_encode($monthlyAppointments); ?>;
window.addEventListener('DOMContentLoaded', () => {
    createLineChart('heatmapChart', 'Appointments by Date', heatmapData.labels, heatmapData.values, 'rgba(54, 162, 235, 0.6)');
    createLineChart('durationChart', 'Average Duration (minutes)', durationData.labels, durationData.values, 'rgba(255, 99, 132, 0.6)');
    createBarChart('workloadChart', 'Lawyer Workload', workloadData.labels, workloadData.values, 'rgba(75, 192, 192, 0.6)');
    createBarChart('monthlyChart', 'Monthly Appointments', monthlyData.labels, monthlyData.values, 'rgba(153, 102, 255, 0.6)');
});
</script>
<?php include __DIR__ . '/../includes/footer.php'; ?>
