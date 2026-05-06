<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!extension_loaded('mysqli')) {
    die('The mysqli PHP extension is required but not available.');
}

$host = 'localhost';
$db   = 'legal_system';
$user = 'root';
$pass = '';

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    die('Database connection failed: ' . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');

if (!function_exists('escape')) {
    function escape($value) {
        global $mysqli;
        if (!($mysqli instanceof mysqli)) {
            return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
        }
        return htmlspecialchars(trim($mysqli->real_escape_string($value)), ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('is_logged_in')) {
    function is_logged_in() {
        return !empty($_SESSION['user_id']);
    }
}

if (!function_exists('require_login')) {
    function require_login() {
        if (!is_logged_in()) {
            header('Location: /index.php');
            exit;
        }
    }
}

if (!function_exists('require_role')) {
    function require_role($roles) {
        if (!is_array($roles)) {
            $roles = [$roles];
        }
        if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $roles)) {
            header('Location: /index.php');
            exit;
        }
    }
}

if (!function_exists('get_current_user')) {
    function get_current_user() {
        global $mysqli;
        if (empty($_SESSION['user_id'])) {
            return null;
        }

        $stmt = $mysqli->prepare('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1');
        if (!$stmt) {
            return null;
        }

        $stmt->bind_param('i', $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : null;
    }
}

if (!function_exists('flash_message')) {
    function flash_message($message, $type = 'success') {
        $_SESSION['flash'] = ['message' => $message, 'type' => $type];
    }
}

if (!function_exists('show_flash')) {
    function show_flash() {
        if (!empty($_SESSION['flash'])) {
            $flash = $_SESSION['flash'];
            unset($_SESSION['flash']);
            echo '<div class="flash-message ' . ($flash['type'] === 'error' ? 'flash-error' : 'flash-success') . '">' . htmlspecialchars($flash['message']) . '</div>';
        }
    }
}
