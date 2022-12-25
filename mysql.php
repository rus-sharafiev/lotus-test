<?php
header("Content-Type: application/json; charset=UTF-8");

try {
    $mysqli = new mysqli("localhost", "root", "", "lotus");
} catch (mysqli_sql_exception $e) {
    exit(json_encode(['status' => 'error', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE));
}

if (!$mysqli -> set_charset("utf8")) {
    exit();
}

$output = Array();

$query = "  SELECT
                t.id,
                JSON_ARRAYAGG(JSON_OBJECT(
                    'id',
                    t.id,
                    'name',
                    t.name, 
                    'startDate',
                    t.start_date,
                    'endDate',
                    t.end_date,
                    'requirements',
                    (
                        SELECT JSON_ARRAYAGG(r.requirements)
                        FROM (
                            SELECT DISTINCT
                                requirements.trade_id,
                                requirements.requirements
                            FROM trades
                            JOIN requirements ON trades.id = requirements.trade_id
                        ) r
                        WHERE t.id = r.trade_id
                    ),
                    'participants',
                    (
                        SELECT JSON_ARRAYAGG(JSON_OBJECT('id', p.id, 'turn', p.turn, 'name', p.name, 'bids', p.bids))
                        FROM (
                            SELECT DISTINCT
                                participants.trade_id,
                                participants.id,
                                participants.turn,
                                participants.name,
                                participants.bids
                            FROM trades
                            JOIN participants ON trades.id = participants.trade_id
                        ) p
                        WHERE t.id = p.trade_id
                    )
                ))
            FROM trades t
            GROUP BY t.id;
        ";

$result = $mysqli -> query($query);
while ($trade = $result -> fetch_column(1)) {
    echo $trade;
}

$mysqli -> close();
?>