<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('staff');
require_once __DIR__ . '/../modules/appointments.php';

$action = $_POST['action'] ?? null;
$editAppointment = null;
$messages = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'save') {
        $data = [
            'id' => !empty($_POST['id']) ? (int) $_POST['id'] : 0,
            'client_name' => escape($_POST['client_name']),
            'contact_info' => escape($_POST['contact_info']),
            'date' => $_POST['date'],
            'time_start' => $_POST['time_start'],
            'time_end' => $_POST['time_end'],
            'case_type' => in_array($_POST['case_type'], ['Urgent', 'Regular']) ? $_POST['case_type'] : 'Regular',
            'assigned_lawyer_id' => (int) $_POST['assigned_lawyer_id'],
            'notes' => escape($_POST['notes']),
            'status' => in_array($_POST['status'], ['Scheduled','Completed','Cancelled']) ? $_POST['status'] : 'Scheduled',
            'user_id' => $_SESSION['user_id'],
        ];
        $conflict = detect_conflicts($data['assigned_lawyer_id'], $data['date'], $data['time_start'], $data['time_end'], $data['id']);
        $lawyerLoad = get_lawyer_load($data['assigned_lawyer_id'], $data['date']);
        if ($conflict) {
            flash_message('Scheduling conflict detected. Please choose a different time or lawyer.', 'error');
        } else {
            save_appointment($data);
            flash_message('Appointment saved successfully.');
        }
        header('Location: /staff/appointments.php');
        exit;
    }
    if ($action === 'delete' && !empty($_POST['id'])) {
        delete_appointment((int)$_POST['id'], $_SESSION['user_id']);
        flash_message('Appointment deleted.');
        header('Location: /staff/appointments.php');
        exit;
    }
    if ($action === 'edit' && !empty($_POST['id'])) {
        $editAppointment = get_appointment((int)$_POST['id']);
    }
}

$appointments = get_all_appointments();
$lawyers = get_lawyers();
$today = date('Y-m-d');
$calendarAppointments = get_all_appointments(['date' => $today]);
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>Appointment Scheduling</h1>
    <?php show_flash(); ?>
    <div class="grid two-col">
        <article class="card">
            <h2><?php echo $editAppointment ? 'Edit' : 'New'; ?> Appointment</h2>
            <form method="post" class="form-card" id="appointmentForm">
                <input type="hidden" name="action" value="save">
                <input type="hidden" name="id" value="<?php echo $editAppointment ? (int)$editAppointment['id'] : ''; ?>">
                <label>Client Name</label>
                <input type="text" name="client_name" value="<?php echo $editAppointment ? htmlspecialchars($editAppointment['client_name']) : ''; ?>" required>
                <label>Contact Info</label>
                <input type="text" name="contact_info" value="<?php echo $editAppointment ? htmlspecialchars($editAppointment['contact_info']) : ''; ?>" required>
                <label>Date</label>
                <input type="date" name="date" value="<?php echo $editAppointment ? htmlspecialchars($editAppointment['date']) : date('Y-m-d'); ?>" required>
                <label>Start Time</label>
                <input type="time" name="time_start" value="<?php echo $editAppointment ? htmlspecialchars($editAppointment['time_start']) : '09:00'; ?>" required>
                <label>End Time</label>
                <input type="time" name="time_end" value="<?php echo $editAppointment ? htmlspecialchars($editAppointment['time_end']) : '10:00'; ?>" required>
                <label>Case Type</label>
                <select name="case_type">
                    <option value="Regular" <?php echo $editAppointment && $editAppointment['case_type'] === 'Regular' ? 'selected' : ''; ?>>Regular</option>
                    <option value="Urgent" <?php echo $editAppointment && $editAppointment['case_type'] === 'Urgent' ? 'selected' : ''; ?>>Urgent</option>
                </select>
                <label>Assigned Lawyer</label>
                <select name="assigned_lawyer_id" required>
                    <?php while ($lawyer = $lawyers->fetch_assoc()): ?>
                        <option value="<?php echo $lawyer['id']; ?>" <?php echo $editAppointment && $editAppointment['assigned_lawyer_id'] === $lawyer['id'] ? 'selected' : ''; ?>><?php echo htmlspecialchars($lawyer['name'] . ' — ' . $lawyer['specialization']); ?></option>
                    <?php endwhile; ?>
                </select>
                <label>Status</label>
                <select name="status">
                    <option value="Scheduled" <?php echo $editAppointment && $editAppointment['status'] === 'Scheduled' ? 'selected' : ''; ?>>Scheduled</option>
                    <option value="Completed" <?php echo $editAppointment && $editAppointment['status'] === 'Completed' ? 'selected' : ''; ?>>Completed</option>
                    <option value="Cancelled" <?php echo $editAppointment && $editAppointment['status'] === 'Cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                </select>
                <label>Notes</label>
                <textarea name="notes"><?php echo $editAppointment ? htmlspecialchars($editAppointment['notes']) : ''; ?></textarea>
                <button class="button" type="submit"><?php echo $editAppointment ? 'Save Changes' : 'Create Appointment'; ?></button>
            </form>
        </article>
        <article class="card">
            <h2>Today’s Calendar</h2>
            <div id="calendarView" class="calendar-view">
                <?php if ($calendarAppointments->num_rows === 0): ?>
                    <p>No appointments today.</p>
                <?php else: ?>
                    <ul>
                        <?php while ($row = $calendarAppointments->fetch_assoc()): ?>
                            <li class="calendar-item <?php echo strtolower($row['case_type']); ?>">
                                <strong><?php echo htmlspecialchars($row['time_start'] . ' - ' . $row['time_end']); ?></strong>
                                <span><?php echo htmlspecialchars($row['client_name']); ?> (<?php echo htmlspecialchars($row['lawyer_name']); ?>)</span>
                            </li>
                        <?php endwhile; ?>
                    </ul>
                <?php endif; ?>
            </div>
            <h3>Appointment List</h3>
            <table>
                <thead><tr><th>Date</th><th>Client</th><th>Lawyer</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    <?php $appointments = get_all_appointments(); while ($row = $appointments->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row['date']); ?></td>
                            <td><?php echo htmlspecialchars($row['client_name']); ?></td>
                            <td><?php echo htmlspecialchars($row['lawyer_name']); ?></td>
                            <td class="status-<?php echo strtolower($row['case_type']); ?>"><?php echo htmlspecialchars($row['case_type']); ?></td>
                            <td><?php echo htmlspecialchars($row['status']); ?></td>
                            <td>
                                <form method="post" style="display:inline;">
                                    <input type="hidden" name="action" value="edit">
                                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                    <button class="button small" type="submit">Edit</button>
                                </form>
                                <form method="post" style="display:inline;">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                    <button class="button small danger" type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </article>
    </div>
</section>
<?php include __DIR__ . '/../includes/footer.php'; ?>
