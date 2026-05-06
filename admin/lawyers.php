<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('admin');
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        $name = escape($_POST['name']);
        $email = escape($_POST['email']);
        $specialization = escape($_POST['specialization']);
        $phone = escape($_POST['phone']);
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $role = 'lawyer';
        $stmt = $mysqli->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $name, $email, $password, $role);
        $stmt->execute();
        $userId = $mysqli->insert_id;
        $stmt = $mysqli->prepare('INSERT INTO lawyers (user_id, phone, specialization) VALUES (?, ?, ?)');
        $stmt->bind_param('iss', $userId, $phone, $specialization);
        $stmt->execute();
        flash_message('Lawyer profile created.');
        header('Location: /admin/lawyers.php');
        exit;
    }
    if ($action === 'toggle' && !empty($_POST['lawyer_id'])) {
        $lawyerId = (int) $_POST['lawyer_id'];
        $stmt = $mysqli->prepare('UPDATE lawyers SET active = 1 - active WHERE id = ?');
        $stmt->bind_param('i', $lawyerId);
        $stmt->execute();
        flash_message('Lawyer status updated.');
        header('Location: /admin/lawyers.php');
        exit;
    }
}

$lawyers = $mysqli->query('SELECT l.id, u.name, u.email, l.phone, l.specialization, l.active, u.created_at FROM lawyers l JOIN users u ON l.user_id = u.id ORDER BY u.name ASC');
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>Lawyer Profiles</h1>
    <?php show_flash(); ?>
    <div class="grid two-col">
        <article class="card">
            <h2>Add Lawyer</h2>
            <form method="post" class="form-card">
                <input type="hidden" name="action" value="add">
                <label>Name</label>
                <input type="text" name="name" required>
                <label>Email</label>
                <input type="email" name="email" required>
                <label>Password</label>
                <input type="password" name="password" required>
                <label>Specialization</label>
                <input type="text" name="specialization" required>
                <label>Phone</label>
                <input type="text" name="phone" required>
                <button class="button" type="submit">Create Lawyer</button>
            </form>
        </article>
        <article class="card">
            <h2>Lawyers</h2>
            <table>
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <?php while ($row = $lawyers->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row['name']); ?></td>
                            <td><?php echo htmlspecialchars($row['email']); ?></td>
                            <td><?php echo htmlspecialchars($row['specialization']); ?></td>
                            <td><?php echo $row['active'] ? 'Active' : 'Inactive'; ?></td>
                            <td>
                                <form method="post" style="display:inline;">
                                    <input type="hidden" name="action" value="toggle">
                                    <input type="hidden" name="lawyer_id" value="<?php echo $row['id']; ?>">
                                    <button class="button small" type="submit"><?php echo $row['active'] ? 'Deactivate' : 'Activate'; ?></button>
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
