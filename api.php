<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

try {
    $db = database();
    $action = $_GET['action'] ?? '';

    if ($action === 'menu') {
        $query = $db->query(
            'SELECT id, name, description, category, price
             FROM menu_items
             WHERE available = 1
             ORDER BY category, id'
        );

        echo json_encode([
            'success' => true,
            'items' => $query->fetchAll(),
        ]);
        exit;
    }

    if ($action === 'order') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Only POST requests are allowed.']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        validateOrder($input);

        $db->beginTransaction();
        $total = 0.0;
        $pricedItems = [];
        $menuQuery = $db->prepare(
            'SELECT id, name, price
             FROM menu_items
             WHERE id = ? AND available = 1'
        );

        foreach ($input['items'] as $item) {
            $menuQuery->execute([(int) $item['menu_item_id']]);
            $menuItem = $menuQuery->fetch();
            if (!$menuItem) {
                throw new RuntimeException('One of the selected menu items is unavailable.');
            }

            $quantity = (int) $item['quantity'];
            $unitPrice = (float) $menuItem['price'];
            $total += $unitPrice * $quantity;
            $pricedItems[] = [
                'id' => (int) $menuItem['id'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        $orderQuery = $db->prepare(
            'INSERT INTO orders (customer_name, customer_phone, delivery_address, total_amount)
             VALUES (?, ?, ?, ?)'
        );
        $orderQuery->execute([
            trim($input['customer_name']),
            trim($input['customer_phone']),
            trim($input['delivery_address']),
            number_format($total, 2, '.', ''),
        ]);
        $orderId = (int) $db->lastInsertId();

        $itemQuery = $db->prepare(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
             VALUES (?, ?, ?, ?)'
        );
        foreach ($pricedItems as $item) {
            $itemQuery->execute([
                $orderId,
                $item['id'],
                $item['quantity'],
                number_format($item['unit_price'], 2, '.', ''),
            ]);
        }

        $db->commit();
        echo json_encode([
            'success' => true,
            'order_id' => $orderId,
            'total' => number_format($total, 2, '.', ''),
        ]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Unknown API action.']);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'The request could not be completed.',
    ]);
}

function validateOrder(?array $input): void
{
    if (!$input
        || trim($input['customer_name'] ?? '') === ''
        || trim($input['customer_phone'] ?? '') === ''
        || trim($input['delivery_address'] ?? '') === ''
        || !isset($input['items'])
        || !is_array($input['items'])
        || count($input['items']) === 0) {
        throw new InvalidArgumentException('Please provide delivery details and at least one item.');
    }

    foreach ($input['items'] as $item) {
        if (!isset($item['menu_item_id'], $item['quantity'])
            || (int) $item['menu_item_id'] < 1
            || (int) $item['quantity'] < 1
            || (int) $item['quantity'] > 99) {
            throw new InvalidArgumentException('Each order item must have a valid quantity.');
        }
    }
}