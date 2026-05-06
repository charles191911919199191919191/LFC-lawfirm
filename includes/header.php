<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Legal Case Management System</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/assets/js/main.js" defer></script>
</head>
<body>
<div class="page-shell">
    <header class="topbar">
        <div class="brand">LFC Law Firm Case System</div>
        <div class="topbar-right">
            <?php if (!empty($_SESSION['name'])): ?>
                <span>Welcome, <?php echo htmlspecialchars($_SESSION['name']); ?></span>
                <a class="button small" href="/auth/logout.php">Logout</a>
            <?php endif; ?>
        </div>
    </header>
    <main class="main-layout">
