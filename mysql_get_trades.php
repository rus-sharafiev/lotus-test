<?php
header("Content-Type: application/json; charset=UTF-8");

try {
    $mysqli = new mysqli("localhost", "root", "", "lotus");
} catch (mysqli_sql_exception $e) {
    exit(json_encode(['status' => 'error', 'error' => $e -> getMessage()], JSON_UNESCAPED_UNICODE));
}

if (!$mysqli -> set_charset("utf8")) {
    exit();
}

$id = $_GET['id'] ?? NULL;
if ( $id === NULL ) { $and_id = ''; } else { $and_id = 'AND t.id = ' . $id; }

$query = "  SELECT
                JSON_ARRAYAGG(JSON_OBJECT(
                    'id',
                    t.id,
                    'name',
                    t.name, 
                    'startDate',
                    t.start,
                    'endDate',
                    t.end,
                    'requirements',
                    t.requirements,
                    'participants',
                    (
                        SELECT JSON_ARRAYAGG(JSON_OBJECT('id', p.id, 'activeTurn', p.active_turn, 'turnEnds', p.turn_ends, 'name', p.name, 'bids', p.bids))
                        FROM (
                            SELECT DISTINCT
                                participants.trade_id,
                                participants.id,
                                participants.active_turn,
                                participants.turn_ends,
                                participants.name,
                                participants.bids
                            FROM trades
                            JOIN participants ON trades.id = participants.trade_id
                        ) p
                        WHERE t.id = p.trade_id
                    )
                )),
                t.active
            FROM trades t
            WHERE t.active = 1 $and_id
            GROUP BY t.active;
        ";

$result = $mysqli -> query($query);
while ($trade = $result -> fetch_column(0)) {
    echo $trade;
}

$mysqli -> close();
?>