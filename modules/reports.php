<?php
require_once __DIR__ . '/appointments.php';

function get_report_summary() {
    global $mysqli;
    $totals = [];
    $result = $mysqli->query('SELECT COUNT(*) AS total FROM appointments');
    $totals['total'] = $result->fetch_assoc()['total'];
    $result = $mysqli->query('SELECT COUNT(*) AS urgent FROM appointments WHERE case_type = "Urgent"');
    $totals['urgent'] = $result->fetch_assoc()['urgent'];
    $totals['regular'] = $totals['total'] - $totals['urgent'];
    $result = $mysqli->query('SELECT u.name, COUNT(a.id) AS workload FROM lawyers l JOIN users u ON l.user_id = u.id LEFT JOIN appointments a ON a.assigned_lawyer_id = l.id GROUP BY l.id ORDER BY workload DESC');
    $totals['lawyer_workloads'] = [];
    while ($row = $result->fetch_assoc()) {
        $totals['lawyer_workloads'][] = $row;
    }
    return $totals;
}

function get_printable_report_rows() {
    $rows = get_all_appointments();
    return $rows;
}
