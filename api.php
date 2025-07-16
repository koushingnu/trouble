<?php
// CORS対応
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit();
}

header("Content-Type: application/json; charset=UTF-8");

// Basic認証
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== 'm' || $_SERVER['PHP_AUTH_PW'] !== 'm') {
    header('WWW-Authenticate: Basic realm="Admin Area"');
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(["error" => "認証が必要です"]);
    exit();
}

// DB接続情報
$host = 'mysql80.ttsv.sakura.ne.jp';
$db   = 'ttsv_koushin';
$user = 'ttsv_koushin';
$pass = 'Koushin1022';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB接続エラー"]);
    exit();
}

// POSTリクエストのボディを取得
$input = json_decode(file_get_contents('php://input'), true);
if (!$input && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = $_POST; // フォームデータの場合
}

// 認証エンドポイント（POST /api.php?action=authenticate）
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'authenticate') {
    // デバッグ: リクエストの内容をログに記録
    error_log('Raw input: ' . file_get_contents('php://input'));
    error_log('Content-Type: ' . $_SERVER['CONTENT_TYPE']);
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input && $_SERVER['CONTENT_TYPE'] === 'application/x-www-form-urlencoded') {
        $input = $_POST;
    }
    
    // デバッグ: 処理後の入力データをログに記録
    error_log('Processed input: ' . print_r($input, true));
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "メールアドレスとパスワードは必須です",
            "debug" => [
                "input" => $input,
                "email_exists" => isset($input['email']),
                "password_exists" => isset($input['password'])
            ]
        ]);
        exit();
    }

    try {
        // ユーザー情報を取得
        $stmt = $pdo->prepare("
            SELECT u.*, t.token_value, t.status as token_status, 
                   CASE WHEN u.is_admin = 1 THEN true ELSE false END as is_admin
            FROM users u
            LEFT JOIN tokens t ON u.token_id = t.id
            WHERE u.email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "error" => "ユーザーが見つかりません"
            ]);
            exit();
        }

        // パスワードを検証
        if (!password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "error" => "パスワードが正しくありません"
            ]);
            exit();
        }

        // アクセスログを記録
        $logStmt = $pdo->prepare("INSERT INTO access_logs (user_id, event) VALUES (?, ?)");
        $logStmt->execute([$user['id'], 'user_authenticated']);

        // レスポンスからパスワードハッシュを除外
        unset($user['password']);

        echo json_encode([
            "success" => true,
            "user" => $user
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "認証エラー",
            "message" => $e->getMessage()
        ]);
        error_log($e->getMessage());
    }
    exit();
}

// トークン生成（POST /api.php?action=generate_tokens）
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'generate_tokens') {
    $input = json_decode(file_get_contents('php://input'), true);
    $count = isset($input['count']) ? intval($input['count']) : 100;
    
    // 生成数の制限チェック
    if ($count < 1 || $count > 10000) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "生成数は1から10000の間で指定してください"
        ]);
        exit();
    }

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO tokens (token_value, status) 
            VALUES (?, 'unused')
        ");
        
        $generatedTokens = [];
        
        for ($i = 0; $i < $count; $i++) {
            // UUID形式のトークンを生成
            $tokenValue = sprintf(
                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            
            $stmt->execute([$tokenValue]);
            $generatedTokens[] = $tokenValue;
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "{$count}個のトークンを生成しました",
            'tokens' => $generatedTokens
        ]);

    } catch (Exception $e) {
        if (isset($pdo)) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => "トークン生成エラー",
            'message' => $e->getMessage()
        ]);
        error_log($e->getMessage());
    }
    exit();
}

// 新規ユーザー登録（POST /api.php）
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $token = $input['token'] ?? '';

    if (!$email || !$password || !$token) {
        http_response_code(400);
        echo json_encode(["error" => "メールアドレス、パスワード、トークンは必須です"]);
        exit();
    }

    // トークンの検証
    $tokenStmt = $pdo->prepare("
        SELECT id, status 
        FROM tokens 
        WHERE token_value = ? 
        AND status = 'unused' 
        AND assigned_to IS NULL
    ");
    $tokenStmt->execute([$token]);
    $tokenData = $tokenStmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        http_response_code(400);
        echo json_encode(["error" => "無効なトークンです"]);
        exit();
    }

    // メールアドレスの重複チェック
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["error" => "このメールアドレスは既に登録されています"]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // パスワードをハッシュ化してユーザーを作成
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, token_id) VALUES (?, ?, ?)");
        if ($stmt->execute([$email, $hashedPassword, $tokenData['id']])) {
            $userId = $pdo->lastInsertId();
            
            // トークンを有効化してユーザーに割り当て
            $updateTokenStmt = $pdo->prepare("
                UPDATE tokens 
                SET status = 'active', 
                    assigned_to = ? 
                WHERE id = ?
            ");
            $updateTokenStmt->execute([$userId, $tokenData['id']]);
            
            // アクセスログを記録
            $logStmt = $pdo->prepare("INSERT INTO access_logs (user_id, event) VALUES (?, ?)");
            $logStmt->execute([$userId, 'user_created']);

            $pdo->commit();
            
            echo json_encode([
                "message" => "ユーザーを作成しました",
                "id" => $userId
        ]);
    } else {
            throw new Exception("登録に失敗しました");
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "登録エラー"]);
        error_log($e->getMessage());
    }
    exit();
}

// トークン一覧取得
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'list_tokens') {
    try {
        $stmt = $pdo->query("
            SELECT t.*, u.email as user_email
            FROM tokens t
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.id ASC
        ");
        $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'data' => $tokens
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => "トークン一覧の取得に失敗しました",
            'message' => $e->getMessage()
        ]);
        error_log($e->getMessage());
    }
    exit();
}

// GET（id指定あり：1件だけ返す）
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    try {
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.token_id, u.created_at, t.token_value, t.status
            FROM users u
            LEFT JOIN tokens t ON u.token_id = t.id
            WHERE u.id = ?
        ");
    $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // アクセスログを記録
            $logStmt = $pdo->prepare("INSERT INTO access_logs (user_id, event) VALUES (?, ?)");
            $logStmt->execute([$id, 'user_viewed']);
            
            echo json_encode($user);
    } else {
        http_response_code(404);
            echo json_encode(["error" => "ユーザーが見つかりません"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "ユーザー情報の取得に失敗しました"]);
        error_log($e->getMessage());
    }
    exit();
}

// GET（全件取得）
try {
    $stmt = $pdo->query("
        SELECT u.id, u.email, u.token_id, u.created_at, t.token_value, t.status
        FROM users u
        LEFT JOIN tokens t ON u.token_id = t.id
        ORDER BY u.id ASC
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "ユーザー一覧の取得に失敗しました"]);
    error_log($e->getMessage());
}
?>