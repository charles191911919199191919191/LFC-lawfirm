<?php
require_once __DIR__ . '/../config/database.php';

function protect_page($roles = null) {
    require_login();
    if ($roles !== null) {
        require_role($roles);
    }
}

function user_name() {
    return isset($_SESSION['name']) ? htmlspecialchars($_SESSION['name']) : 'Guest';
}

function user_role() {
    return isset($_SESSION['role']) ? htmlspecialchars($_SESSION['role']) : 'guest';
}
