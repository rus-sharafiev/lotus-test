<?php session_start();
header("Content-Type: application/json; charset=UTF-8");

try {
    $mysqli = new mysqli("localhost", "root", "", "lotus");
} catch (mysqli_sql_exception $e) {
    exit(json_encode(['status' => 'error', 'error' => $e -> getMessage()], JSON_UNESCAPED_UNICODE));
}

if (!$mysqli -> set_charset("utf8")) {
    exit();
}

$query = "  DROP EVENT IF EXISTS timer;
            CREATE EVENT timer
            ON SCHEDULE
                EVERY 2 MINUTE
            DO
                BEGIN
                    UPDATE participants SET active_turn = 0;
                    UPDATE participants SET active_turn = 1 WHERE turn_ends = (SELECT MIN(turn_ends) FROM (SELECT * FROM participants) AS p);
                    UPDATE participants SET turn_ends = CURRENT_TIMESTAMP() + INTERVAL 2 MINUTE WHERE turn_ends = (SELECT MIN(turn_ends) FROM (SELECT * FROM participants) AS p);
                END";

if ($mysqli -> multi_query($query) === TRUE) {
    echo json_encode(['status' => 'send'], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['status' => 'error'], JSON_UNESCAPED_UNICODE);
}

$mysqli -> close();
?>