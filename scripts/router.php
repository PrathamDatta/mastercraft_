<?php
// Local dev router for `php -S`: serves dist/ like Apache would (404.html on miss).
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . '/../dist' . $path;
if ($path !== '/' && is_dir($file) && substr($path, -1) !== '/') { header('Location: ' . $path . '/', true, 301); exit; }
if (is_file($file) || (is_dir($file) && is_file(rtrim($file, '/') . '/index.html'))) { return false; }
http_response_code(404);
readfile(__DIR__ . '/../dist/404.html');
