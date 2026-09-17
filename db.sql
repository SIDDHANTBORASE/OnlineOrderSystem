CREATE DATABASE IF NOT EXISTS food_ordering
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE food_ordering;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(60) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
        NOT NULL DEFAULT 'PLACED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

INSERT INTO menu_items (name, description, category, price)
SELECT 'Masala Dosa', 'Crispy dosa with potato masala and chutney', 'South Indian', 120.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Masala Dosa');

INSERT INTO menu_items (name, description, category, price)
SELECT 'Paneer Butter Masala', 'Paneer in a rich tomato and butter gravy', 'North Indian', 240.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Paneer Butter Masala');

INSERT INTO menu_items (name, description, category, price)
SELECT 'Veg Biryani', 'Fragrant basmati rice with seasonal vegetables', 'Rice & Biryani', 220.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Veg Biryani');

INSERT INTO menu_items (name, description, category, price)
SELECT 'Chole Bhature', 'Spiced chickpeas with two fluffy bhaturas', 'North Indian', 160.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chole Bhature');

INSERT INTO menu_items (name, description, category, price)
SELECT 'Mango Lassi', 'Chilled sweet mango yoghurt drink', 'Beverage', 90.00
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mango Lassi');