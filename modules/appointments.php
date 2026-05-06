<?php
require_once __DIR__ . '/../config/database.php';

function get_all_appointments($filter = []) {
    global $mysqli;
    $sql = 'SELECT a.*, l.user_id AS lawyer_user_id, u.name AS lawyer_name, u.email AS lawyer_email, us.name AS creator_name
            FROM appointments a
            LEFT JOIN lawyers l ON a.assigned_lawyer_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN users us ON a.created_by = us.id
            WHERE 1=1';
    $params = [];
    $types = '';
    if (!empty($filter['role']) && $filter['role'] === 'lawyer' && !empty($filter['lawyer_id'])) {
        $sql .= ' AND a.assigned_lawyer_id = ?';
        $params[] = $filter['lawyer_id'];
        $types .= 'i';
    }
    if (!empty($filter['date'])) {
        $sql .= ' AND a.date = ?';
        $params[] = $filter['date'];
        $types .= 's';
    }
    $sql .= ' ORDER BY a.date ASC, a.time_start ASC';
    $stmt = $mysqli->prepare($sql);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    return $stmt->get_result();
}

function get_appointment($id) {
    global $mysqli;
    $stmt = $mysqli->prepare('SELECT * FROM appointments WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function get_lawyers() {
    global $mysqli;
    return $mysqli->query('SELECT l.id, u.name, l.specialization, l.active FROM lawyers l JOIN users u ON l.user_id = u.id ORDER BY u.name ASC');
}

function detect_conflicts($lawyerId, $date, $start, $end, $excludeId = 0) {
    global $mysqli;
    $sql = 'SELECT COUNT(*) AS count FROM appointments WHERE assigned_lawyer_id = ? AND date = ? AND id != ? AND ((time_start < ? AND time_end > ?) OR (time_start >= ? AND time_start < ?))';
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param('ississ', $lawyerId, $date, $excludeId, $end, $start, $start, $end);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return $result['count'] > 0;
}

function get_lawyer_load($lawyerId, $date) {
    global $mysqli;
    $stmt = $mysqli->prepare('SELECT COUNT(*) AS total FROM appointments WHERE assigned_lawyer_id = ? AND date = ?');
    $stmt->bind_param('is', $lawyerId, $date);
    $stmt->execute();
    return (int) $stmt->get_result()->fetch_assoc()['total'];
}

function get_least_busy_lawyer($date) {
    global $mysqli;
    $sql = 'SELECT l.id, u.name, COUNT(a.id) AS load_count FROM lawyers l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN appointments a ON a.assigned_lawyer_id = l.id AND a.date = ?
            WHERE l.active = 1
            GROUP BY l.id
            ORDER BY load_count ASC, u.name ASC
            LIMIT 1';
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param('s', $date);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function suggest_time_slots($lawyerId, $date, $durationMinutes = 60) {
    global $mysqli;
    $slots = [];
    $start = new DateTime($date . ' 09:00:00');
    $endOfDay = new DateTime($date . ' 17:00:00');
    $interval = new DateInterval('PT30M');
    while ($start < $endOfDay) {
        $slotEnd = clone $start;
        $slotEnd->add(new DateInterval('PT' . $durationMinutes . 'M'));
        if ($slotEnd > $endOfDay) {
            break;
        }
        $slotStartStr = $start->format('H:i:s');
        $slotEndStr = $slotEnd->format('H:i:s');
        $stmt = $mysqli->prepare('SELECT COUNT(*) AS count FROM appointments WHERE assigned_lawyer_id = ? AND date = ? AND ((time_start < ? AND time_end > ?) OR (time_start >= ? AND time_start < ?))');
        $stmt->bind_param('isssss', $lawyerId, $date, $slotEndStr, $slotStartStr, $slotStartStr, $slotEndStr);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['count'];
        if ($count === 0) {
            $slots[] = $start->format('H:i');
        }
        $start->add($interval);
    }
    return $slots;
}

function log_case_action($appointmentId, $userId, $action, $details = '') {
    global $mysqli;
    $stmt = $mysqli->prepare('INSERT INTO case_logs (appointment_id, user_id, action, details) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('iiss', $appointmentId, $userId, $action, $details);
    $stmt->execute();
}

function save_appointment($data) {
    global $mysqli;
    if (!empty($data['id'])) {
        $stmt = $mysqli->prepare('UPDATE appointments SET client_name = ?, contact_info = ?, date = ?, time_start = ?, time_end = ?, case_type = ?, assigned_lawyer_id = ?, notes = ?, status = ? WHERE id = ?');
        $stmt->bind_param('ssssssissi', $data['client_name'], $data['contact_info'], $data['date'], $data['time_start'], $data['time_end'], $data['case_type'], $data['assigned_lawyer_id'], $data['notes'], $data['status'], $data['id']);
        $stmt->execute();
        log_case_action($data['id'], $data['user_id'], 'Updated appointment', 'Appointment details updated.');
    } else {
        $stmt = $mysqli->prepare('INSERT INTO appointments (client_name, contact_info, date, time_start, time_end, case_type, assigned_lawyer_id, notes, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssssssissi', $data['client_name'], $data['contact_info'], $data['date'], $data['time_start'], $data['time_end'], $data['case_type'], $data['assigned_lawyer_id'], $data['notes'], $data['status'], $data['user_id']);
        $stmt->execute();
        $insertId = $mysqli->insert_id;
        log_case_action($insertId, $data['user_id'], 'Created appointment', 'New appointment created.');
    }
}

function delete_appointment($id, $userId) {
    global $mysqli;
    $stmt = $mysqli->prepare('DELETE FROM appointments WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    log_case_action($id, $userId, 'Deleted appointment', 'Appointment removed from schedule.');
}

function get_appointment_counts_by_day() {
    global $mysqli;
    $sql = 'SELECT date, COUNT(*) AS total, SUM(case_type = "Urgent") AS urgent_count FROM appointments GROUP BY date ORDER BY date ASC LIMIT 28';
    return $mysqli->query($sql);
}

function get_appointment_duration_trends() {
    global $mysqli;
    $sql = 'SELECT DATE(date) AS day, AVG(TIME_TO_SEC(TIMEDIFF(time_end, time_start)) / 60) AS avg_minutes FROM appointments GROUP BY day ORDER BY day ASC LIMIT 28';
    return $mysqli->query($sql);
}

function get_lawyer_workload_distribution() {
    global $mysqli;
    $sql = 'SELECT u.name, COUNT(a.id) AS load_count FROM lawyers l JOIN users u ON l.user_id = u.id LEFT JOIN appointments a ON a.assigned_lawyer_id = l.id GROUP BY l.id ORDER BY load_count DESC';
    return $mysqli->query($sql);
}

function get_monthly_appointments() {
    global $mysqli;
    $sql = 'SELECT DATE_FORMAT(date, "%Y-%m") AS month, COUNT(*) AS total FROM appointments GROUP BY month ORDER BY month ASC LIMIT 12';
    return $mysqli->query($sql);
}
