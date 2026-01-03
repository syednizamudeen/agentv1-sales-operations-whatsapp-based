-- 1. Create a table for Inventory/Products
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    price DECIMAL(10,2),
    stock_count INTEGER
);

-- 2. Create a table for Guest Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    guest_name TEXT NOT NULL,
    item_purchased TEXT NOT NULL,
    status TEXT DEFAULT 'Processing',
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add some sample data so the AI has something to find
INSERT INTO inventory (item_name, price, stock_count) VALUES 
('Gourmet Coffee Bean', 25.00, 50),
('Ceramic Mug', 12.50, 100);

INSERT INTO orders (guest_name, item_purchased, status) VALUES 
('John Wick', 'Gourmet Coffee Bean', 'Shipped'),
('Alice Smith', 'Ceramic Mug', 'Delivered');

-- 4. Create a table for chat history (unique per chat)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255),
    message TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);