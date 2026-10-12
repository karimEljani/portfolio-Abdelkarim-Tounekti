<?php
// === Backend facultatif (hébergement PHP) : permet de modifier le portfolio EN LIGNE ===
// 1) Changez le mot de passe ci-dessous. 2) Rendez les dossiers data/ et uploads/ inscriptibles (chmod 755/775).
// 3) Ouvrez votre site avec  ?admin  à la fin de l'adresse (ex. https://monsite.com/?admin).
const PASSWORD = 'changeme';
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict']);
session_start();
header('Content-Type: application/json; charset=utf-8');
$a = $_GET['action'] ?? '';
$ok = !empty($_SESSION['admin']);
if ($a === 'ping') { echo json_encode(['ok' => 1, 'admin' => $ok]); exit; }
if ($a === 'login') {
  $d = json_decode(file_get_contents('php://input'), true);
  if (hash_equals(PASSWORD, (string)($d['password'] ?? ''))) { session_regenerate_id(true); $_SESSION['admin'] = 1; echo '{"ok":1}'; }
  else { usleep(700000); http_response_code(401); echo '{"ok":0}'; }
  exit;
}
if (!$ok) { http_response_code(401); echo '{"error":"auth"}'; exit; }
if ($a === 'save') {
  $arr = json_decode(file_get_contents('php://input'), true);
  if (!is_array($arr)) { http_response_code(400); echo '{"error":"json"}'; exit; }
  $js = 'window.PORTFOLIO=' . json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';';
  echo file_put_contents(__DIR__ . '/data/projects.js', $js) === false ? '{"error":"write"}' : '{"ok":1}';
  exit;
}
if ($a === 'upload' && isset($_FILES['file'])) {
  $f = $_FILES['file'];
  $i = @getimagesize($f['tmp_name']);
  if (!$i || !in_array($i[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP]) || $f['size'] > 8e6) { http_response_code(400); echo '{"error":"image"}'; exit; }
  $name = 'uploads/' . bin2hex(random_bytes(8)) . '.jpg';
  echo move_uploaded_file($f['tmp_name'], __DIR__ . '/' . $name) ? json_encode(['url' => $name]) : '{"error":"write"}';
  exit;
}
if ($a === 'logout') { session_destroy(); echo '{"ok":1}'; exit; }
http_response_code(400); echo '{"error":"action"}';
