<?php
/**
 * Enquiry form handler for mastercraftengineers.com
 *
 * Receives the POST from /contact/, validates it and e-mails it to the sales mailbox.
 * Works with the standard PHP mail() function that the current WordPress hosting already provides.
 * Set MC_MAIL_DRY_RUN=1 (local testing) to log instead of sending.
 * No secrets are stored in this file.
 */
declare(strict_types=1);

const MC_TO = 'info@mcraft.net';
const MC_FROM = 'website@mastercraftengineers.com'; // must be an address on the sending domain for good deliverability
const MC_SITE = 'https://mastercraftengineers.com';

$wantsJson = (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));

function respond(bool $ok, array $errors, bool $json, int $code = 200): never {
    if ($json) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok, 'errors' => (object)$errors]);
    } else {
        $to = $ok ? '/contact/thank-you/' : '/contact/?error=1#enquiry';
        header('Location: ' . $to, true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Please use the enquiry form at /contact/.';
    exit;
}

// Same-origin check where the browser supplies it
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$hostOnly = static fn (string $h): string => strtolower(preg_replace('/:\d+$/', '', $h));
if ($origin !== '' && $hostOnly((string)parse_url($origin, PHP_URL_HOST)) !== $hostOnly($_SERVER['HTTP_HOST'] ?? '')) {
    respond(false, ['form' => 'Request rejected.'], $wantsJson, 403);
}

$clean = static function (string $v, int $max): string {
    $v = trim(str_replace(["\r", "\0"], '', $v));
    return mb_substr($v, 0, $max);
};
$oneLine = static fn (string $v): string => trim(preg_replace('/[\r\n\t]+/', ' ', $v));

$name = $oneLine($clean((string)($_POST['name'] ?? ''), 120));
$email = $oneLine($clean((string)($_POST['email'] ?? ''), 160));
$company = $oneLine($clean((string)($_POST['company'] ?? ''), 160));
$phone = $oneLine($clean((string)($_POST['phone'] ?? ''), 40));
$type = $oneLine($clean((string)($_POST['type'] ?? ''), 80));
$message = $clean((string)($_POST['message'] ?? ''), 5000);

// Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true, [], $wantsJson);
}
// Time trap: if the page stamped a start time and the form was sent implausibly fast, treat as a bot.
$started = (int)($_POST['started'] ?? 0);
if ($started > 0 && (time() * 1000 - $started) < 2500) {
    respond(true, [], $wantsJson);
}

$errors = [];
if ($name === '') $errors['name'] = 'Please enter your name.';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
if ($company === '') $errors['company'] = 'Please enter your company name.';
if ($phone !== '' && !preg_match('/^[0-9+()\-\s.]{6,40}$/', $phone)) $errors['phone'] = 'Please enter a valid phone number, or leave it blank.';
if (mb_strlen($message) < 10) $errors['message'] = 'Please describe your requirement (at least a sentence).';
if ($errors) respond(false, $errors, $wantsJson, 422);

$subject = 'Website enquiry from ' . $name . ($company !== '' ? ' (' . $company . ')' : '');
$subject = mb_encode_mimeheader(mb_substr($oneLine($subject), 0, 200), 'UTF-8', 'B', "\r\n");
$body = "New enquiry from " . MC_SITE . "\r\n\r\n"
    . "Name: $name\r\nCompany: $company\r\nEmail: $email\r\nPhone: " . ($phone ?: '-') . "\r\nNeed: " . ($type ?: '-') . "\r\n\r\n"
    . "Project details:\r\n$message\r\n";
$safeName = str_replace(['"', '<', '>', ','], '', $name);
$headers = [
    'From: Mastercraft website <' . MC_FROM . '>',
    'Reply-To: ' . $safeName . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: mastercraft-contact-form',
];

if (getenv('MC_MAIL_DRY_RUN')) {
    file_put_contents(sys_get_temp_dir() . '/mastercraft-mail.log', "TO: " . MC_TO . "\nSUBJECT: $subject\n" . implode("\n", $headers) . "\n\n$body\n---\n", FILE_APPEND);
    respond(true, [], $wantsJson);
}

$sent = mail(MC_TO, $subject, $body, implode("\r\n", $headers));
if (!$sent) {
    error_log('mastercraft contact form: mail() failed');
    respond(false, ['form' => 'We could not send your enquiry just now. Please email ' . MC_TO . ' or call +91-80-27839712.'], $wantsJson, 500);
}
respond(true, [], $wantsJson);
