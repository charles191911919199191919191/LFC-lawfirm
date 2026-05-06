<?php
require_once __DIR__ . '/../includes/auth_check.php';
protect_page('admin');
require_once __DIR__ . '/../config/database.php';

$threshold = 5;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $threshold = (int) $_POST['threshold'];
    if ($threshold < 1) {
        $threshold = 5;
        flash_message('Threshold must be a positive number.', 'error');
    } else {
        flash_message('System threshold updated in session. Restart will apply default if not saved.');
    }
}
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../includes/sidebar.php'; ?>
<section class="content-panel">
    <h1>System Settings</h1>
    <?php show_flash(); ?>
    <article class="card">
        <h2>Priority and overload configuration</h2>
        <form method="post" class="form-card">
            <label>Overload threshold (appointments per lawyer per day)</label>
            <input type="number" name="threshold" value="<?php echo htmlspecialchars($threshold); ?>" min="1">
            <p class="field-note">This value is used in predictive conflict detection. Recommended 5 to 6 appointments per day.</p>
            <button class="button" type="submit">Update Threshold</button>
        </form>
    </article>
    <article class="card">
        <h2>Security</h2>
        <p>All pages are protected by PHP sessions. Password hashing uses bcrypt, and role-based redirects ensure secure access.</p>
    </article>
</section>
<?php include __DIR__ . '/../includes/footer.php'; ?>
