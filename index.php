<?php
require_once __DIR__ . '/config/database.php';
if (is_logged_in()) {
    $redirect = '/index.php';
    switch ($_SESSION['role']) {
        case 'admin': $redirect = '/admin/dashboard.php'; break;
        case 'staff': $redirect = '/staff/dashboard.php'; break;
        case 'lawyer': $redirect = '/lawyer/dashboard.php'; break;
    }
    header('Location: ' . $redirect);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - LFC Law Firm</title>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="login-page">
    <div class="login-card">
        <h1>Law Firm Login</h1>
        <?php if (!empty($_SESSION['flash'])): ?>
            <?php show_flash(); ?>
        <?php endif; ?>
        <form action="/auth/login.php" method="post" class="form-card">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required>
            <label for="password">Password</label>
            <input type="password" name="password" id="password" required>
            <button type="submit" class="button">Login</button>
        </form>
        <div class="login-note">
            <p>Sample credentials:</p>
            <p>Admin: admin@lawfirm.local / password123</p>
            <p>Staff: staff@lawfirm.local / password123</p>
            <p>Lawyer: lawyer1@lawfirm.local / password123</p>
        </div>
    </div>
</body>
</html>
