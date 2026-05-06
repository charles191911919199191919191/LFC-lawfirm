<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('admin');
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        $name = escape($_POST['name']);
        $email = escape($_POST['email']);
        $role = in_array($_POST['role'], ['staff', 'lawyer']) ? $_POST['role'] : 'staff';
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
        $stmt = $mysqli->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $name, $email, $password, $role);
        $stmt->execute();
        flash_message('New user added successfully.');
        header('Location: /admin/users.php');
        exit;
    }
    if ($action === 'delete' && !empty($_POST['user_id'])) {
        $userId = (int) $_POST['user_id'];
        $stmt = $mysqli->prepare('DELETE FROM users WHERE id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        flash_message('User deleted successfully.');
        header('Location: /admin/users.php');
        exit;
    }
}

$users = $mysqli->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>User Management</h1>
    <?php show_flash(); ?>
    <div class="grid two-col">
        <article class="card">
            <h2>Add User</h2>
            <form method="post" class="form-card">
                <input type="hidden" name="action" value="add">
                <label>Name</label>
                <input type="text" name="name" required>
                <label>Email</label>
                <input type="email" name="email" required>
                <label>Password</label>
                <input type="password" name="password" required>
                <label>Role</label>
                <select name="role">
                    <option value="staff">Staff</option>
                    <option value="lawyer">Lawyer</option>
                </select>
                <button class="button" type="submit">Create User</button>
            </form>
        </article>
        <article class="card">
            <h2>Existing Users</h2>
            <table>
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <?php while ($row = $users->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row['name']); ?></td>
                            <td><?php echo htmlspecialchars($row['email']); ?></td>
                            <td><?php echo htmlspecialchars($row['role']); ?></td>
                            <td><?php echo htmlspecialchars($row['created_at']); ?></td>
                            <td>
                                <?php if ($row['id'] !== $_SESSION['user_id']): ?>
                                    <form method="post" style="display:inline;">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="user_id" value="<?php echo $row['id']; ?>">
                                        <button type="submit" class="button small danger">Delete</button>
                                    </form>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </article>
    </div>
</section>
<?php include __DIR__ . '/../includes/footer.php'; ?>
