<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /index.php');
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if (empty($email) || empty($password)) {
    flash_message('Please fill in both fields.', 'error');
    header('Location: /index.php');
    exit;
}

$stmt = $mysqli->prepare('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    flash_message('Invalid email or password.', 'error');
    header('Location: /index.php');
    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['name'] = $user['name'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];

switch ($user['role']) {
    case 'admin':
        header('Location: /admin/dashboard.php');
        break;
    case 'staff':
        header('Location: /staff/dashboard.php');
        break;
    case 'lawyer':
        header('Location: /lawyer/dashboard.php');
        break;
    default:
        header('Location: /index.php');
}
exit;
