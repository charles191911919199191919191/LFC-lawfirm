<?php
require_once __DIR__ . '/appointments.php';

function build_chart_data($result, $labelKey, $valueKey) {
    $labels = [];
    $values = [];
    while ($row = $result->fetch_assoc()) {
        $labels[] = $row[$labelKey];
        $values[] = (float) $row[$valueKey];
    }
    return ['labels' => $labels, 'values' => $values];
}

function analytics_appointment_heatmap() {
    $rows = get_appointment_counts_by_day();
    return build_chart_data($rows, 'date', 'total');
}

function analytics_duration_trend() {
    $rows = get_appointment_duration_trends();
    return build_chart_data($rows, 'day', 'avg_minutes');
}

function analytics_workload_distribution() {
    $rows = get_lawyer_workload_distribution();
    return build_chart_data($rows, 'name', 'load_count');
}

function analytics_monthly_appointments() {
    $rows = get_monthly_appointments();
    return build_chart_data($rows, 'month', 'total');
}
